<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

trait LogsActivity
{
    /**
     * Log an activity.
     */
    protected function logActivity(
        string $action,
        string $description,
        $target = null,
        Request $request = null
    ): void {
        $request = $request ?: request();
        
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'description' => $description,
            'target_type' => $target ? get_class($target) : null,
            'target_id' => $target ? $target->id : null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
