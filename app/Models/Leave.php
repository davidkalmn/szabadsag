<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Leave extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'start_date',
        'end_date',
        'days_requested',
        'reason',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the user who requested the leave
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who reviewed the leave
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the history of this leave
     */
    public function history()
    {
        return $this->hasMany(LeaveHistory::class)->orderBy('created_at', 'desc');
    }

    /**
     * Scope for pending leaves
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved leaves
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for rejected leaves
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope for leaves in current year
     */
    public function scopeCurrentYear($query)
    {
        return $query->whereYear('start_date', Carbon::now()->year);
    }

    /**
     * Check if the leave is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the leave is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if the leave is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if the leave is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Approve the leave
     */
    public function approve(User $reviewer, string $notes = null): void
    {
        $oldStatus = $this->status;
        
        $this->update([
            'status' => 'approved',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_notes' => $notes,
        ]);

        // Log the history
        $this->logHistory($reviewer, 'approved', $oldStatus, 'approved', $notes);

        // Days are automatically handled through dynamic calculation
    }

    /**
     * Reject the leave
     */
    public function reject(User $reviewer, string $notes = null): void
    {
        $oldStatus = $this->status;
        
        $this->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_notes' => $notes,
        ]);

        // Log the history
        $this->logHistory($reviewer, 'rejected', $oldStatus, 'rejected', $notes);

        // Days are automatically handled through dynamic calculation
    }

    /**
     * Cancel the leave (for managers/admins)
     */
    public function cancel(User $reviewer, string $notes = null): void
    {
        $oldStatus = $this->status;
        
        $this->update([
            'status' => 'cancelled',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_notes' => $notes,
        ]);

        // Log the history
        $this->logHistory($reviewer, 'cancelled', $oldStatus, 'cancelled', $notes);

        // Days are automatically handled through dynamic calculation
    }

    /**
     * Get the status badge color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'approved' => 'green',
            'rejected' => 'red',
            'cancelled' => 'gray',
            default => 'gray',
        };
    }

    /**
     * Get the status text for UI
     */
    public function getStatusTextAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Függőben',
            'approved' => 'Jóváhagyva',
            'rejected' => 'Elutasítva',
            'cancelled' => 'Érvénytelenítve',
            default => 'Ismeretlen',
        };
    }

    /**
     * Log a history entry for this leave
     */
    public function logHistory(User $user, string $action, string $oldStatus = null, string $newStatus = null, string $notes = null): void
    {
        $this->history()->create([
            'user_id' => $user->id,
            'action' => $action,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'notes' => $notes,
        ]);
    }

    /**
     * Log the initial submission of a leave
     */
    public function logSubmission(User $user): void
    {
        $this->logHistory($user, 'submitted', null, 'pending', null);
    }
}
