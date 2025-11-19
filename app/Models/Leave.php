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
        'category',
        'start_date',
        'end_date',
        'days_requested',
        'reason',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
    ];

    // Leave categories
    const CATEGORY_SZABADSAG = 'szabadsag';
    const CATEGORY_BETEGSZABADSAG = 'betegszabadsag';
    const CATEGORY_TAPPENZT = 'tappenzt';
    const CATEGORY_EGYEB_TAVOLLET = 'egyeb_tavollet';

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
     * Scope for normal leaves (szabadsag category)
     */
    public function scopeNormalLeaves($query)
    {
        return $query->where('category', self::CATEGORY_SZABADSAG);
    }

    /**
     * Scope for sick leaves (betegszabadsag and tappenzt categories)
     */
    public function scopeSickLeaves($query)
    {
        return $query->whereIn('category', [self::CATEGORY_BETEGSZABADSAG, self::CATEGORY_TAPPENZT]);
    }

    /**
     * Scope for other absence (egyeb_tavollet category)
     */
    public function scopeOtherAbsence($query)
    {
        return $query->where('category', self::CATEGORY_EGYEB_TAVOLLET);
    }

    /**
     * Check if this leave counts towards normal leave balance
     */
    public function countsTowardsBalance(): bool
    {
        return $this->category === self::CATEGORY_SZABADSAG;
    }

    /**
     * Check if this category can be requested by regular users
     */
    public function canBeRequestedByUser(): bool
    {
        return $this->category !== self::CATEGORY_EGYEB_TAVOLLET;
    }

    /**
     * Get the category label for display
     */
    public function getCategoryLabelAttribute(): string
    {
        return match($this->category) {
            self::CATEGORY_SZABADSAG => 'Szabadság',
            self::CATEGORY_BETEGSZABADSAG => 'Betegszabadság',
            self::CATEGORY_TAPPENZT => 'Táppénz',
            self::CATEGORY_EGYEB_TAVOLLET => 'Egyéb távollét',
            default => $this->category,
        };
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

    /**
     * Get Hungarian national holidays for a given year
     * 
     * @param int $year
     * @return array Array of Carbon dates
     */
    public static function getHungarianHolidays(int $year): array
    {
        $holidays = [
            Carbon::create($year, 1, 1),   // Újév (New Year's Day)
            Carbon::create($year, 3, 15),  // 1848-as forradalom és szabadságharc emléknapja
            Carbon::create($year, 5, 1),   // A munka ünnepe (Labour Day)
            Carbon::create($year, 8, 20),  // Az államalapítás ünnepe (State Foundation Day)
            Carbon::create($year, 10, 23), // 1956-os forradalom és szabadságharc emléknapja
            Carbon::create($year, 11, 1),  // Mindenszentek (All Saints' Day)
            Carbon::create($year, 12, 25), // Karácsony (Christmas)
            Carbon::create($year, 12, 26), // Karácsony másnapja (Boxing Day)
        ];
        
        return $holidays;
    }

    /**
     * Check if a date is a Hungarian national holiday
     * 
     * @param Carbon $date
     * @return bool
     */
    public static function isHungarianHoliday(Carbon $date): bool
    {
        $holidays = self::getHungarianHolidays($date->year);
        
        foreach ($holidays as $holiday) {
            if ($date->isSameDay($holiday)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if date range contains only holidays (no weekdays, no weekends)
     * 
     * @param Carbon|string $startDate
     * @param Carbon|string $endDate
     * @return bool
     */
    public static function containsOnlyHolidays($startDate, $endDate): bool
    {
        $start = $startDate instanceof Carbon ? $startDate : Carbon::parse($startDate);
        $end = $endDate instanceof Carbon ? $endDate : Carbon::parse($endDate);
        
        if ($start->gt($end)) {
            return false;
        }
        
        $current = $start->copy();
        $hasWeekday = false;
        $hasWeekend = false;
        
        while ($current->lte($end)) {
            $dayOfWeek = $current->dayOfWeek;
            $isHoliday = self::isHungarianHoliday($current);
            
            if ($dayOfWeek >= 1 && $dayOfWeek <= 5) {
                // It's a weekday
                if (!$isHoliday) {
                    $hasWeekday = true;
                }
            } else {
                // It's a weekend
                $hasWeekend = true;
            }
            
            $current->addDay();
        }
        
        // Only holidays means: no weekdays, and at least one holiday
        return !$hasWeekday && !$hasWeekend;
    }

    /**
     * Calculate the number of weekdays (Monday-Friday) between two dates (inclusive)
     * Excludes weekends and Hungarian national holidays
     * 
     * @param Carbon|string $startDate
     * @param Carbon|string $endDate
     * @return int
     */
    public static function calculateWeekdays($startDate, $endDate): int
    {
        $start = $startDate instanceof Carbon ? $startDate : Carbon::parse($startDate);
        $end = $endDate instanceof Carbon ? $endDate : Carbon::parse($endDate);
        
        // Ensure start is before or equal to end
        if ($start->gt($end)) {
            return 0;
        }
        
        // Count weekdays (Monday-Friday) excluding Hungarian national holidays
        $weekdays = 0;
        $current = $start->copy();
        
        while ($current->lte($end)) {
            $dayOfWeek = $current->dayOfWeek; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            // Carbon's dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            // We want Monday (1) through Friday (5), but exclude holidays
            if ($dayOfWeek >= 1 && $dayOfWeek <= 5 && !self::isHungarianHoliday($current)) {
                $weekdays++;
            }
            $current->addDay();
        }
        
        return $weekdays;
    }
}
