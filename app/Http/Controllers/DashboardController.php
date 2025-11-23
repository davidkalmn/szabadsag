<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\LogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\LeaveController;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        
        if (!$currentUser) {
            return redirect()->route('login');
        }

        // Debug logging
        \Log::info('DashboardController::index called', [
            'user_id' => $currentUser->id,
            'role' => $currentUser->role,
        ]);

        try {
            // Use shared methods from existing controllers - no code duplication!
            // Filter data based on user role (admin sees all, manager sees team only)
            
            if ($currentUser->role === 'admin') {
                // Admin: Get all leaves and statistics
                \Log::info('Dashboard: Fetching all leaves and statistics (admin)...');
                $leavesData = LeaveController::getAllLeavesWithStatistics();
                $statistics = $leavesData['statistics'];
                
                // Get all calendar leaves
                \Log::info('Dashboard: Fetching all calendar leaves (admin)...');
                $calendarLeaves = LeaveController::getCalendarLeaves();
                
            } elseif ($currentUser->role === 'manager') {
                // Manager: Get team leaves and statistics only
                \Log::info('Dashboard: Fetching team leaves and statistics (manager)...');
                $leavesData = LeaveController::getTeamLeavesWithStatistics($currentUser);
                $statistics = $leavesData['statistics'];
                
                // Get team calendar leaves only
                \Log::info('Dashboard: Fetching team calendar leaves (manager)...');
                $calendarLeaves = LeaveController::getCalendarLeaves($currentUser);
                
            } else {
                // Teacher/User: Get their own leaves and statistics only
                \Log::info('Dashboard: Fetching user leaves and statistics (teacher)...');
                $leavesData = LeaveController::getUserLeavesWithStatistics($currentUser);
                $statistics = $leavesData['statistics'];
                
                // Get user's own calendar leaves only
                \Log::info('Dashboard: Fetching user calendar leaves (teacher)...');
                $calendarLeaves = LeaveController::getCalendarLeaves($currentUser);
            }
            
            \Log::info('Dashboard: Leaves data retrieved', [
                'statistics' => $statistics,
                'leaves_count' => isset($leavesData) ? $leavesData['leaves']->count() : 0,
            ]);
            \Log::info('Dashboard: Calendar leaves retrieved', [
                'count' => count($calendarLeaves),
            ]);
            
            // Get notifications using NotificationController (same for all roles - user's own notifications)
            \Log::info('Dashboard: Fetching notifications...');
            $notifications = NotificationController::getNotificationsForUser($currentUser, 10);
            // Convert collection to array for Inertia compatibility
            $notifications = $notifications->values()->toArray();
            \Log::info('Dashboard: Notifications retrieved', [
                'count' => count($notifications),
            ]);
            
            // Get activity logs using LogController (already filters by role)
            \Log::info('Dashboard: Fetching activity logs...');
            $activityLogs = LogController::getActivityLogsForUser($currentUser, 5);
            // Convert collection to array for Inertia compatibility
            $activityLogs = $activityLogs->values()->toArray();
            \Log::info('Dashboard: Activity logs retrieved', [
                'count' => count($activityLogs),
            ]);
            
        } catch (\Exception $e) {
            \Log::error('DashboardController error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            // Return empty data on error
            $statistics = ['pending' => 0, 'approved' => 0, 'rejected' => 0, 'cancelled' => 0];
            $calendarLeaves = [];
            $notifications = [];
            $activityLogs = [];
        }

        // Debug: Log what we're about to return
        \Log::info('Dashboard: Preparing to return data to Inertia', [
            'statistics' => $statistics,
            'calendarLeaves_count' => is_array($calendarLeaves) ? count($calendarLeaves) : 'not_array',
            'notifications_count' => is_array($notifications) ? count($notifications) : 'not_array',
            'activityLogs_count' => is_array($activityLogs) ? count($activityLogs) : 'not_array',
        ]);
        
        // Always return data - same structure as working controllers
        return inertia('Dashboard', [
            'currentUser' => $currentUser,
            'role' => $currentUser->role,
            'statistics' => $statistics,
            'calendarLeaves' => $calendarLeaves,
            'notifications' => $notifications,
            'activityLogs' => $activityLogs,
        ]);
    }
}

