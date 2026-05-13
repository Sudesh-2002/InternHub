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
use App\Http\Controllers\CompanyDashboardController;
use App\Http\Controllers\CompanyNotificationController;
use App\Http\Controllers\StudentDashboardController;
use App\Http\Controllers\StudentNotificationController;
use App\Http\Controllers\AdminApplicationController;
use App\Http\Controllers\AdminLoginLogController;
use App\Http\Controllers\AdminAnnouncementController;
use App\Http\Controllers\AdminRolePermissionController;
use App\Http\Controllers\AdminModerationController;
use App\Http\Controllers\AdminReportsController;
use App\Http\Controllers\SupportTicketController;
use App\Http\Controllers\AdminSupportController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout',  [AuthController::class, 'logout']);
    Route::post('/timeout', [AuthController::class, 'timeout']);
    Route::get ('/me',      [AuthController::class, 'me']);

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

        // Student dashboard & applications
        Route::get('/dashboard',    [StudentDashboardController::class, 'index']);
        Route::get('/applications', [StudentDashboardController::class, 'applications']);

        // Student notifications
        Route::get  ('/notifications',           [StudentNotificationController::class, 'index']);
        Route::patch('/notifications/read-all',  [StudentNotificationController::class, 'markAllRead']);
        Route::patch('/notifications/{id}/read', [StudentNotificationController::class, 'markRead']);

        // Support tickets
        Route::get  ('/support-tickets',              [SupportTicketController::class, 'index']);
        Route::post ('/support-tickets',              [SupportTicketController::class, 'store']);
        Route::get  ('/support-tickets/{id}',         [SupportTicketController::class, 'show']);
        Route::post ('/support-tickets/{id}/reply',   [SupportTicketController::class, 'reply']);
    });

    // ── Company Routes ────────────────────────────────
    Route::prefix('company')->middleware('role:company')->group(function () {
        Route::get   ('/dashboard', [CompanyDashboardController::class, 'index']);
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

        // Applications received by this company
        Route::get  ('/applications',              [ApplicationController::class, 'companyIndex']);
        Route::patch('/applications/{id}/status',  [ApplicationController::class, 'companyUpdateStatus']);

        // Notifications
        Route::get  ('/notifications',             [CompanyNotificationController::class, 'index']);
        Route::patch('/notifications/read-all',    [CompanyNotificationController::class, 'markAllRead']);
        Route::patch('/notifications/{id}/read',   [CompanyNotificationController::class, 'markRead']);

        // Support tickets
        Route::get  ('/support-tickets',              [SupportTicketController::class, 'index']);
        Route::post ('/support-tickets',              [SupportTicketController::class, 'store']);
        Route::get  ('/support-tickets/{id}',         [SupportTicketController::class, 'show']);
        Route::post ('/support-tickets/{id}/reply',   [SupportTicketController::class, 'reply']);
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

        // Applications
        Route::get   ('/applications',           [AdminApplicationController::class, 'index']);
        Route::patch ('/applications/{id}/flag', [AdminApplicationController::class, 'toggleFlag']);

        // Login Logs
        Route::get('/login-logs', [AdminLoginLogController::class, 'index']);

        // Announcements
        Route::get   ('/announcements',       [AdminAnnouncementController::class, 'index']);
        Route::post  ('/announcements',       [AdminAnnouncementController::class, 'store']);
        Route::put   ('/announcements/{id}',  [AdminAnnouncementController::class, 'update']);
        Route::delete('/announcements/{id}',  [AdminAnnouncementController::class, 'destroy']);

        // User search (for specific-user announcement targeting)
        Route::get('/users/search', [AdminAnnouncementController::class, 'userSearch']);

        // Roles & Permissions
        Route::get  ('/role-permissions',        [AdminRolePermissionController::class, 'index']);
        Route::patch('/role-permissions',        [AdminRolePermissionController::class, 'update']);
        Route::post ('/role-permissions/reset',  [AdminRolePermissionController::class, 'reset']);

        // Moderation stats
        Route::get('/moderation/stats', [AdminModerationController::class, 'stats']);

        // Reports & Analytics
        Route::get('/reports', [AdminReportsController::class, 'index']);

        // Support Center
        Route::get   ('/support-tickets',               [AdminSupportController::class, 'index']);
        Route::get   ('/support-tickets/{id}',          [AdminSupportController::class, 'show']);
        Route::patch ('/support-tickets/{id}/status',   [AdminSupportController::class, 'updateStatus']);
        Route::post  ('/support-tickets/{id}/reply',    [AdminSupportController::class, 'reply']);
    });
});