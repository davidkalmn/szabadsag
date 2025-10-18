<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Traits\LogsActivity;
use App\Traits\CreatesNotifications;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class PasswordController extends Controller
{
    use LogsActivity, CreatesNotifications;
    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user = $request->user();
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Log password change
        $this->logActivity(
            'password_changed',
            'Jelszó módosítva',
            $user
        );

        // Create notification for password change
        $this->createNotification(
            $user->id,
            'password_changed',
            'Jelszó sikeresen módosítva',
            'A jelszavad sikeresen frissítve lett. Ha nem te végezted ezt a műveletet, azonnal változtasd meg a jelszavad!'
        );

        return back();
    }
}
