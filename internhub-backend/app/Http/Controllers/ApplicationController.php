<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\StudentProfile;
use App\Models\InternshipListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{
    public function apply(Request $request)
    {
        $useExisting = $request->boolean('use_existing_resume');

        // Validate — resume file only required if NOT using existing
        $request->validate([
            'internship_listing_id' => 'required|exists:internship_listings,id',
            'resume'                => $useExisting ? 'nullable' : 'required|file|mimes:pdf,doc,docx|max:2048',
            'cover_note'            => 'nullable|string|max:2000',
        ]);

        // Prevent duplicate application
        $exists = Application::where('student_id', Auth::id())
            ->where('internship_listing_id', $request->internship_listing_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'You have already applied for this internship.'], 400);
        }

        // Resolve resume path
        if ($useExisting) {
            // Pull the saved resume from the student's profile
            $profile = StudentProfile::where('user_id', Auth::id())->first();

            if (!$profile || !$profile->resume_path) {
                return response()->json(['message' => 'No resume found on your profile. Please upload one.'], 422);
            }

            $resumePath = $profile->resume_path;
        } else {
            // Store the newly uploaded file
            $resumePath = $request->file('resume')->store('applications/resumes', 'public');
        }

        // Create the application
        $application = Application::create([
            'student_id'            => Auth::id(),
            'internship_listing_id' => $request->internship_listing_id,
            'resume_path'           => $resumePath,
            'cover_note'            => $request->cover_note,
            'status'                => 'pending',
        ]);

        return response()->json([
            'message' => 'Application submitted successfully.',
            'data'    => $application,
        ], 201);
    }

    public function myApplication($id)
    {
        $application = Application::where('student_id', Auth::id())
            ->where('internship_listing_id', $id)
            ->first();

        return response()->json([
            'applied' => (bool) $application,
            'status'  => $application?->status,
        ]);
    }

    // ── Company: list applications for their internships ──────────────────
    public function companyIndex(Request $request): JsonResponse
    {
        $companyId = Auth::id();

        $query = Application::with([
            'student:id,name,email',
            'student.studentProfile:user_id,location,avatar_path',
            'internship:id,title,company_id',
        ])->whereHas('internship', fn($q) => $q->where('company_id', $companyId));

        if ($jobId = $request->job_id) {
            $query->where('internship_listing_id', $jobId);
        }

        if ($status = $request->status) {
            if ($status !== 'all') $query->where('status', $status);
        }

        if ($s = $request->search) {
            $query->whereHas('student', fn($q) => $q->where('name', 'like', "%$s%")
                ->orWhere('email', 'like', "%$s%"));
        }

        $apps = $query->latest()->paginate(20);

        return response()->json([
            'data' => $apps->map(fn($a) => $this->formatForCompany($a)),
            'meta' => [
                'total'        => $apps->total(),
                'current_page' => $apps->currentPage(),
                'last_page'    => $apps->lastPage(),
                'from'         => $apps->firstItem(),
                'to'           => $apps->lastItem(),
            ],
        ]);
    }

    // ── Company: accept / reject / review an application ─────────────────
    public function companyUpdateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => 'required|in:pending,reviewed,accepted,rejected']);

        $app = Application::with('internship')->findOrFail($id);

        // Only the company that owns the listing can update
        if ($app->internship?->company_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $app->update(['status' => $request->status]);

        return response()->json(['message' => 'Status updated.', 'status' => $app->status]);
    }

    private function formatForCompany(Application $a): array
    {
        return [
            'id'         => $a->id,
            'jobId'      => $a->internship_listing_id,
            'name'       => $a->student?->name ?? '—',
            'email'      => $a->student?->email ?? '—',
            'avatar_url' => $a->student?->studentProfile?->avatar_url,
            'university' => $a->student?->studentProfile?->location ?? '—',
            'job'        => $a->internship?->title ?? '—',
            'status'     => $a->status,
            'resume_url' => $a->resume_path ? asset('storage/' . $a->resume_path) : null,
            'applied'    => $a->created_at?->format('Y-m-d'),
        ];
    }
}