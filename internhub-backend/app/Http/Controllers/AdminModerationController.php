<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\InternshipListing;
use Illuminate\Http\JsonResponse;

class AdminModerationController extends Controller
{
    // GET /api/admin/moderation/stats
    public function stats(): JsonResponse
    {
        return response()->json([
            'flagged_applications' => Application::where('is_flagged', true)->count(),
            'flagged_listings'     => InternshipListing::where('status', 'flagged')->count(),
            'pending_listings'     => InternshipListing::where('status', 'pending')->count(),
        ]);
    }
}
