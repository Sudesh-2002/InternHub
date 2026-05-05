<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\InternshipListing;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class StudentDashboardController extends Controller
{
    // GET /api/student/dashboard
    public function index(): JsonResponse
    {
        $studentId = Auth::id();

        $apps = Application::with([
            'internship:id,title,company_id',
            'internship.company:id,name',
            'internship.company.companyProfile:user_id,company_name,logo_path',
        ])->where('student_id', $studentId)->latest()->get();

        $stats = [
            'total'    => $apps->count(),
            'pending'  => $apps->where('status', 'pending')->count(),
            'accepted' => $apps->where('status', 'accepted')->count(),
            'rejected' => $apps->where('status', 'rejected')->count(),
            'reviewed' => $apps->where('status', 'reviewed')->count(),
        ];

        $recent = $apps->take(3)->map(fn($a) => $this->formatApp($a));

        return response()->json([
            'stats'  => $stats,
            'recent' => $recent,
        ]);
    }

    // GET /api/student/applications
    public function applications(): JsonResponse
    {
        $apps = Application::with([
            'internship:id,title,company_id,location,type',
            'internship.company:id,name',
            'internship.company.companyProfile:user_id,company_name,logo_path',
        ])->where('student_id', Auth::id())->latest()->get();

        return response()->json([
            'data'  => $apps->map(fn($a) => $this->formatApp($a)),
            'total' => $apps->count(),
        ]);
    }

    private function formatApp(Application $a): array
    {
        $profile = $a->internship?->company?->companyProfile;
        return [
            'id'          => $a->id,
            'title'       => $a->internship?->title ?? '—',
            'company'     => $profile?->company_name ?? $a->internship?->company?->name ?? '—',
            'logo_url'    => $profile?->logo_url,
            'location'    => $a->internship?->location,
            'type'        => $a->internship?->type,
            'status'      => $a->status,
            'resume_url'  => $a->resume_path ? asset('storage/' . $a->resume_path) : null,
            'applied'     => $a->created_at?->format('M d, Y'),
        ];
    }
}
