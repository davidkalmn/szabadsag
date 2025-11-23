<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\LeaveController;
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
        // Specific routes first (before wildcard routes)
        Route::get('sajat-kerelmek', [LeaveController::class, 'index'])
            ->middleware('role:teacher,manager,admin')
            ->name('sajat-kerelmek');
        
        Route::get('igenyles', [LeaveController::class, 'create'])
            ->middleware('role:teacher,manager,admin')
            ->name('igenyles');
        
        Route::post('igenyles', [LeaveController::class, 'store'])
            ->middleware('role:teacher,manager,admin')
            ->name('store');

        // manager: beosztottak kérelmei
        Route::get('kerelmek', [LeaveController::class, 'teamLeaves'])
            ->middleware('role:manager')
            ->name('kerelmek');

        // admin: összes kérelem
        Route::get('osszes-kerelem', [LeaveController::class, 'allLeaves'])
            ->middleware('role:admin')
            ->name('osszes-kerelem');

        // Wildcard routes last
        Route::get('{leave}', [LeaveController::class, 'show'])
            ->middleware('role:teacher,manager,admin')
            ->name('show');

        // manager és admin: jóváhagyás/elutasítás/érvénytelenítés
        Route::middleware('role:manager,admin')->group(function () {
        Route::post('{leave}/jovahagyas', [LeaveController::class, 'approve'])->name('approve');
        Route::post('{leave}/elutasitas', [LeaveController::class, 'reject'])->name('reject');
        Route::post('{leave}/ervenytelenites', [LeaveController::class, 'cancel'])->name('cancel');
        });
    });

    // --- Felhasználók (admin és manager) ---
    Route::get('/felhasznalok', [UserController::class, 'index'])
        ->middleware('role:admin,manager')
        ->name('felhasznalok.index');
    Route::get('/felhasznalok/uj', [UserController::class, 'create'])
        ->middleware('role:admin,manager')
        ->name('felhasznalok.create');
    Route::post('/felhasznalok', [UserController::class, 'store'])
        ->middleware('role:admin,manager')
        ->name('felhasznalok.store');
    Route::get('/felhasznalok/deaktivalt', [UserController::class, 'deactivated'])
        ->middleware('role:admin')
        ->name('felhasznalok.deactivated');
    Route::get('/felhasznalok/{user}', [UserController::class, 'show'])
        ->middleware('role:admin,manager')
        ->name('felhasznalok.show');
    Route::get('/felhasznalok/{user}/szerkesztes', [UserController::class, 'edit'])
        ->middleware('role:admin,manager')
        ->name('felhasznalok.edit');
    Route::put('/felhasznalok/{user}', [UserController::class, 'update'])
        ->middleware('role:admin,manager')
        ->name('felhasznalok.update');
    Route::delete('/felhasznalok/{user}/deaktivalas', [UserController::class, 'deactivate'])
        ->middleware('role:admin,manager')
        ->name('felhasznalok.deactivate');
    Route::post('/felhasznalok/{user}/ujraaktivalas', [UserController::class, 'reactivate'])
        ->middleware('role:admin')
        ->name('felhasznalok.reactivate');

    // --- Értesítések (minden belépett) ---
    Route::get('/ertesitesek', [NotificationController::class, 'index'])
        ->name('ertesitesek.index');
    Route::post('/ertesitesek/{notification}/olvasott', [NotificationController::class, 'markAsRead'])
        ->name('ertesitesek.read');
    Route::post('/ertesitesek/{notification}/olvasatlan', [NotificationController::class, 'markAsUnread'])
        ->name('ertesitesek.unread');
    Route::post('/ertesitesek/összes-olvasott', [NotificationController::class, 'markAllAsRead'])
        ->name('ertesitesek.read-all');
    Route::get('/ertesitesek/olvasatlan-szam', [NotificationController::class, 'getUnreadCount'])
        ->name('ertesitesek.unread-count');

    // --- Napló (csak manager és admin) ---
    Route::get('/naplo', [LogController::class, 'index'])
        ->middleware('role:manager,admin')
        ->name('naplo.index');

    // --- GYIK (mindenki) ---
    Route::get('/gyik', fn () => Inertia::render('Faq/Index'))->name('gyik');
});

require __DIR__.'/auth.php';
