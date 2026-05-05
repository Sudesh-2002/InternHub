<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\InternshipListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyDashboardController extends Controller
{
    // GET /api/company/dashboard
    public function index(Request $request): JsonResponse
    {
        $companyId = Auth::id();
        $user      = Auth::user();

        // Load company profile for the name
        $profile = $user->companyProfile;

        // ── Stats ──────────────────────────────────────────────────────────
        $totalJobs        = InternshipListing::where('company_id', $companyId)->count();
        $activeJobs       = InternshipListing::where('company_id', $companyId)->where('status', 'active')->count();
        $pendingJobs      = InternshipListing::where('company_id', $companyId)->where('status', 'pending')->count();
        $totalApplicants  = Application::whereHas(
            'internship', fn($q) => $q->where('company_id', $companyId)
        )->count();
        $pendingApplicants = Application::whereHas(
            'internship', fn($q) => $q->where('company_id', $companyId)
        )->where('status', 'pending')->count();

        // ── Recent jobs (last 5) ───────────────────────────────────────────
        $recentJobs = InternshipListing::withCount('applications')
            ->where('company_id', $companyId)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($j) => [
                'id'         => $j->id,
                'title'      => $j->title,
                'status'     => $j->status,
                'applicants' => $j->applications_count,
                'posted'     => $j->created_at?->format('M d, Y'),
                'deadline'   => $j->deadline?->format('M d, Y'),
                'type'       => $j->type,
            ]);

        // ── Recent applicants (last 5) ─────────────────────────────────────
        $recentApplicants = Application::with([
            'student:id,name,email',
            'student.studentProfile:user_id,avatar_path',
            'internship:id,title',
        ])
            ->whereHas('internship', fn($q) => $q->where('company_id', $companyId))
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($a) => [
                'id'         => $a->id,
                'name'       => $a->student?->name ?? '—',
                'email'      => $a->student?->email ?? '—',
                'avatar_url' => $a->student?->studentProfile?->avatar_url,
                'job'        => $a->internship?->title ?? '—',
                'status'     => $a->status,
                'applied'    => $a->created_at?->format('M d'),
            ]);

        return response()->json([
            'company_name'       => $profile?->company_name ?? $user->name,
            'stats' => [
                'total_jobs'         => $totalJobs,
                'active_jobs'        => $activeJobs,
                'pending_jobs'       => $pendingJobs,
                'total_applicants'   => $totalApplicants,
                'pending_applicants' => $pendingApplicants,
            ],
            'recent_jobs'        => $recentJobs,
            'recent_applicants'  => $recentApplicants,
        ]);
    }
}
