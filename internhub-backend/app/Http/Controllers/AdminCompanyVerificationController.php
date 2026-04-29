<?php


namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\CompanyVerification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminCompanyVerificationController extends Controller
{
    // ── GET /api/admin/verifications ─────────────────────────────────────
    // Returns all company profiles with their latest verification record
    public function index(Request $request): JsonResponse
    {
        $query = CompanyProfile::with([
            'user:id,name,email',
            'verification',
        ]);

        // Filter by status: ?status=pending
        if ($request->filled('status')) {
            $query->where('verification_status', $request->status);
        }

        // Search by name or email
        if ($request->filled('search')) {
            $query->where('company_name', 'like', '%' . $request->search . '%');
        }

        $companies = $query->latest()->get()->map(fn($c) => $this->format($c));

        return response()->json($companies);
    }

    // ── GET /api/admin/verifications/{id} ────────────────────────────────
    // Returns a single company profile with full verification history
    public function show(int $id): JsonResponse
    {
        $company = CompanyProfile::with([
            'user:id,name,email',
            'verifications.reviewer:id,name',
        ])->findOrFail($id);

        return response()->json($this->format($company, full: true));
    }

    // ── POST /api/admin/verifications/{id}/review ────────────────────────
    // Admin approves, rejects, or requests resubmission
    public function review(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'action'     => ['required', 'in:approve,reject,resubmit'],
            'admin_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $statusMap = [
            'approve'  => 'verified',
            'reject'   => 'rejected',
            'resubmit' => 'resubmit',
        ];

        $newStatus = $statusMap[$request->action];

        DB::transaction(function () use ($id, $newStatus, $request) {
            // 1. Update the denormalized status on company_profiles
            CompanyProfile::where('id', $id)->update([
                'verification_status' => $newStatus,
            ]);

            // 2. Create a new verification record (full audit trail)
            CompanyVerification::create([
                'company_profile_id' => $id,
                'reviewed_by'        => Auth::id(),
                'status'             => $newStatus,
                'admin_note'         => $request->admin_note,
                'submitted_at'       => now(),
                'reviewed_at'        => now(),
            ]);
        });

        $company = CompanyProfile::with(['user:id,name,email', 'verification'])
            ->findOrFail($id);

        return response()->json([
            'message' => match($request->action) {
                'approve'  => 'Company verified successfully.',
                'reject'   => 'Company rejected.',
                'resubmit' => 'Resubmission requested.',
            },
            'company' => $this->format($company),
        ]);
    }

    // ── Private: format company for frontend ──────────────────────────────
    private function format(CompanyProfile $c, bool $full = false): array
    {
        $base = [
            'id'          => $c->id,
            'name'        => $c->company_name,
            'email'       => $c->hr_email ?? $c->official_email ?? $c->user?->email,
            'industry'    => $c->industry,
            'website'     => $c->website,
            'regNumber'   => $c->registration_no,
            'submitted'   => $c->verification?->submitted_at?->format('Y-m-d')
                             ?? $c->created_at->format('Y-m-d'),
            'status'      => $c->verification_status,
            'admin_note'  => $c->verification?->admin_note,
            'docs'        => [
                ['name' => 'Business Registration Certificate', 'uploaded' => (bool) $c->business_cert_path,    'url' => $c->business_cert_url],
                ['name' => 'Tax Documents',                     'uploaded' => (bool) $c->tax_docs_path,         'url' => $c->tax_docs_url],
                ['name' => 'HR Authorization Letter',           'uploaded' => (bool) $c->hr_auth_path,          'url' => $c->hr_auth_url],
                ['name' => 'Additional Documents',              'uploaded' => (bool) $c->verification_doc_path, 'url' => $c->verification_doc_url],
            ],
        ];

        if ($full) {
            $base['history'] = $c->verifications->map(fn($v) => [
                'status'      => $v->status,
                'admin_note'  => $v->admin_note,
                'reviewed_by' => $v->reviewer?->name,
                'reviewed_at' => $v->reviewed_at?->format('Y-m-d H:i'),
            ]);
        }

        return $base;
    }
}