<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\CompanyVerification;
use App\Models\InternshipListing;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /* ────────────────────────────────────────────────────
     |  GET  /api/admin/dashboard
     |  Single endpoint — returns everything the dashboard
     |  needs in one request.
     * ─────────────────────────────────────────────────── */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'stats'                  => $this->stats(),
                'student_chart'          => $this->registrationChart('student'),
                'company_chart'          => $this->registrationChart('company'),
                'recent_students'        => $this->recentStudents(),
                'awaiting_verification'  => $this->awaitingVerification(),
            ],
        ]);
    }

    /* ── Platform counts ─────────────────────────────── */
    private function stats(): array
    {
        return [
            'total_students'     => User::students()->count(),
            'total_companies'    => User::companies()->count(),
            'total_internships'  => InternshipListing::count(),
            'pending_approvals'  => InternshipListing::where('status', 'pending')->count(),
            'active_internships' => InternshipListing::where('status', 'active')->count(),
            'total_applications' => DB::table('applications')->count(),
        ];
    }

    /* ── Monthly registration chart (last 6 months) ──── */
    private function registrationChart(string $role): array
    {
        $months = collect(range(5, 0))->map(function (int $offset) use ($role) {
            $date  = Carbon::now()->subMonths($offset);
            $count = User::where('role', $role)
                ->whereYear('created_at',  $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();

            return [
                'label' => $date->format('M'),
                'value' => $count,
            ];
        });

        return $months->values()->all();
    }

    /* ── 4 most-recently registered students ─────────── */
    private function recentStudents(): array
    {
        return User::students()
            ->with('studentProfile:user_id,location')
            ->select('id', 'name', 'email', 'created_at')
            ->latest()
            ->take(4)
            ->get()
            ->map(fn (User $u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'university' => optional($u->studentProfile)->location ?? '—',
                'date'       => $u->created_at->format('M d'),
            ])
            ->all();
    }

    /* ── Companies pending verification ──────────────── */
    private function awaitingVerification(): array
    {
        return CompanyProfile::with('user:id,name,email')
            ->where('verification_status', 'pending')
            ->select('id', 'user_id', 'company_name', 'logo_path', 'updated_at')
            ->latest('updated_at')
            ->take(3)
            ->get()
            ->map(fn (CompanyProfile $cp) => [
                'id'           => $cp->id,
                'company_name' => $cp->company_name,
                'logo_url'     => $cp->logo_url,
                'email'        => optional($cp->user)->email,
                'submitted'    => $cp->updated_at
                    ? Carbon::parse($cp->updated_at)->diffForHumans(null, true) . ' ago'
                    : '—',
            ])
            ->all();
    }
}