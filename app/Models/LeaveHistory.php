<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'leave_id',
        'user_id',
        'action',
        'old_status',
        'new_status',
        'notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the leave that this history belongs to
     */
    public function leave(): BelongsTo
    {
        return $this->belongsTo(Leave::class);
    }

    /**
     * Get the user who performed the action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the action text for UI
     */
    public function getActionTextAttribute(): string
    {
        return match($this->action) {
            'submitted' => 'Beküldve',
            'approved' => 'Jóváhagyva',
            'rejected' => 'Elutasítva',
            'cancelled' => 'Érvénytelenítve',
            default => 'Ismeretlen',
        };
    }

    /**
     * Get the old status text for UI
     */
    public function getOldStatusTextAttribute(): string
    {
        return match($this->old_status) {
            'pending' => 'Függőben',
            'approved' => 'Jóváhagyva',
            'rejected' => 'Elutasítva',
            'cancelled' => 'Érvénytelenítve',
            default => '-',
        };
    }

    /**
     * Get the new status text for UI
     */
    public function getNewStatusTextAttribute(): string
    {
        return match($this->new_status) {
            'pending' => 'Függőben',
            'approved' => 'Jóváhagyva',
            'rejected' => 'Elutasítva',
            'cancelled' => 'Érvénytelenítve',
            default => 'Ismeretlen',
        };
    }
}
