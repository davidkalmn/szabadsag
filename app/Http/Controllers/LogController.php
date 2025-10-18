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
        
        $logs = $query->orderBy('created_at', 'desc')->paginate(50);

        return inertia('Logs/Index', [
            'logs' => $logs,
            'currentUser' => $currentUser,
            'filters' => [
                'action' => $actionFilter
            ]
        ]);
    }
}
