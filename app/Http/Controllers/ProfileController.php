<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Traits\LogsActivity;
use App\Traits\CreatesNotifications;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    use LogsActivity, CreatesNotifications;
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $originalData = $user->only(['name', 'email']);
        
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // Log profile changes
        $changes = [];
        if ($user->wasChanged('name')) {
            $changes[] = "Név: '{$originalData['name']}' → '{$user->name}'";
        }
        if ($user->wasChanged('email')) {
            $changes[] = "Email: '{$originalData['email']}' → '{$user->email}'";
        }

        if (!empty($changes)) {
            $this->logActivity(
                'profile_updated',
                'Profil adatok módosítva: ' . implode(', ', $changes),
                $user
            );

            // Create notification for the user
            $this->createNotification(
                $user->id,
                'profile_updated',
                'Profil sikeresen frissítve',
                'A profil adataid sikeresen módosítva lettek: ' . implode(', ', $changes)
            );
        }

        return Redirect::route('beallitasok.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Log account deletion before deleting
        $this->logActivity(
            'account_deleted',
            "Felhasználói fiók törölve: {$user->name} ({$user->email})",
            $user
        );

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
