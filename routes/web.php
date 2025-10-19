<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\NotificationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Profil
    Route::get('/beallitasok', [ProfileController::class, 'edit'])->name('beallitasok.edit');
    Route::patch('/beallitasok', [ProfileController::class, 'update'])->name('beallitasok.update');

    // --- Szabadságok ---
    Route::prefix('szabadsagok')->name('szabadsag.')->group(function () {
        // minden szerep: saját + új igénylés
        Route::middleware('role:teacher,manager,admin')->group(function () {
            Route::get('sajat-kerelmek', fn () => Inertia::render('Leaves/MyList'))->name('sajat-kerelmek');
            Route::get('igenyles', fn () => Inertia::render('Leaves/Apply'))->name('igenyles');
        });

        // manager és admin: beosztottak kérelmei
        Route::get('kerelmek', fn () => Inertia::render('Leaves/TeamIndex'))
            ->middleware('role:manager,admin')
            ->name('kerelmek');

        // admin: összes kérelem
        Route::get('osszes-kerelem', fn () => Inertia::render('Leaves/AllIndex'))
            ->middleware('role:admin')
            ->name('osszes-kerelem');
    });

    // --- Naptár ---
    Route::prefix('naptar')->name('naptar.')->group(function () {
        Route::get('sajat-kerelmek', fn () => Inertia::render('Calendar/Mine'))
            ->middleware('role:teacher,manager,admin')
            ->name('sajat-kerelmek');

        Route::get('kerelmek', fn () => Inertia::render('Calendar/Team'))
            ->middleware('role:manager,admin')
            ->name('kerelmek');

        Route::get('osszes', fn () => Inertia::render('Calendar/All'))
            ->middleware('role:admin')
            ->name('osszes');
    });

    // --- Felhasználók (admin és manager) ---
    Route::get('/felhasznalok', [UserController::class, 'index'])
        ->middleware('role:admin,manager')
        ->name('felhasznalok.index');
    Route::post('/felhasznalok', [UserController::class, 'store'])
        ->middleware('role:admin,manager')
        ->name('felhasznalok.store');
    Route::get('/felhasznalok/deactivated', [UserController::class, 'deactivated'])
        ->middleware('role:admin')
        ->name('felhasznalok.deactivated');
    Route::get('/felhasznalok/{user}', [UserController::class, 'show'])
        ->middleware('role:admin,manager')
        ->name('felhasznalok.show');
    Route::get('/felhasznalok/{user}/edit', [UserController::class, 'edit'])
        ->middleware('role:admin,manager')
        ->name('felhasznalok.edit');
    Route::put('/felhasznalok/{user}', [UserController::class, 'update'])
        ->middleware('role:admin,manager')
        ->name('felhasznalok.update');
    Route::delete('/felhasznalok/{user}/deactivate', [UserController::class, 'deactivate'])
        ->middleware('role:admin,manager')
        ->name('felhasznalok.deactivate');
    Route::post('/felhasznalok/{user}/reactivate', [UserController::class, 'reactivate'])
        ->middleware('role:admin')
        ->name('felhasznalok.reactivate');

    // --- Értesítések (minden belépett) ---
    Route::get('/ertesitesek', [NotificationController::class, 'index'])
        ->name('ertesitesek.index');
    Route::post('/ertesitesek/{notification}/read', [NotificationController::class, 'markAsRead'])
        ->name('ertesitesek.read');
    Route::post('/ertesitesek/read-all', [NotificationController::class, 'markAllAsRead'])
        ->name('ertesitesek.read-all');
    Route::get('/ertesitesek/unread-count', [NotificationController::class, 'getUnreadCount'])
        ->name('ertesitesek.unread-count');

    // --- Napló (csak manager és admin) ---
    Route::get('/naplo', [LogController::class, 'index'])
        ->middleware('role:manager,admin')
        ->name('naplo.index');

    // --- GYIK (mindenki) ---
    Route::get('/gyik', fn () => Inertia::render('Faq/Index'))->name('gyik');
});

require __DIR__.'/auth.php';
