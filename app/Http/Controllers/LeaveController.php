<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\User;
use App\Traits\LogsActivity;
use App\Traits\CreatesNotifications;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeaveController extends Controller
{
    use LogsActivity, CreatesNotifications;

    /**
     * Get all leaves with statistics (shared method for dashboard)
     * 
     * @return array ['leaves' => Collection, 'statistics' => array]
     */
    public static function getAllLeavesWithStatistics()
    {
        $allLeaves = Leave::with(['user.manager', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Calculate statistics from all leaves
        $statistics = [
            'pending' => $allLeaves->where('status', 'pending')->count(),
            'approved' => $allLeaves->where('status', 'approved')->count(),
            'rejected' => $allLeaves->where('status', 'rejected')->count(),
            'cancelled' => $allLeaves->where('status', 'cancelled')->count(),
        ];
        
        return [
            'leaves' => $allLeaves,
            'statistics' => $statistics,
        ];
    }

    /**
     * Get calendar leaves (approved leaves formatted for FullCalendar)
     * 
     * @param \App\Models\User|null $user Optional user for filtering (manager sees team, teacher sees own only)
     * @return array
     */
    public static function getCalendarLeaves($user = null)
    {
        $query = Leave::with(['user.manager', 'reviewer'])
            ->where('status', 'approved');
        
        // If user is a manager, filter to team only
        if ($user && $user->role === 'manager') {
            $query->whereHas('user', function($q) use ($user) {
                $q->where('manager_id', $user->id);
            });
        } elseif ($user && $user->role === 'teacher') {
            // Teachers see only their own leaves
            $query->where('user_id', $user->id);
        }
        
        $allLeaves = $query->orderBy('start_date', 'asc')->get();
        
        return $allLeaves->map(function ($leave) {
            return [
                'id' => $leave->id,
                'user_id' => $leave->user_id,
                'user_name' => $leave->user->name ?? '',
                'user' => ['name' => $leave->user->name ?? ''],
                'category' => $leave->category,
                'start_date' => $leave->start_date->format('Y-m-d'),
                'end_date' => $leave->end_date->format('Y-m-d'),
                'days_requested' => $leave->days_requested,
                'status' => $leave->status,
            ];
        })->values()->toArray();
    }

    /**
     * Get team leaves with statistics (for manager dashboard)
     * 
     * @param \App\Models\User $manager
     * @return array ['leaves' => Collection, 'statistics' => array]
     */
    public static function getTeamLeavesWithStatistics($manager)
    {
        // Managers can only see their subordinates' leaves
        $allLeaves = Leave::with(['user.manager', 'reviewer'])
            ->whereHas('user', function($q) use ($manager) {
                $q->where('manager_id', $manager->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Calculate statistics from team leaves
        $statistics = [
            'pending' => $allLeaves->where('status', 'pending')->count(),
            'approved' => $allLeaves->where('status', 'approved')->count(),
            'rejected' => $allLeaves->where('status', 'rejected')->count(),
            'cancelled' => $allLeaves->where('status', 'cancelled')->count(),
        ];
        
        return [
            'leaves' => $allLeaves,
            'statistics' => $statistics,
        ];
    }

    /**
     * Get user's own leaves with statistics (for teacher/user dashboard)
     * 
     * @param \App\Models\User $user
     * @return array ['leaves' => Collection, 'statistics' => array]
     */
    public static function getUserLeavesWithStatistics($user)
    {
        // Users can only see their own leaves
        $allLeaves = $user->leaves()
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Calculate statistics from user's leaves
        $statistics = [
            'pending' => $allLeaves->where('status', 'pending')->count(),
            'approved' => $allLeaves->where('status', 'approved')->count(),
            'rejected' => $allLeaves->where('status', 'rejected')->count(),
            'cancelled' => $allLeaves->where('status', 'cancelled')->count(),
        ];
        
        return [
            'leaves' => $allLeaves,
            'statistics' => $statistics,
        ];
    }

    /**
     * Display a listing of the user's leaves.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = $user->leaves();

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('start_date_from')) {
            $query->where('start_date', '>=', $request->start_date_from);
        }

        if ($request->filled('start_date_to')) {
            $query->where('start_date', '<=', $request->start_date_to);
        }

        if ($request->filled('created_from')) {
            $query->where('created_at', '>=', $request->created_from);
        }

        if ($request->filled('created_to')) {
            $query->where('created_at', '<=', $request->created_to);
        }

        $leaves = $query->orderBy('created_at', 'desc')->get();

        // Calculate actual remaining leaves dynamically
        $user->remaining_leaves_current_year = $user->calculateRemainingLeaves();

        return inertia('Leaves/Index', [
            'leaves' => $leaves,
            'user' => $user,
            'filters' => $request->only(['status', 'category', 'start_date_from', 'start_date_to', 'created_from', 'created_to'])
        ]);
    }

    /**
     * Show the form for creating a new leave request.
     */
    public function create(Request $request)
    {
        $currentUser = Auth::user();
        
        // Check if creating leave for another user
        if ($request->has('user_id')) {
            $targetUser = User::findOrFail($request->user_id);
            
            // If the user_id refers to the current user, treat it as normal leave request
            if ($targetUser->id === $currentUser->id) {
                $user = $currentUser;
            } else {
                // Check permissions for creating leave for someone else
                if ($currentUser->role === 'admin') {
                    // Admins can create leave for any active user
                    if (!$targetUser->is_active) {
                        abort(403, 'Nem lehet szabadság kérelmet létrehozni deaktivált felhasználó számára.');
                    }
                } elseif ($currentUser->role === 'manager') {
                    // Managers can only create leave for their subordinates
                    if ($targetUser->role !== 'teacher' || $targetUser->manager_id !== $currentUser->id) {
                        abort(403, 'Nincs jogosultságod szabadságot kiírni ennek a felhasználónak.');
                    }
                } else {
                    // Teachers cannot create leave for others
                    abort(403, 'Nincs jogosultságod szabadságot kiírni más felhasználók számára.');
                }
                
                $user = $targetUser;
            }
        } else {
            $user = $currentUser;
        }
        
        // Calculate actual remaining leaves dynamically
        $user->remaining_leaves_current_year = $user->calculateRemainingLeaves();

        return inertia('Leaves/Create', [
            'user' => $user,
            'isCreatingForOther' => $request->has('user_id') && $user->id !== $currentUser->id,
            'currentUser' => $currentUser
        ]);
    }

    /**
     * Store a newly created leave request.
     */
    public function store(Request $request)
    {
        $currentUser = Auth::user();
        
        // Check if creating leave for another user
        if ($request->has('user_id')) {
            $targetUser = User::findOrFail($request->user_id);
            
            // If the user_id refers to the current user, treat it as normal leave request
            if ($targetUser->id === $currentUser->id) {
                $user = $currentUser;
            } else {
                // Check permissions for creating leave for someone else
                if ($currentUser->role === 'admin') {
                    // Admins can create leave for any active user
                    if (!$targetUser->is_active) {
                        abort(403, 'Nem lehet szabadság kérelmet létrehozni deaktivált felhasználó számára.');
                    }
                } elseif ($currentUser->role === 'manager') {
                    // Managers can only create leave for their subordinates
                    if ($targetUser->role !== 'teacher' || $targetUser->manager_id !== $currentUser->id) {
                        abort(403, 'Nincs jogosultságod szabadságot kiírni ennek a felhasználónak.');
                    }
                } else {
                    // Teachers cannot create leave for others
                    abort(403, 'Nincs jogosultságod szabadságot kiírni más felhasználók számára.');
                }
                
                $user = $targetUser;
            }
        } else {
            $user = $currentUser;
        }
        
        // Initialize remaining leaves if not set
        $user->initializeRemainingLeaves();

        // Check if admin/manager is creating leave for another user
        // If so, allow past dates; otherwise, enforce future-only dates
        $isCreatingForOther = $request->has('user_id') && $user->id !== $currentUser->id;
        $isAdminOrManager = in_array($currentUser->role, ['admin', 'manager']);
        $allowPastDates = $isCreatingForOther && $isAdminOrManager;

        // Build validation rules conditionally
        $validationRules = [
            'category' => 'required|in:szabadsag,betegszabadsag,tappenzt,egyeb_tavollet',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string|max:1000',
        ];

        // Only enforce future dates for regular users creating their own leaves
        if ($allowPastDates) {
            $validationRules['start_date'] = 'required|date';
        } else {
            $validationRules['start_date'] = 'required|date|after_or_equal:today';
        }

        $request->validate($validationRules, [
            'category.required' => 'A kategória kiválasztása kötelező.',
            'category.in' => 'Érvénytelen kategória.',
            'start_date.after_or_equal' => 'A kezdő dátum nem lehet a mai napnál korábbi.',
            'end_date.after_or_equal' => 'A befejező dátum nem lehet korábbi, mint a kezdő dátum.',
        ]);

        $category = $request->category;

        // Check if user is trying to request egyeb_tavollet (only admin/manager can create this)
        if ($category === Leave::CATEGORY_EGYEB_TAVOLLET) {
            // Only allow if creating for someone else (admin/manager creating for employee)
            if (!$request->has('user_id') || $user->id === $currentUser->id) {
                abort(403, 'Az "Egyéb távollét" kategória csak adminisztrátorok és menedzserek által hozható létre más felhasználók számára.');
            }
            
            // Verify the current user has permission (admin or manager)
            if (!in_array($currentUser->role, ['admin', 'manager'])) {
                abort(403, 'Nincs jogosultságod "Egyéb távollét" kategóriájú szabadságot létrehozni.');
            }
        }

        // Calculate days requested (only weekdays, excluding weekends)
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $daysRequested = Leave::calculateWeekdays($startDate, $endDate);

        // Check if only weekends/holidays are selected
        if ($daysRequested === 0) {
            // Check if it's only holidays (no weekends) or weekends/holidays
            if (Leave::containsOnlyHolidays($startDate, $endDate)) {
                return back()->withErrors([
                    'dates' => 'A szabadságigénylés nem lehet csak nemzeti ünnep. Kérjük, valós intervallumot adjon meg.'
                ]);
            } else {
                return back()->withErrors([
                    'dates' => 'A szabadságigénylés nem lehet csak hétvége. Kérjük, valós intervallumot adjon meg.'
                ]);
            }
        }

        // Only check leave balance for normal szabadsag category
        // egyeb_tavollet, betegszabadsag, and tappenzt don't count towards balance
        if ($category === Leave::CATEGORY_SZABADSAG) {
            // Calculate actual remaining leaves dynamically
            $actualRemaining = $user->calculateRemainingLeaves();

            // Check if user has enough remaining leaves
            if ($actualRemaining < $daysRequested) {
                return back()->withErrors([
                    'days' => "Nincs elég szabadság napod. Elérhető napok: {$actualRemaining}, kért napok: {$daysRequested}"
                ]);
            }
        }

        // Check for overlapping leave requests (only for same category)
        // Exclude rejected and cancelled leaves from overlap check
        $overlappingLeave = $user->leaves()
            ->where('category', $category)
            ->whereNotIn('status', ['rejected', 'cancelled'])
            ->where(function($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                      ->orWhereBetween('end_date', [$startDate, $endDate])
                      ->orWhere(function($q) use ($startDate, $endDate) {
                          $q->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                      });
            })
            ->first();

        if ($overlappingLeave) {
            $overlappingStart = Carbon::parse($overlappingLeave->start_date)->format('Y-m-d');
            $overlappingEnd = Carbon::parse($overlappingLeave->end_date)->format('Y-m-d');
            $overlappingStatus = $overlappingLeave->status === 'pending' ? 'függőben lévő' : 'jóváhagyott';
            
            // Adjust message based on who is creating the leave
            $userName = ($user->id === $currentUser->id) ? 'kérésed' : "{$user->name} kérése";
            
            return back()->withErrors([
                'dates' => "Már van egy {$overlappingStatus} szabadság {$userName} ebben az időszakban ({$overlappingStart} - {$overlappingEnd}). Kérjük, válassz más dátumokat."
            ]);
        }

        // Determine status based on who is creating the leave
        $status = ($request->has('user_id') && $user->id !== $currentUser->id) ? 'approved' : 'pending';
        
        $leave = Leave::create([
            'user_id' => $user->id,
            'category' => $category,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'days_requested' => $daysRequested,
            'reason' => $request->reason,
            'status' => $status,
            'reviewed_by' => ($status === 'approved') ? $currentUser->id : null,
            'reviewed_at' => ($status === 'approved') ? now() : null,
        ]);

        // Log the initial submission
        if ($request->has('user_id') && $user->id !== $currentUser->id) {
            // Log that the leave was created and approved by someone else
            $leave->logHistory($currentUser, 'created_for_user', null, 'approved', null, [
                'target_user' => $user->name,
                'target_user_id' => $user->id
            ]);
        } else {
            $leave->logSubmission($user);
        }

        // Days are automatically "on hold" through the dynamic calculation

        // Log the leave request
        $this->logActivity(
            'leave_requested',
            "Szabadság kérés benyújtva: {$daysRequested} nap ({$startDate->format('Y-m-d')} - {$endDate->format('Y-m-d')})",
            $user
        );

        // Create notification for manager/admin
        $manager = $user->manager;
        if ($manager) {
            $this->createNotification(
                $manager->id,
                'leave_requested',
                'Új szabadság kérés',
                "{$user->name} új szabadság kérést nyújtott be: {$daysRequested} nap ({$startDate->format('Y-m-d')} - {$endDate->format('Y-m-d')})"
            );
        }

        // Redirect based on user role and whether they created leave for someone else
        if ($request->has('user_id') && $user->id !== $currentUser->id) {
            // Created leave for someone else - redirect based on role
            if ($currentUser->role === 'admin') {
                return redirect()->route('szabadsag.osszes-kerelem')
                    ->with('success', 'Szabadság sikeresen kiírva!');
            } elseif ($currentUser->role === 'manager') {
                return redirect()->route('szabadsag.kerelmek')
                    ->with('success', 'Szabadság sikeresen kiírva!');
            }
        }
        
        // Normal leave request - redirect to personal leaves
        return redirect()->route('szabadsag.sajat-kerelmek')
            ->with('success', 'Szabadság kérés sikeresen benyújtva!');
    }

    /**
     * Display the specified leave request.
     */
    public function show(Leave $leave)
    {
        $user = Auth::user();
        
        // Check if user can view this leave
        if ($leave->user_id !== $user->id && 
            !in_array($user->role, ['manager', 'admin']) &&
            $leave->user->manager_id !== $user->id) {
            abort(403, 'Nincs jogosultságod ennek a szabadság kérésnek a megtekintéséhez.');
        }

        $leave->load(['user.manager', 'reviewer', 'history.user']);

        return inertia('Leaves/Show', [
            'leave' => $leave,
            'user' => $user
        ]);
    }

    /**
     * Approve a leave request (manager/admin only).
     */
    public function approve(Request $request, Leave $leave)
    {
        $user = Auth::user();
        
        // Check if user can approve this leave
        if (!in_array($user->role, ['manager', 'admin'])) {
            abort(403, 'Nincs jogosultságod szabadság kérések jóváhagyásához.');
        }

        if ($user->role === 'manager' && $leave->user->manager_id !== $user->id) {
            abort(403, 'Csak a saját beosztottaid szabadság kéréseit hagyhatod jóvá.');
        }

        if ($leave->status !== 'pending') {
            return back()->with('error', 'Ez a szabadság kérés már nem függőben van.');
        }

        $leave->approve($user, $request->review_notes);

        // Log the approval
        $this->logActivity(
            'leave_approved',
            "Szabadság kérés jóváhagyva: {$leave->user->name} - {$leave->days_requested} nap ({$leave->start_date->format('Y-m-d')} - {$leave->end_date->format('Y-m-d')})",
            $leave->user
        );

        // Create notification for the user
        $this->createNotification(
            $leave->user_id,
            'leave_approved',
            'Szabadság kérés jóváhagyva',
            "A szabadság kérésed jóváhagyásra került: {$leave->days_requested} nap ({$leave->start_date->format('Y-m-d')} - {$leave->end_date->format('Y-m-d')})"
        );

        return redirect()->back()
            ->with('success', 'Szabadság kérés sikeresen jóváhagyva!');
    }

    /**
     * Reject a leave request (manager/admin only).
     */
    public function reject(Request $request, Leave $leave)
    {
        $user = Auth::user();
        
        // Check if user can reject this leave
        if (!in_array($user->role, ['manager', 'admin'])) {
            abort(403, 'Nincs jogosultságod szabadság kérések elutasításához.');
        }

        if ($user->role === 'manager' && $leave->user->manager_id !== $user->id) {
            abort(403, 'Csak a saját beosztottaid szabadság kéréseit utasíthatod el.');
        }

        if ($leave->status !== 'pending') {
            return back()->with('error', 'Ez a szabadság kérés már nem függőben van.');
        }

        $request->validate([
            'review_notes' => 'required|string|max:1000',
        ]);

        $leave->reject($user, $request->review_notes);

        // Log the rejection
        $this->logActivity(
            'leave_rejected',
            "Szabadság kérés elutasítva: {$leave->user->name} - {$leave->days_requested} nap ({$leave->start_date->format('Y-m-d')} - {$leave->end_date->format('Y-m-d')})",
            $leave->user
        );

        // Create notification for the user
        $this->createNotification(
            $leave->user_id,
            'leave_rejected',
            'Szabadság kérés elutasítva',
            "A szabadság kérésed elutasításra került: {$leave->days_requested} nap ({$leave->start_date->format('Y-m-d')} - {$leave->end_date->format('Y-m-d')})"
        );

        return redirect()->back()
            ->with('success', 'Szabadság kérés sikeresen elutasítva!');
    }

    /**
     * Cancel an approved leave request (manager/admin only).
     */
    public function cancel(Request $request, Leave $leave)
    {
        $user = Auth::user();
        
        // Check if user can cancel this leave
        if (!in_array($user->role, ['manager', 'admin'])) {
            abort(403, 'Nincs jogosultságod szabadság kérések érvénytelenítéséhez.');
        }

        if ($user->role === 'manager' && $leave->user->manager_id !== $user->id) {
            abort(403, 'Csak a saját beosztottaid szabadság kéréseit érvénytelenítheted.');
        }

        if ($leave->status !== 'approved') {
            return back()->with('error', 'Csak jóváhagyott szabadság kéréseket lehet érvényteleníteni.');
        }

        $request->validate([
            'review_notes' => 'required|string|max:1000',
        ]);

        $leave->cancel($user, $request->review_notes);

        // Log the cancellation
        $this->logActivity(
            'leave_cancelled',
            "Szabadság kérés érvénytelenítve: {$leave->user->name} - {$leave->days_requested} nap ({$leave->start_date->format('Y-m-d')} - {$leave->end_date->format('Y-m-d')})",
            $leave->user
        );

        // Create notification for the user
        $this->createNotification(
            $leave->user_id,
            'leave_cancelled',
            'Szabadság kérés érvénytelenítve',
            "A szabadság kérésed érvénytelenítésre került: {$leave->days_requested} nap ({$leave->start_date->format('Y-m-d')} - {$leave->end_date->format('Y-m-d')})"
        );

        return redirect()->back()
            ->with('success', 'Szabadság kérés sikeresen érvénytelenítve!');
    }

    /**
     * Display leaves for team management (manager only).
     */
    public function teamLeaves(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role !== 'manager') {
            abort(403, 'Nincs jogosultságod a csapat szabadság kérések megtekintéséhez.');
        }

        // Managers can only see their subordinates' leaves
        $query = Leave::with(['user.manager', 'reviewer'])
            ->whereHas('user', function($q) use ($user) {
                $q->where('manager_id', $user->id);
            });

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('start_date_from')) {
            $query->where('start_date', '>=', $request->start_date_from);
        }

        if ($request->filled('start_date_to')) {
            $query->where('start_date', '<=', $request->start_date_to);
        }

        if ($request->filled('created_from')) {
            $query->where('created_at', '>=', $request->created_from);
        }

        if ($request->filled('created_to')) {
            $query->where('created_at', '<=', $request->created_to);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $leaves = $query->orderBy('created_at', 'desc')->get();

        return inertia('Leaves/TeamLeaves', [
            'leaves' => $leaves,
            'user' => $user,
            'filters' => $request->only(['status', 'category', 'start_date_from', 'start_date_to', 'created_from', 'created_to', 'user_id']),
            'subordinates' => User::where('manager_id', $user->id)->active()->get(['id', 'name'])
        ]);
    }

    /**
     * Display all leaves for admin management (admin only).
     */
    public function allLeaves(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role !== 'admin') {
            abort(403, 'Nincs jogosultságod az összes szabadság kérés megtekintéséhez.');
        }

        // Admins can see all leaves
        $query = Leave::with(['user.manager', 'reviewer']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('start_date_from')) {
            $query->where('start_date', '>=', $request->start_date_from);
        }

        if ($request->filled('start_date_to')) {
            $query->where('start_date', '<=', $request->start_date_to);
        }

        if ($request->filled('created_from')) {
            $query->where('created_at', '>=', $request->created_from);
        }

        if ($request->filled('created_to')) {
            $query->where('created_at', '<=', $request->created_to);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $leaves = $query->orderBy('created_at', 'desc')->get();

        return inertia('Leaves/AllLeaves', [
            'leaves' => $leaves,
            'user' => $user,
            'filters' => $request->only(['status', 'category', 'start_date_from', 'start_date_to', 'created_from', 'created_to', 'user_id']),
            'users' => User::active()->orderBy('name')->get(['id', 'name'])
        ]);
    }

    /**
     * Display calendar view for user's own leaves.
     */
    public function calendarMine(Request $request)
    {
        // Use the EXACT same query logic as index() method
        $user = Auth::user();
        $query = $user->leaves();

        // Note: Not applying filters for calendar view, but using same base query
        // This is exactly the same as index() when no filters are applied
        
        $leaves = $query->orderBy('created_at', 'desc')->get();

        // Calculate actual remaining leaves dynamically (same as index)
        $user->remaining_leaves_current_year = $user->calculateRemainingLeaves();
        
        // Debug logging
        \Log::info('Calendar Mine - User ID: ' . $user->id);
        \Log::info('Calendar Mine - Leaves count: ' . $leaves->count());
        
        if ($leaves->count() > 0) {
            \Log::info('Calendar Mine - First leave: ' . json_encode([
                'id' => $leaves->first()->id,
                'user_id' => $leaves->first()->user_id,
                'start_date' => $leaves->first()->start_date->format('Y-m-d'),
                'end_date' => $leaves->first()->end_date->format('Y-m-d'),
                'category' => $leaves->first()->category,
                'status' => $leaves->first()->status,
            ]));
        } else {
            \Log::warning('Calendar Mine - No leaves found for user ' . $user->id);
        }
        
        // Pass leaves as collection (Inertia converts it automatically, same as index() method)
        // But let's also verify the query is correct - use same pattern as index()
        return inertia('Calendar/Mine', [
            'leaves' => $leaves->values(),  // Ensure it's a collection with sequential keys
            'user' => $user
        ]);
    }

    /**
     * Display calendar view for team leaves (manager only).
     */
    public function calendarTeam()
    {
        $user = Auth::user();
        
        if ($user->role !== 'manager') {
            abort(403, 'Nincs jogosultságod a csapat naptár megtekintéséhez.');
        }

        // Use the same query pattern as teamLeaves() method
        $leaves = Leave::with(['user.manager', 'reviewer'])
            ->whereHas('user', function($q) use ($user) {
                $q->where('manager_id', $user->id);
            })
            ->orderBy('start_date')
            ->get();

        // Format leaves for FullCalendar
        $events = $leaves->map(function ($leave) {
            $categoryColors = [
                'szabadsag' => '#3b82f6',
                'betegszabadsag' => '#f97316',
                'tappenzt' => '#ef4444',
                'egyeb_tavollet' => '#9333ea',
            ];

            $statusColors = [
                'pending' => '#eab308',
                'approved' => '#22c55e',
                'rejected' => '#ef4444',
                'cancelled' => '#6b7280',
            ];

            $color = $statusColors[$leave->status] ?? '#6b7280';

            return [
                'id' => $leave->id,
                'title' => $leave->user->name . ' - ' . (
                    ($leave->category === 'szabadsag' ? 'Szabadság' :
                    ($leave->category === 'betegszabadsag' ? 'Betegszabadság' :
                    ($leave->category === 'tappenzt' ? 'Táppénz' : 'Egyéb távollét')))
                ),
                'start' => $leave->start_date->format('Y-m-d'),
                'end' => $leave->end_date->copy()->addDay()->format('Y-m-d'), // Add day because FullCalendar end is exclusive
                'color' => $color,
                'extendedProps' => [
                    'status' => $leave->status,
                    'category' => $leave->category,
                    'days_requested' => $leave->days_requested,
                    'user_name' => $leave->user->name,
                    'user_id' => $leave->user->id,
                    'reason' => $leave->reason,
                ],
            ];
        });
        
        $eventsArray = $events->map(function($event) {
            return $event;
        })->values()->all();
        
        return inertia('Calendar/Team', [
            'events' => $eventsArray,
            'user' => $user,
            'subordinates' => User::where('manager_id', $user->id)->active()->get(['id', 'name'])
        ]);
    }

    /**
     * Display calendar view for all leaves (admin only).
     */
    public function calendarAll()
    {
        $user = Auth::user();
        
        if ($user->role !== 'admin') {
            abort(403, 'Nincs jogosultságod az összes naptár megtekintéséhez.');
        }

        // Use the same query pattern as allLeaves() method
        $leaves = Leave::with(['user.manager', 'reviewer'])
            ->orderBy('start_date')
            ->get();

        // Format leaves for FullCalendar
        $events = $leaves->map(function ($leave) {
            $categoryColors = [
                'szabadsag' => '#3b82f6',
                'betegszabadsag' => '#f97316',
                'tappenzt' => '#ef4444',
                'egyeb_tavollet' => '#9333ea',
            ];

            $statusColors = [
                'pending' => '#eab308',
                'approved' => '#22c55e',
                'rejected' => '#ef4444',
                'cancelled' => '#6b7280',
            ];

            $color = $statusColors[$leave->status] ?? '#6b7280';

            return [
                'id' => $leave->id,
                'title' => $leave->user->name . ' - ' . (
                    ($leave->category === 'szabadsag' ? 'Szabadság' :
                    ($leave->category === 'betegszabadsag' ? 'Betegszabadság' :
                    ($leave->category === 'tappenzt' ? 'Táppénz' : 'Egyéb távollét')))
                ),
                'start' => $leave->start_date->format('Y-m-d'),
                'end' => $leave->end_date->copy()->addDay()->format('Y-m-d'), // Add day because FullCalendar end is exclusive
                'color' => $color,
                'extendedProps' => [
                    'status' => $leave->status,
                    'category' => $leave->category,
                    'days_requested' => $leave->days_requested,
                    'user_name' => $leave->user->name,
                    'user_id' => $leave->user->id,
                    'manager_name' => $leave->user->manager ? $leave->user->manager->name : null,
                    'reason' => $leave->reason,
                ],
            ];
        });
        
        $eventsArray = $events->map(function($event) {
            return $event;
        })->values()->all();
        
        return inertia('Calendar/All', [
            'events' => $eventsArray,
            'user' => $user,
            'users' => User::active()->orderBy('name')->get(['id', 'name'])
        ]);
    }
}
