<?php

namespace App\Traits;

use App\Models\Notification;

trait CreatesNotifications
{
    /**
     * Create a notification for a user.
     */
    protected function createNotification(
        int $userId,
        string $type,
        string $title,
        string $message,
        array $data = []
    ): void {
        Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }
}
