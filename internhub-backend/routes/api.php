<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentProfileController;

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
});