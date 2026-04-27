<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentProfileController;
use App\Http\Controllers\InternshipListingController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    Route::get('/profile',            [StudentProfileController::class, 'show']);
    Route::put('/profile',            [StudentProfileController::class, 'update']);
    Route::post('/profile/resume',    [StudentProfileController::class, 'uploadResume']);
    Route::delete('/profile/resume',  [StudentProfileController::class, 'deleteResume']);

    Route::prefix('company')->middleware('role:company')->group(function () {
        Route::get   ('/internships',         [InternshipListingController::class, 'index']);
        Route::post  ('/internships',         [InternshipListingController::class, 'store']);
        Route::get   ('/internships/{internshipListing}', [InternshipListingController::class, 'show']);
        Route::put   ('/internships/{internshipListing}', [InternshipListingController::class, 'update']);
        Route::delete('/internships/{internshipListing}', [InternshipListingController::class, 'destroy']);
    });

});