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
        
        $notifications = Notification::where('user_id', $currentUser->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $unreadCount = Notification::where('user_id', $currentUser->id)
            ->whereNull('read_at')
            ->count();

        return inertia('Notifications/Index', [
            'notifications' => $notifications,
            'currentUser' => $currentUser,
            'unreadCount' => $unreadCount
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