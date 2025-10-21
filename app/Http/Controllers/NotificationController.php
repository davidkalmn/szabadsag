<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications for the current user.
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        $typeFilter = $request->get('type');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');
        $searchTerm = $request->get('search');
        $sortBy = $request->get('sort', 'newest');

        $query = Notification::where('user_id', $currentUser->id);

        // Apply sorting
        switch ($sortBy) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Apply type filter if specified
        if ($typeFilter && $typeFilter !== 'all') {
            // Backward-compat: map legacy types into current ones when filtering
            if ($typeFilter === 'user_deactivated') {
                $query->whereIn('type', ['user_deactivated', 'account_deleted']);
            } else {
                $query->where('type', $typeFilter);
            }
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
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('message', 'like', "%{$searchTerm}%")
                  ->orWhere('type', 'like', "%{$searchTerm}%");
            });
        }

        $notifications = $query->paginate(20)->withQueryString();

        // Format timestamps manually to avoid timezone issues
        foreach ($notifications->items() as $notification) {
            $notification->formatted_created_at = \Carbon\Carbon::parse($notification->created_at)->format('Y. m. d. H:i:s');
        }

        $unreadCount = Notification::where('user_id', $currentUser->id)
            ->whereNull('read_at')
            ->count();

        return inertia('Notifications/Index', [
            'notifications' => $notifications,
            'currentUser' => $currentUser,
            'unreadCount' => $unreadCount,
            'filters' => [
                'type' => $typeFilter,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'search' => $searchTerm,
                'sort' => $sortBy
            ]
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Notification $notification)
    {
        // Ensure the notification belongs to the current user
        if ($notification->user_id !== auth()->id()) {
            abort(403, 'Nincs jogosultságod ennek az értesítésnek a megtekintéséhez.');
        }

        $notification->markAsRead();

        return back()->with('success', 'Értesítés olvasottnak jelölve.');
    }

    /**
     * Mark a notification as unread.
     */
    public function markAsUnread(Notification $notification)
    {
        // Ensure the notification belongs to the current user
        if ($notification->user_id !== auth()->id()) {
            abort(403, 'Nincs jogosultságod ennek az értesítésnek a megtekintéséhez.');
        }

        $notification->markAsUnread();

        return back()->with('success', 'Értesítés olvasatlannak jelölve.');
    }

    /**
     * Mark all notifications as read for the current user.
     */
    public function markAllAsRead()
    {
        Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return back()->with('success', 'Összes értesítés olvasottnak jelölve.');
    }

    /**
     * Get unread notifications count for the current user.
     */
    public function getUnreadCount()
    {
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $unreadCount]);
    }
}