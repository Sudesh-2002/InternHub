<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// ✅ Public routes (no login needed)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ✅ Protected routes (must be logged in)
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // 🎓 Student only
    Route::middleware('role:student')->group(function () {
        // add student routes here later
    });

    // 🏢 Company only
    Route::middleware('role:company')->group(function () {
        // add company routes here later
    });

    // 🛠️ Admin only
    Route::middleware('role:admin')->group(function () {
        // add admin routes here later
    });

});
