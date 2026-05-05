<?php

namespace App\Http\Controllers;

use App\Models\InternshipListing;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminInternshipController extends Controller
{
    /**
     * GET /api/admin/internships
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->search;
        $status = $request->status;

        $query = InternshipListing::with([
            'company.companyProfile'
        ])
        ->withCount('applications')
        ->latest();

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {

                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('company.companyProfile', function ($sub) use ($search) {
                      $sub->where('company_name', 'like', "%{$search}%");
                  });

            });
        }

        // Status filter
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $internships = $query->get()->map(function ($job) {

            return [
                'id'            => $job->id,
                'title'         => $job->title,
                'company'       => optional($job->company?->companyProfile)->company_name ?? 'Unknown Company',
                'location'      => $job->location,
                'deadline'      => optional($job->deadline)?->format('Y-m-d'),
                'status'        => $job->status,
                'posted'        => optional($job->created_at)?->format('Y-m-d'),
                'applications'  => $job->applications_count,
                'description'   => $job->description,
                'type'          => $job->type,
                'salary'        => $job->salary,
                'duration'      => $job->duration,
                'vacancies'     => $job->vacancies,
                'requirements'  => $job->requirements,
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => [
                'internships' => $internships,

                'stats' => [
                    'total'     => InternshipListing::count(),
                    'approved'  => InternshipListing::where('status', 'approved')->count(),
                    'pending'   => InternshipListing::where('status', 'pending')->count(),
                    'flagged'   => InternshipListing::where('status', 'flagged')->count(),
                ]
            ]
        ]);
    }

    /**
     * PATCH /api/admin/internships/{id}/status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,pending,rejected,flagged',
        ]);

        $job = InternshipListing::findOrFail($id);

        $job->status = $validated['status'];
        $job->save();

        // Notify the company
        $titleMap = [
            'approved' => '✅ Listing Approved',
            'rejected' => '❌ Listing Rejected',
            'pending'  => '⏳ Listing Under Review',
            'flagged'  => '🚩 Listing Flagged',
        ];
        $msgMap = [
            'approved' => "Your internship listing \"" . $job->title . "\" has been approved and is now live.",
            'rejected' => "Your internship listing \"" . $job->title . "\" has been rejected by the admin.",
            'pending'  => "Your internship listing \"" . $job->title . "\" is under review.",
            'flagged'  => "Your internship listing \"" . $job->title . "\" has been flagged for review.",
        ];
        Notification::notify(
            $job->company_id,
            'listing',
            $titleMap[$validated['status']] ?? 'Listing Updated',
            $msgMap[$validated['status']] ?? 'Your listing status has been updated.'
        );

        return response()->json([
            'success' => true,
            'message' => 'Internship updated successfully',
        ]);
    }

    /**
     * DELETE /api/admin/internships/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $job = InternshipListing::findOrFail($id);

        $job->delete();

        return response()->json([
            'success' => true,
            'message' => 'Internship deleted successfully',
        ]);
    }
}