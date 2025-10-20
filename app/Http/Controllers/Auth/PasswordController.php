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
            'password' => ['required', Password::defaults(), 'confirmed', 'different:current_password'],
        ], [
            'password.different' => 'Az új jelszó nem egyezhet meg a jelenlegi jelszóval.',
        ]);

        $user = $request->user();

        // Extra safety: also compare against the stored hash
        if (\Illuminate\Support\Facades\Hash::check($validated['password'], $user->password)) {
            return back()->withErrors([
                'password' => 'Az új jelszó nem egyezhet meg a jelenlegi jelszóval.',
            ]);
        }
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
