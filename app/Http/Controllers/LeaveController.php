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
     * Display a listing of the user's leaves.
     */
    public function index()
    {
        $user = Auth::user();
        $leaves = $user->leaves()->orderBy('created_at', 'desc')->get();

        // Calculate actual remaining leaves dynamically
        $user->remaining_leaves_current_year = $user->calculateRemainingLeaves();

        return inertia('Leaves/Index', [
            'leaves' => $leaves,
            'user' => $user
        ]);
    }

    /**
     * Show the form for creating a new leave request.
     */
    public function create()
    {
        $user = Auth::user();
        
        // Calculate actual remaining leaves dynamically
        $user->remaining_leaves_current_year = $user->calculateRemainingLeaves();

        return inertia('Leaves/Create', [
            'user' => $user
        ]);
    }

    /**
     * Store a newly created leave request.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Initialize remaining leaves if not set
        $user->initializeRemainingLeaves();

        $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string|max:1000',
        ], [
            'start_date.after_or_equal' => 'A kezdő dátum nem lehet a mai napnál korábbi.',
            'end_date.after_or_equal' => 'A befejező dátum nem lehet korábbi, mint a kezdő dátum.',
        ]);

        // Calculate days requested
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $daysRequested = $startDate->diffInDays($endDate) + 1; // +1 to include both start and end days

        // Calculate actual remaining leaves dynamically
        $actualRemaining = $user->calculateRemainingLeaves();

        // Check if user has enough remaining leaves
        if ($actualRemaining < $daysRequested) {
            return back()->withErrors([
                'days' => "Nincs elég szabadság napod. Elérhető napok: {$actualRemaining}, kért napok: {$daysRequested}"
            ]);
        }

        // Check for overlapping leave requests
        $overlappingLeave = $user->leaves()
            ->where('status', '!=', 'rejected')
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
            
            return back()->withErrors([
                'dates' => "Már van egy {$overlappingStatus} szabadság kérésed ebben az időszakban ({$overlappingStart} - {$overlappingEnd}). Kérjük, válassz más dátumokat."
            ]);
        }

        $leave = Leave::create([
            'user_id' => $user->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'days_requested' => $daysRequested,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        // Log the initial submission
        $leave->logSubmission($user);

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

        $leave->load(['user', 'reviewer', 'history.user']);

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
    public function teamLeaves()
    {
        $user = Auth::user();
        
        if ($user->role !== 'manager') {
            abort(403, 'Nincs jogosultságod a csapat szabadság kérések megtekintéséhez.');
        }

        // Managers can only see their subordinates' leaves
        $leaves = Leave::with(['user.manager', 'reviewer'])
            ->whereHas('user', function($q) use ($user) {
                $q->where('manager_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('Leaves/TeamLeaves', [
            'leaves' => $leaves,
            'user' => $user
        ]);
    }

    /**
     * Display all leaves for admin management (admin only).
     */
    public function allLeaves()
    {
        $user = Auth::user();
        
        if ($user->role !== 'admin') {
            abort(403, 'Nincs jogosultságod az összes szabadság kérés megtekintéséhez.');
        }

        // Admins can see all leaves
        $leaves = Leave::with(['user.manager', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('Leaves/AllLeaves', [
            'leaves' => $leaves,
            'user' => $user
        ]);
    }
}
