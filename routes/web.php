<?php

use App\Http\Controllers\ProfileController;
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
    Route::delete('/beallitasok', [ProfileController::class, 'destroy'])->name('beallitasok.destroy');

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

    // --- Felhasználók (admin) ---
    Route::middleware('role:admin')->group(function () {
        Route::get('/felhasznalok', fn () => Inertia::render('Users/Index'))->name('felhasznalok.index');
        Route::get('/felhasznalok/{id}', fn ($id) => Inertia::render('Users/Show', ['id' => (int)$id]))->name('felhasznalok.show');
    });

    // --- Értesítések (minden belépett) ---
    Route::get('/ertesitesek', fn () => Inertia::render('Notifications/Index'))
        ->name('ertesitesek.index');

    // --- Napló (admin) ---
    Route::get('/naplo', fn () => Inertia::render('Logs/Index'))
        ->middleware('role:admin')
        ->name('naplo.index');

    // --- GYIK (mindenki) ---
    Route::get('/gyik', fn () => Inertia::render('Faq/Index'))->name('gyik');
});

require __DIR__.'/auth.php';
