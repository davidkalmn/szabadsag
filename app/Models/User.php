<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'manager_id',
        'total_leave_days',
        'remaining_leaves_current_year',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the manager of this user.
     */
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the users managed by this user.
     */
    public function subordinates()
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    /**
     * Scope a query to only include active users.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include inactive users.
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Deactivate the user (soft delete).
     */
    public function deactivate()
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Reactivate the user.
     */
    public function reactivate()
    {
        $this->update(['is_active' => true]);
    }

    /**
     * Get all leaves for this user.
     */
    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }

    /**
     * Get leaves reviewed by this user.
     */
    public function reviewedLeaves()
    {
        return $this->hasMany(Leave::class, 'reviewed_by');
    }

    /**
     * Get pending leaves for this user.
     */
    public function pendingLeaves()
    {
        return $this->leaves()->pending();
    }

    /**
     * Get approved leaves for this user.
     */
    public function approvedLeaves()
    {
        return $this->leaves()->approved();
    }

    /**
     * Get rejected leaves for this user.
     */
    public function rejectedLeaves()
    {
        return $this->leaves()->rejected();
    }

    /**
     * Get leaves for current year.
     */
    public function currentYearLeaves()
    {
        return $this->leaves()->currentYear();
    }

    /**
     * Get total days of pending leaves for this user.
     */
    public function getPendingLeavesDaysAttribute(): int
    {
        return $this->pendingLeaves()->sum('days_requested');
    }

    /**
     * Get total days of approved leaves for this user in current year.
     */
    public function getApprovedLeavesDaysAttribute(): int
    {
        return $this->approvedLeaves()->currentYear()->sum('days_requested');
    }

    /**
     * Check if user can request leave for given days.
     */
    public function canRequestLeave(int $days): bool
    {
        return $this->remaining_leaves_current_year >= $days;
    }

    /**
     * Reset remaining leaves for new year.
     */
    public function resetLeavesForNewYear(): void
    {
        $this->update(['remaining_leaves_current_year' => $this->total_leave_days]);
    }

    /**
     * Get total available leaves (remaining + pending)
     */
    public function getTotalAvailableLeavesAttribute(): int
    {
        return $this->remaining_leaves_current_year + $this->pending_leaves_days;
    }

    /**
     * Calculate actual remaining leaves dynamically
     */
    public function calculateRemainingLeaves(): int
    {
        $approvedLeaves = $this->leaves()
            ->where('status', 'approved')
            ->currentYear()
            ->sum('days_requested');
        $pendingLeaves = $this->pendingLeaves()->sum('days_requested');
        return $this->total_leave_days - $approvedLeaves - $pendingLeaves;
    }

    /**
     * Initialize remaining leaves if not set.
     */
    public function initializeRemainingLeaves(): void
    {
        if ($this->remaining_leaves_current_year === null || $this->remaining_leaves_current_year === 0) {
            $this->update(['remaining_leaves_current_year' => $this->total_leave_days]);
        }
    }
}
