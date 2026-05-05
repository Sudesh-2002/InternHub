<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminApplicationController extends Controller
{
    // GET /api/admin/applications
    public function index(Request $request): JsonResponse
    {
        $query = Application::with([
            'student:id,name,email',
            'student.studentProfile:user_id,avatar_path',
            'internship:id,title,company_id',
            'internship.company:id,name',
            'internship.company.companyProfile:user_id,company_name',
        ]);

        // Search
        if ($s = $request->search) {
            $query->where(function ($q) use ($s) {
                $q->whereHas('student', fn($q2) => $q2->where('name', 'like', "%$s%"))
                  ->orWhereHas('internship', fn($q2) => $q2->where('title', 'like', "%$s%"))
                  ->orWhereHas('internship.company', fn($q2) => $q2->where('company_name', 'like', "%$s%"));
            });
        }

        // Status / spam filter
        if ($f = $request->filter) {
            if ($f === 'flagged') {
                $query->where('is_flagged', true);
            } elseif ($f !== 'all') {
                $query->where('status', $f);
            }
        }

        $apps = $query->latest()->paginate(20);

        return response()->json([
            'data' => $apps->map(fn($a) => $this->format($a)),
            'meta' => [
                'total'        => $apps->total(),
                'current_page' => $apps->currentPage(),
                'last_page'    => $apps->lastPage(),
                'from'         => $apps->firstItem(),
                'to'           => $apps->lastItem(),
            ],
        ]);
    }

    // PATCH /api/admin/applications/{id}/flag
    public function toggleFlag(int $id): JsonResponse
    {
        $app = Application::findOrFail($id);
        $app->update(['is_flagged' => !$app->is_flagged]);

        return response()->json([
            'message'    => $app->is_flagged ? 'Application flagged.' : 'Application unflagged.',
            'is_flagged' => $app->is_flagged,
        ]);
    }


    private function format(Application $a): array
    {
        $companyUser = $a->internship?->company;
        $companyName = $companyUser?->companyProfile?->company_name
                    ?? $companyUser?->name
                    ?? '—';

        return [
            'id'         => $a->id,
            'student'    => $a->student?->name ?? '—',
            'avatar_url' => $a->student?->studentProfile?->avatar_url,
            'email'      => $a->student?->email,
            'company'    => $companyName,
            'job'        => $a->internship?->title ?? '—',
            'status'     => $a->status,
            'is_flagged' => (bool) $a->is_flagged,
            'resume_url' => $a->resume_path ? asset('storage/' . $a->resume_path) : null,
            'applied'    => $a->created_at?->format('Y-m-d'),
        ];
    }
}
