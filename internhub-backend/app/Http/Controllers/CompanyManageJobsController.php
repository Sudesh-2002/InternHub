<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

use App\Models\InternshipListing;

class CompanyManageJobsController extends Controller
{
    /**
     * GET /api/company/manage-jobs
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $search = $request->search;
        $status = $request->status;

        $query = InternshipListing::withCount('applications')
            ->where('company_id', $user->id)
            ->latest();

        // Search
        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }

        // Filter
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $jobs = $query->get()->map(function ($job) {

            return [
                'id'          => $job->id,
                'title'       => $job->title,
                'location'    => $job->location,
                'type'        => $job->type,
                'status'      => $job->status,
                'applicants'  => $job->applications_count,
                'posted'      => optional($job->created_at)->format('Y-m-d'),
                'deadline'    => optional($job->deadline)->format('Y-m-d'),
                'salary'      => $job->salary,
                'duration'    => $job->duration,
                'vacancies'   => $job->vacancies,
                'description' => $job->description,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $jobs,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $job = InternshipListing::where('company_id', $user->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'location'    => 'nullable|string|max:255',
            'type'        => 'nullable|string|max:100',
            'salary'      => 'nullable|string|max:100',
            'deadline'    => 'nullable|date',
            'description' => 'nullable|string',
            'duration'    => 'nullable|string',
            'vacancies'   => 'nullable|integer',
        ]);

        $job->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Job updated successfully',
            'data'    => $job
        ]);
    }

    /**
     * DELETE /api/company/manage-jobs/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $job = InternshipListing::where('company_id', $user->id)
            ->findOrFail($id);

        $job->delete();

        return response()->json([
            'success' => true,
            'message' => 'Job deleted successfully',
        ]);
    }
}