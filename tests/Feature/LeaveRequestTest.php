<?php

namespace Tests\Feature;

use App\Models\Leave;
use App\Models\User;
use App\Models\ActivityLog;
use App\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class LeaveRequestTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a normal user (teacher) can successfully request a leave.
     */
    public function test_normal_user_can_request_leave_successfully(): void
    {
        // Create a user with teacher role and leave days
        $user = User::factory()->create([
            'role' => 'teacher',
            'total_leave_days' => 20,
            'remaining_leaves_current_year' => 20,
            'is_active' => true,
        ]);

        // Create a manager for the user (for notification)
        $manager = User::factory()->create([
            'role' => 'manager',
            'is_active' => true,
        ]);

        $user->update(['manager_id' => $manager->id]);

        // Calculate future dates (tomorrow + 4 days = 5 weekdays)
        // This ensures we have valid weekdays
        $startDate = Carbon::tomorrow();
        $endDate = $startDate->copy()->addDays(4); // 5 days total

        // Authenticate as the user
        $this->actingAs($user);

        // Make POST request to create leave
        $response = $this->post('/szabadsagok/igenyles', [
            'category' => 'szabadsag',
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'reason' => 'Test leave request',
        ]);

        // Assert redirect to personal leaves page
        $response->assertRedirect(route('szabadsag.sajat-kerelmek'));
        $response->assertSessionHas('success', 'Szabadság kérés sikeresen benyújtva!');

        // Assert leave was created in database
        // Note: Dates are stored as datetime in SQLite, so we check them separately
        $this->assertDatabaseHas('leaves', [
            'user_id' => $user->id,
            'category' => 'szabadsag',
            'status' => 'pending',
            'reason' => 'Test leave request',
        ]);
        
        // Get the created leave
        $leave = Leave::where('user_id', $user->id)
            ->where('category', 'szabadsag')
            ->where('status', 'pending')
            ->first();
        
        // Assert leave exists and has correct attributes
        $this->assertNotNull($leave);
        
        // Check dates (they may be stored with time component in SQLite)
        $this->assertEquals($startDate->format('Y-m-d'), $leave->start_date->format('Y-m-d'));
        $this->assertEquals($endDate->format('Y-m-d'), $leave->end_date->format('Y-m-d'));
        $this->assertEquals('pending', $leave->status);
        $this->assertEquals('szabadsag', $leave->category);
        $this->assertEquals('Test leave request', $leave->reason);
        $this->assertNull($leave->reviewed_by);
        $this->assertNull($leave->reviewed_at);

        // Assert days_requested is calculated correctly (5 weekdays)
        $expectedDays = Leave::calculateWeekdays($startDate, $endDate);
        $this->assertEquals($expectedDays, $leave->days_requested);
        $this->assertGreaterThan(0, $leave->days_requested);

        // Assert activity log was created
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => 'leave_requested',
            'target_type' => User::class,
            'target_id' => $user->id,
        ]);

        // Assert notification was created for manager
        $this->assertDatabaseHas('notifications', [
            'user_id' => $manager->id,
            'type' => 'leave_requested',
            'read_at' => null,
        ]);

        // Assert leave history was created
        $this->assertDatabaseHas('leave_histories', [
            'leave_id' => $leave->id,
            'user_id' => $user->id,
            'action' => 'submitted',
            'old_status' => null,
            'new_status' => 'pending',
        ]);
    }

    /**
     * Test that leave request fails when user doesn't have enough leave days.
     */
    public function test_leave_request_fails_when_insufficient_days(): void
    {
        // Create a user with 20 total leave days
        $user = User::factory()->create([
            'role' => 'teacher',
            'total_leave_days' => 20,
            'remaining_leaves_current_year' => 20,
            'is_active' => true,
        ]);

        // Create approved leaves that use up 18 days, leaving only 2 days available
        // The calculateRemainingLeaves() method calculates from total_leave_days minus approved/pending
        // Must be in current year for currentYear() scope to work
        $currentYearStart = Carbon::now()->startOfYear()->addDays(10); // Early in current year
        $currentYearEnd = $currentYearStart->copy()->addDays(17); // 18 weekdays (approximately)
        
        Leave::create([
            'user_id' => $user->id,
            'category' => 'szabadsag',
            'start_date' => $currentYearStart,
            'end_date' => $currentYearEnd,
            'days_requested' => 18, // This will leave only 2 days remaining
            'status' => 'approved',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        // Refresh user to ensure relationship is loaded
        $user->refresh();
        
        // Verify the user now has only 2 days remaining
        $this->assertEquals(2, $user->calculateRemainingLeaves());

        // Calculate future dates that require 5 weekdays (more than available 2 days)
        $startDate = Carbon::tomorrow();
        $endDate = $startDate->copy()->addDays(4);

        // Authenticate as the user
        $this->actingAs($user);

        // Make POST request to create leave
        $response = $this->post('/szabadsagok/igenyles', [
            'category' => 'szabadsag',
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'reason' => 'Test leave request',
        ]);

        // Assert validation error
        $response->assertSessionHasErrors('days');

        // Assert leave was NOT created
        $this->assertDatabaseMissing('leaves', [
            'user_id' => $user->id,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
        ]);
    }

    /**
     * Test that leave request fails with past dates.
     */
    public function test_leave_request_fails_with_past_dates(): void
    {
        // Create a user
        $user = User::factory()->create([
            'role' => 'teacher',
            'total_leave_days' => 20,
            'remaining_leaves_current_year' => 20,
            'is_active' => true,
        ]);

        // Use past dates
        $startDate = Carbon::now()->subDays(5);
        $endDate = Carbon::now()->subDays(1);

        // Authenticate as the user
        $this->actingAs($user);

        // Make POST request to create leave
        $response = $this->post('/szabadsagok/igenyles', [
            'category' => 'szabadsag',
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'reason' => 'Test leave request',
        ]);

        // Assert validation error
        $response->assertSessionHasErrors('start_date');

        // Assert leave was NOT created
        $this->assertDatabaseMissing('leaves', [
            'user_id' => $user->id,
            'start_date' => $startDate->format('Y-m-d'),
        ]);
    }
}

