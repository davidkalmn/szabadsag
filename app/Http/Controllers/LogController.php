<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;

class LogController extends Controller
{
    /**
     * Display a listing of activity logs.
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        $actionFilter = $request->get('action');
        $userFilter = $request->get('user');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');
        $searchTerm = $request->get('search');
        $dateSort = $request->get('date_sort', 'desc');
        
        // Start building the query
        $query = ActivityLog::with('user');
        
        // Filter logs based on current user's role
        if ($currentUser->role === 'admin') {
            // Admins can see all logs
            // No additional user filtering needed
        } elseif ($currentUser->role === 'manager') {
            // Managers can see their own logs and logs from their subordinates
            $subordinateIds = User::where('manager_id', $currentUser->id)->pluck('id')->toArray();
            $subordinateIds[] = $currentUser->id; // Include themselves
            
            $query->where(function($q) use ($subordinateIds, $currentUser) {
                $q->whereIn('user_id', $subordinateIds)
                  // Also include logs where this manager is the target (e.g., new subordinate assigned)
                  ->orWhere(function($subQ) use ($currentUser) {
                      $subQ->where('target_type', 'App\\Models\\User')
                           ->where('target_id', $currentUser->id)
                           ->where('description', 'like', '%Új beosztott%');
                  });
            });
        } else {
            // Teachers can only see their own logs
            $query->where('user_id', $currentUser->id);
        }
        
        // Apply action filter if specified
        if ($actionFilter && $actionFilter !== 'all') {
            $query->where('action', $actionFilter);
        }
        
        // Apply user filter if specified
        if ($userFilter && $userFilter !== 'all') {
            $query->where('user_id', $userFilter);
        }
        
        // Apply date range filters if specified
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }
        
        // Apply search filter if specified
        if ($searchTerm) {
            $query->where(function($q) use ($searchTerm) {
                $q->where('action', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhereHas('user', function($userQuery) use ($searchTerm) {
                      $userQuery->where('name', 'like', "%{$searchTerm}%")
                               ->orWhere('email', 'like', "%{$searchTerm}%");
                  });
            });
        }
        
        $logs = $query->orderBy('created_at', $dateSort)->paginate(50);
        
        // Format timestamps manually to avoid timezone issues
        foreach ($logs->items() as $log) {
            // Ensure we have a Carbon instance and format it
            $log->formatted_created_at = \Carbon\Carbon::parse($log->created_at)->format('Y. m. d. H:i:s');
        }
        
        // Get users for the filter dropdown based on current user's role
        $usersQuery = User::select('id', 'name');
        if ($currentUser->role === 'admin') {
            $users = $usersQuery->get();
        } elseif ($currentUser->role === 'manager') {
            $subordinateIds = User::where('manager_id', $currentUser->id)->pluck('id')->toArray();
            $subordinateIds[] = $currentUser->id;
            $users = $usersQuery->whereIn('id', $subordinateIds)->get();
        } else {
            $users = collect([$currentUser]);
        }

        return inertia('Logs/Index', [
            'logs' => $logs,
            'currentUser' => $currentUser,
            'users' => $users,
            'filters' => [
                'action' => $actionFilter,
                'user' => $userFilter,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'search' => $searchTerm,
                'date_sort' => $dateSort
            ]
        ]);
    }
}
