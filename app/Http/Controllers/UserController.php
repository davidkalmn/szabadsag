<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\LogsActivity;
use App\Traits\CreatesNotifications;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    use LogsActivity, CreatesNotifications;
    /**
     * Display a listing of users.
     */
    public function index()
    {
        $currentUser = auth()->user();
        
        // Filter users based on current user's role
        if ($currentUser->role === 'admin') {
            // Admins can see all users
            $users = User::with('manager')->get();
        } elseif ($currentUser->role === 'manager') {
            // Managers can see their subordinates, themselves, and admins (for manager selection)
            $users = User::with('manager')
                ->where(function($query) use ($currentUser) {
                    $query->where('manager_id', $currentUser->id)
                          ->orWhere('id', $currentUser->id)
                          ->orWhere('role', 'admin');
                })
                ->get();
        } else {
            // Teachers can only see themselves
            $users = User::with('manager')->where('id', $currentUser->id)->get();
        }
        
        return inertia('Users/Index', [
            'users' => $users,
            'currentUser' => $currentUser
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $currentUser = auth()->user();
        
        // Determine allowed roles based on current user's role
        $allowedRoles = [];
        if ($currentUser->role === 'admin') {
            $allowedRoles = ['teacher', 'manager', 'admin'];
        } elseif ($currentUser->role === 'manager') {
            $allowedRoles = ['teacher', 'manager'];
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:' . implode(',', $allowedRoles),
            'manager_id' => 'nullable|exists:users,id',
            'total_leave_days' => 'required|integer|min:1|max:50',
        ]);

        // Set manager_id based on role and current user
        $managerId = $request->manager_id;
        if ($request->role === 'admin') {
            $managerId = null; // Admins don't have managers
        } elseif (!$managerId) {
            // If no manager specified, set current user as manager
            $managerId = $currentUser->id;
        }

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'manager_id' => $managerId,
            'total_leave_days' => $request->total_leave_days,
        ]);

        // Log the user creation
        $newUser = User::where('email', $request->email)->first();
        $this->logActivity(
            'user_created',
            "Új felhasználó létrehozva: {$newUser->name} ({$newUser->email}) - Szerepkör: " . 
            ($newUser->role === 'teacher' ? 'Tanár' : 
             ($newUser->role === 'manager' ? 'Menedzser' : 'Admin')),
            $newUser
        );

        return redirect()->route('felhasznalok.index')
            ->with('success', 'Felhasználó sikeresen létrehozva!');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $currentUser = auth()->user();
        
        // Check if current user is authorized to view this user
        if ($currentUser->role === 'admin') {
            // Admins can see all users
        } elseif ($currentUser->role === 'manager') {
            // Managers can see their subordinates, themselves, and admins
            if ($user->id !== $currentUser->id && 
                $user->manager_id !== $currentUser->id && 
                $user->role !== 'admin') {
                abort(403, 'Nincs jogosultságod ennek a felhasználónak a megtekintéséhez.');
            }
        } else {
            // Teachers can only see themselves
            if ($user->id !== $currentUser->id) {
                abort(403, 'Nincs jogosultságod ennek a felhasználónak a megtekintéséhez.');
            }
        }
        
        $user->load('manager', 'subordinates');
        
        return inertia('Users/Show', [
            'user' => $user,
            'currentUser' => $currentUser
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        $currentUser = auth()->user();
        
        // Check if current user is authorized to edit this user
        if ($currentUser->role === 'admin') {
            // Admins can edit all users
        } elseif ($currentUser->role === 'manager') {
            // Managers can only edit their subordinates (not other managers or admins)
            if ($user->id === $currentUser->id) {
                // Managers can edit themselves (redirect to profile)
                return redirect()->route('beallitasok.edit');
            } elseif ($user->role !== 'teacher' || $user->manager_id !== $currentUser->id) {
                abort(403, 'Nincs jogosultságod ennek a felhasználónak a szerkesztéséhez.');
            }
        } else {
            // Teachers can only edit themselves (redirect to profile)
            if ($user->id !== $currentUser->id) {
                abort(403, 'Nincs jogosultságod ennek a felhasználónak a szerkesztéséhez.');
            }
            return redirect()->route('beallitasok.edit');
        }
        
        // Get all users for manager selection (admins and managers only)
        $availableManagers = User::whereIn('role', ['admin', 'manager'])->get();
        
        return inertia('Users/Edit', [
            'user' => $user,
            'availableManagers' => $availableManagers,
            'currentUser' => $currentUser
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $currentUser = auth()->user();
        
        // Check if current user is authorized to edit this user
        if ($currentUser->role === 'admin') {
            // Admins can edit all users
        } elseif ($currentUser->role === 'manager') {
            // Managers can only edit their subordinates (not other managers or admins)
            if ($user->id === $currentUser->id) {
                // Managers editing themselves should use profile update
                return redirect()->route('beallitasok.edit');
            } elseif ($user->role !== 'teacher' || $user->manager_id !== $currentUser->id) {
                abort(403, 'Nincs jogosultságod ennek a felhasználónak a szerkesztéséhez.');
            }
        } else {
            // Teachers can only edit themselves (redirect to profile)
            if ($user->id !== $currentUser->id) {
                abort(403, 'Nincs jogosultságod ennek a felhasználónak a szerkesztéséhez.');
            }
            return redirect()->route('beallitasok.edit');
        }

        // Determine allowed roles based on current user's role
        $allowedRoles = [];
        if ($currentUser->role === 'admin') {
            $allowedRoles = ['teacher', 'manager', 'admin'];
        } elseif ($currentUser->role === 'manager') {
            $allowedRoles = ['teacher']; // Managers can only edit teachers
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:' . implode(',', $allowedRoles),
            'manager_id' => 'nullable|exists:users,id',
            'total_leave_days' => 'required|integer|min:1|max:50',
        ]);

        // Store original data for logging
        $originalData = $user->only(['name', 'email', 'role', 'manager_id', 'total_leave_days']);

        // Set manager_id based on role
        $managerId = $request->manager_id;
        if ($request->role === 'admin') {
            $managerId = null; // Admins don't have managers
        } elseif (!$managerId) {
            // If no manager specified, set current user as manager
            $managerId = $currentUser->id;
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'manager_id' => $managerId,
            'total_leave_days' => $request->total_leave_days,
        ]);

        // Log the user update
        $changes = [];
        if ($user->wasChanged('name')) {
            $changes[] = "Név: '{$originalData['name']}' → '{$user->name}'";
            
            // Create notification for name change
            $roleText = $currentUser->role === 'admin' ? 'Admin' : 'Menedzser';
            $this->createNotification(
                $user->id,
                'user_updated',
                'Profil módosítva',
                "{$currentUser->name} ({$roleText}) módosította a neved: '{$originalData['name']}' → '{$user->name}'"
            );
        }
        if ($user->wasChanged('email')) {
            $changes[] = "Email: '{$originalData['email']}' → '{$user->email}'";
            
            // Create notification for email change
            $roleText = $currentUser->role === 'admin' ? 'Admin' : 'Menedzser';
            $this->createNotification(
                $user->id,
                'user_updated',
                'Profil módosítva',
                "{$currentUser->name} ({$roleText}) módosította az email címed: '{$originalData['email']}' → '{$user->email}'"
            );
        }
        if ($user->wasChanged('role')) {
            $originalRole = $originalData['role'] === 'teacher' ? 'Tanár' : 
                           ($originalData['role'] === 'manager' ? 'Menedzser' : 'Admin');
            $newRole = $user->role === 'teacher' ? 'Tanár' : 
                      ($user->role === 'manager' ? 'Menedzser' : 'Admin');
            $changes[] = "Szerepkör: '{$originalRole}' → '{$newRole}'";

            // Create notification for role change
            $roleText = $currentUser->role === 'admin' ? 'Admin' : 'Menedzser';
            $this->createNotification(
                $user->id,
                'user_updated',
                'Szerepkör módosítva',
                "{$currentUser->name} ({$roleText}) módosította a szerepköröd: '{$originalRole}' → '{$newRole}'"
            );
        }
        if ($user->wasChanged('manager_id')) {
            $originalManager = $originalData['manager_id'] ? User::find($originalData['manager_id'])->name : 'Nincs';
            $newManager = $user->manager_id ? $user->manager->name : 'Nincs';
            $changes[] = "Menedzser: '{$originalManager}' → '{$newManager}'";
            
            // If there's a new manager, create an additional log entry for them
            if ($user->manager_id && $user->manager_id !== $originalData['manager_id']) {
                $this->logActivity(
                    'user_updated',
                    "Új beosztott hozzárendelve: {$user->name} ({$user->email}) - Szerepkör: " . 
                    ($user->role === 'teacher' ? 'Tanár' : 
                     ($user->role === 'manager' ? 'Menedzser' : 'Admin')),
                    $user->manager // Target the new manager
                );

                // Create notification for the user being reassigned
                $originalManagerName = $originalData['manager_id'] ? User::find($originalData['manager_id'])->name : 'Nincs menedzser';
                $newManagerName = $user->manager->name;
                $roleText = $currentUser->role === 'admin' ? 'Admin' : 'Menedzser';
                
                $this->createNotification(
                    $user->id,
                    'user_updated',
                    'Menedzser módosítva',
                    "{$currentUser->name} ({$roleText}) módosította a menedzsered: '{$originalManagerName}' → '{$newManagerName}'"
                );
            }
        }
        if ($user->wasChanged('total_leave_days')) {
            $changes[] = "Szabadság napok: '{$originalData['total_leave_days']}' → '{$user->total_leave_days}'";
            
            // Create notification for leave days change
            $roleText = $currentUser->role === 'admin' ? 'Admin' : 'Menedzser';
            $this->createNotification(
                $user->id,
                'user_updated',
                'Szabadság napok módosítva',
                "{$currentUser->name} ({$roleText}) módosította a szabadság napjaid számát: '{$originalData['total_leave_days']}' → '{$user->total_leave_days}' nap"
            );
        }

        if (!empty($changes)) {
            $this->logActivity(
                'user_updated',
                "Felhasználó módosítva: {$user->name} ({$user->email}) - " . implode(', ', $changes),
                $user
            );
        }

        // Check if current user can still view this user after the update
        $canStillView = false;
        if ($currentUser->role === 'admin') {
            $canStillView = true;
        } elseif ($currentUser->role === 'manager') {
            // Check if user is still a subordinate or if it's the current user
            $canStillView = ($user->id === $currentUser->id) || 
                           ($user->role === 'teacher' && $user->manager_id === $currentUser->id) ||
                           ($user->role === 'admin');
        } else {
            $canStillView = ($user->id === $currentUser->id);
        }

        // If user can still view, redirect to user details, otherwise redirect to users list
        if ($canStillView) {
            return redirect()->route('felhasznalok.show', $user)
                ->with('success', 'Felhasználó sikeresen frissítve!');
        } else {
            return redirect()->route('felhasznalok.index')
                ->with('success', 'Felhasználó sikeresen frissítve! A felhasználó már nem tartozik a te beosztottaid közé.');
        }
    }
}
