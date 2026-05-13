<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\InternshipListing;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminReportsController extends Controller
{
    // GET /api/admin/reports?period=6m
    public function index(Request $request): JsonResponse
    {
        $period    = $request->input('period', '6m');
        $months    = match ($period) {
            '1m'  => 1,
            '3m'  => 3,
            '1y'  => 12,
            default => 6,   // 6m
        };

        $startDate = Carbon::now()->subMonths($months)->startOfMonth();

        // ── Summary KPIs ──────────────────────────────────────────────────
        $totalStudents     = User::where('role', 'student')->count();
        $totalCompanies    = User::where('role', 'company')->count();
        $totalInternships  = InternshipListing::count();
        $totalApplications = Application::count();
        $acceptedApps      = Application::where('status', 'accepted')->count();
        $acceptanceRate    = $totalApplications > 0
            ? round(($acceptedApps / $totalApplications) * 100, 1)
            : 0;
        $avgAppsPerListing = $totalInternships > 0
            ? round($totalApplications / $totalInternships, 1)
            : 0;

        // ── Monthly charts (DB-agnostic, grouped in PHP) ──────────────────
        $studentChart  = $this->monthlyCount(
            User::where('role', 'student')->where('created_at', '>=', $startDate)->get(),
            $months
        );
        $companyChart  = $this->monthlyCount(
            User::where('role', 'company')->where('created_at', '>=', $startDate)->get(),
            $months
        );
        $internshipChart = $this->monthlyCount(
            InternshipListing::where('created_at', '>=', $startDate)->get(),
            $months
        );
        $applicationChart = $this->monthlyCount(
            Application::where('created_at', '>=', $startDate)->get(),
            $months
        );

        // ── Application status breakdown ───────────────────────────────────
        $statusBreakdown = Application::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // ── Internship type breakdown ──────────────────────────────────────
        $typeBreakdown = InternshipListing::select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => ['label' => ucfirst($r->type ?? 'Unknown'), 'value' => (int) $r->count]);

        // ── Top companies by listing count ─────────────────────────────────
        $topCompanies = InternshipListing::select('company_id', DB::raw('COUNT(*) as listings'))
            ->with('company.companyProfile:user_id,company_name')
            ->groupBy('company_id')
            ->orderByDesc('listings')
            ->limit(6)
            ->get()
            ->map(fn($r) => [
                'label' => $r->company?->companyProfile?->company_name ?? $r->company?->name ?? 'Unknown',
                'value' => (int) $r->listings,
            ]);

        // ── Top internship locations ───────────────────────────────────────
        $topLocations = InternshipListing::select('location', DB::raw('COUNT(*) as count'))
            ->whereNotNull('location')
            ->groupBy('location')
            ->orderByDesc('count')
            ->limit(6)
            ->get()
            ->map(fn($r) => ['label' => $r->location, 'value' => (int) $r->count]);

        return response()->json([
            'summary' => [
                ['label' => 'Students Registered',    'value' => $totalStudents,     'color' => 'violet'],
                ['label' => 'Companies Registered',   'value' => $totalCompanies,    'color' => 'sky'],
                ['label' => 'Internships Posted',     'value' => $totalInternships,  'color' => 'emerald'],
                ['label' => 'Applications Submitted', 'value' => $totalApplications, 'color' => 'amber'],
                ['label' => 'Acceptance Rate',        'value' => $acceptanceRate . '%', 'color' => 'rose'],
                ['label' => 'Avg Apps / Listing',     'value' => $avgAppsPerListing, 'color' => 'cyan'],
            ],
            'charts' => [
                'students'     => $studentChart,
                'companies'    => $companyChart,
                'internships'  => $internshipChart,
                'applications' => $applicationChart,
            ],
            'status_breakdown' => [
                ['label' => 'Pending',  'value' => (int)($statusBreakdown['pending']  ?? 0), 'color' => '#f59e0b'],
                ['label' => 'Reviewed', 'value' => (int)($statusBreakdown['reviewed'] ?? 0), 'color' => '#6366f1'],
                ['label' => 'Accepted', 'value' => (int)($statusBreakdown['accepted'] ?? 0), 'color' => '#10b981'],
                ['label' => 'Rejected', 'value' => (int)($statusBreakdown['rejected'] ?? 0), 'color' => '#ef4444'],
            ],
            'type_breakdown'  => $typeBreakdown,
            'top_companies'   => $topCompanies,
            'top_locations'   => $topLocations,
        ]);
    }

    /**
     * Build a month-labelled count series from a collection.
     * Always returns exactly $months entries (filling 0 for empty months).
     */
    private function monthlyCount($records, int $months): array
    {
        // Build a map of "Y-m" => count from the records
        $byMonth = $records->groupBy(fn($r) => $r->created_at->format('Y-m'))
            ->map(fn($group) => $group->count());

        // Generate the full range
        $result = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $date  = Carbon::now()->subMonths($i)->startOfMonth();
            $key   = $date->format('Y-m');
            $label = $date->format($months <= 3 ? 'M d' : 'M');
            $result[] = ['label' => $label, 'value' => $byMonth[$key] ?? 0];
        }
        return $result;
    }
}
