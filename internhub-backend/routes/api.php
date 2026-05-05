<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentProfileController;
use App\Http\Controllers\InternshipListingController;
use App\Http\Controllers\CompanyProfileController;
use App\Http\Controllers\AdminStudentController;
use App\Http\Controllers\AdminCompanyVerificationController;
use App\Http\Controllers\AdminCompanyController;
use App\Http\Controllers\AdminProfileController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminInternshipController;
use App\Http\Controllers\CompanyManageJobsController;
use App\Http\Controllers\ApplicationController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // ── Student Profile ───────────────────────────────
    Route::get   ('/profile',        [StudentProfileController::class, 'show']);
    Route::put   ('/profile',        [StudentProfileController::class, 'update']);
    Route::post  ('/profile/resume', [StudentProfileController::class, 'uploadResume']);
    Route::delete('/profile/resume', [StudentProfileController::class, 'deleteResume']);
    Route::post  ('/profile/avatar', [StudentProfileController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [StudentProfileController::class, 'deleteAvatar']);

    Route::prefix('student')->middleware('role:student')->group(function () {
        // Browse internships
        Route::get('/internships', [InternshipListingController::class, 'browse']);
        Route::post('/apply', [ApplicationController::class, 'apply']);
        Route::get('/applications/check/{id}', [ApplicationController::class, 'myApplication']);
    });

    // ── Company Routes ────────────────────────────────
    Route::prefix('company')->middleware('role:company')->group(function () {
        Route::get   ('/profile',  [CompanyProfileController::class, 'show']);
        Route::post  ('/profile',  [CompanyProfileController::class, 'store']);
        Route::patch ('/profile',  [CompanyProfileController::class, 'update']);

        Route::get   ('/internships',                     [InternshipListingController::class, 'index']);
        Route::post  ('/internships',                     [InternshipListingController::class, 'store']);
        Route::get   ('/internships/{internshipListing}', [InternshipListingController::class, 'show']);
        Route::put   ('/internships/{internshipListing}', [InternshipListingController::class, 'update']);
        Route::delete('/internships/{internshipListing}', [InternshipListingController::class, 'destroy']);

        // Manage Jobs
        Route::get('/manage-jobs', [CompanyManageJobsController::class, 'index']);
        Route::delete('/manage-jobs/{id}', [CompanyManageJobsController::class, 'destroy']);
        Route::put('/manage-jobs/{id}', [CompanyManageJobsController::class, 'update']);
    });

    // ── Admin Routes ──────────────────────────────────
    Route::prefix('admin')->middleware('role:admin')->group(function () {

        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        Route::get   ('/profile',          [AdminProfileController::class, 'show']);
        Route::patch ('/profile',          [AdminProfileController::class, 'update']);
        Route::post  ('/profile/password', [AdminProfileController::class, 'changePassword']);
        Route::post  ('/profile/avatar',   [AdminProfileController::class, 'uploadAvatar']);
 
        // Student management
        Route::get   ('/students',              [AdminStudentController::class, 'index']);
        Route::get   ('/students/{id}',         [AdminStudentController::class, 'show']);
        Route::patch ('/students/{id}/status',  [AdminStudentController::class, 'updateStatus']);
        Route::delete('/students/{id}',         [AdminStudentController::class, 'destroy']);

        Route::get   ('/companies',             [AdminCompanyController::class, 'index']);
        Route::get   ('/companies/{id}',        [AdminCompanyController::class, 'show']);
        Route::patch ('/companies/{id}/status', [AdminCompanyController::class, 'updateStatus']);
        Route::delete('/companies/{id}',        [AdminCompanyController::class, 'destroy']);

        Route::get  ('/verifications',              [AdminCompanyVerificationController::class, 'index']);
        Route::get  ('/verifications/{id}',         [AdminCompanyVerificationController::class, 'show']);
        Route::post ('/verifications/{id}/review',  [AdminCompanyVerificationController::class, 'review']);

        // Internship Management
        Route::get   ('/internships',             [AdminInternshipController::class, 'index']);
        Route::patch ('/internships/{id}/status',[AdminInternshipController::class, 'updateStatus']);
        Route::delete('/internships/{id}',        [AdminInternshipController::class, 'destroy']);
    });
});