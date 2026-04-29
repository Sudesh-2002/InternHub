<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminStudentController extends Controller
{
    /* ────────────────────────────────────────────────────
     |  GET  /admin/students
     |  List all students with basic info + profile snippet.
     |  Supports: ?search=, ?status=, ?per_page=
     * ─────────────────────────────────────────────────── */
    public function index(Request $request): JsonResponse
    {
        $query = User::students()
            ->with(['studentProfile:user_id,phone,location,skills,resume_path,resume_name,education,github,linkedin'])
            ->withCount('applications')
            ->orderByDesc('created_at');

        // Search by name, email
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name',  'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->query('status')) {
            if (in_array($status, ['active', 'suspended', 'inactive'])) {
                $query->withStatus($status);
            }
        }

        $perPage  = (int) $request->query('per_page', 20);
        $students = $query->paginate($perPage);

        $students->getCollection()->transform(fn ($u) => $this->formatRow($u));

        return response()->json([
            'success' => true,
            'data'    => $students,
            'stats'   => $this->stats(),
        ]);
    }

    /* ────────────────────────────────────────────────────
     |  GET  /admin/students/{id}
     |  Full student profile for the detail modal.
     * ─────────────────────────────────────────────────── */
    public function show(int $id): JsonResponse
    {
        $user = User::students()
            ->with(['studentProfile', 'applications'])
            ->withCount('applications')
            ->findOrFail($id);

        $profile = $user->studentProfile;

        return response()->json([
            'success' => true,
            'data'    => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'status'       => $user->status,
                'registered'   => $user->created_at->format('Y-m-d'),
                'applications_count' => $user->applications_count,

                // Profile fields (null-safe)
                'phone'        => $profile?->phone,
                'location'     => $profile?->location,
                'summary'      => $profile?->summary,
                'skills'       => $profile?->skills      ?? [],
                'education'    => $profile?->education   ?? [],
                'experience'   => $profile?->experience  ?? [],
                'projects'     => $profile?->projects    ?? [],
                'github'       => $profile?->github,
                'linkedin'     => $profile?->linkedin,
                'portfolio'    => $profile?->portfolio,
                'resume_name'  => $profile?->resume_name,
                'resume_url'   => $profile?->resume_url,  // accessor
            ],
        ]);
    }

    /* ────────────────────────────────────────────────────
     |  PATCH  /admin/students/{id}/status
     |  Change a student's status.
     * ─────────────────────────────────────────────────── */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', Rule::in(['active', 'suspended', 'inactive'])],
        ]);

        $user = User::students()->findOrFail($id);
        $user->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => "Student status updated to {$request->status}.",
            'data'    => ['id' => $user->id, 'status' => $user->status],
        ]);
    }

    /* ────────────────────────────────────────────────────
     |  DELETE  /admin/students/{id}
     |  Hard-delete a student account (cascades to profile).
     * ─────────────────────────────────────────────────── */
    public function destroy(int $id): JsonResponse
    {
        $user = User::students()->findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Student account deleted.',
        ]);
    }

    /* ── Private helpers ─────────────────────────── */

    private function formatRow(User $u): array
    {
        $p = $u->studentProfile;
        return [
            'id'           => $u->id,
            'name'         => $u->name,
            'email'        => $u->email,
            'status'       => $u->status,
            'registered'   => $u->created_at->format('Y-m-d'),
            'applications_count' => $u->applications_count,
            'location'     => $p?->location,
            'skills'       => $p?->skills ?? [],
            'resume_name'  => $p?->resume_name,
            // education: first entry for table preview
            'university'   => $p?->education[0]['university'] ?? null,
            'degree'       => $p?->education[0]['degree']     ?? null,
        ];
    }

    private function stats(): array
    {
        $base = User::students();
        return [
            'total'     => (clone $base)->count(),
            'active'    => (clone $base)->withStatus('active')->count(),
            'suspended' => (clone $base)->withStatus('suspended')->count(),
            'inactive'  => (clone $base)->withStatus('inactive')->count(),
        ];
    }
}