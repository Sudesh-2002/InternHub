<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminCompanyController extends Controller
{
    //  GET /admin/companies
    // Returns paginated list of all companies with stats
    public function index(Request $request): JsonResponse
    {
        $query = CompanyProfile::with(['user', 'verification'])
            ->withCount('verifications');

        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($u) => $u->where('email', 'like', "%{$search}%"));
            });
        }

        // Filter by verification status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('verification_status', $request->status);
        }

        $companies = $query->latest()->paginate(15);

        // Shape each record for the frontend
        $companies->getCollection()->transform(function ($c) {
            return $this->formatCompany($c);
        });

        // Summary counts
        $stats = [
            'total'     => CompanyProfile::count(),
            'verified'  => CompanyProfile::where('verification_status', 'verified')->count(),
            'pending'   => CompanyProfile::where('verification_status', 'pending')->count(),
            'rejected'  => CompanyProfile::where('verification_status', 'rejected')->count(),
            'suspended' => CompanyProfile::where('verification_status', 'suspended')->count(),
        ];

        return response()->json([
            'companies' => $companies,
            'stats'     => $stats,
        ]);
    }

    //  GET /admin/companies/{id}
    public function show(int $id): JsonResponse
    {
        $company = CompanyProfile::with(['user', 'verification', 'verifications.reviewer'])
            ->findOrFail($id);

        return response()->json($this->formatCompany($company, detailed: true));
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:verified,suspended,rejected,pending'],
            'note'   => ['nullable', 'string', 'max:1000'],
        ]);

        $company = CompanyProfile::findOrFail($id);
        $company->update(['verification_status' => $request->status]);

        // Log the status change as a verification record
        $company->verifications()->create([
            'reviewed_by'  => auth()->id(),
            'status'       => $request->status,
            'admin_note'   => $request->note,
            'submitted_at' => $company->created_at,
            'reviewed_at'  => now(),
        ]);

        return response()->json([
            'message' => "Company status updated to {$request->status}.",
            'company' => $this->formatCompany($company->fresh(['user', 'verification'])),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $company = CompanyProfile::findOrFail($id);

        // Delete stored files
        foreach (['logo_path', 'business_cert_path', 'tax_docs_path', 'verification_doc_path', 'hr_auth_path'] as $field) {
            if ($company->$field && Storage::disk('public')->exists($company->$field)) {
                Storage::disk('public')->delete($company->$field);
            }
        }

        // Delete the user account (cascades to profile)
        $company->user?->delete();

        return response()->json(['message' => 'Company deleted successfully.']);
    }

    private function formatCompany(CompanyProfile $c, bool $detailed = false): array
    {
        $base = [
            'id'           => $c->id,
            'user_id'      => $c->user_id,
            'name'         => $c->company_name  ?? $c->user?->name,
            'email'        => $c->official_email ?? $c->user?->email,
            'industry'     => $c->industry,
            'website'      => $c->website,
            'reg_number'   => $c->registration_no,
            'company_size' => $c->company_size,
            'headquarters' => $c->headquarters,
            'status'       => $c->verification_status ?? 'pending',
            'logo_url'     => $c->logo_url,
            'registered'   => $c->created_at?->toDateString(),
            'listings_count' => $c->user?->jobs()->count() ?? 0,
            'docs' => [
                'business_cert' => [
                    'uploaded' => (bool) $c->business_cert_path,
                    'url'      => $c->business_cert_url,
                ],
                'tax_docs' => [
                    'uploaded' => (bool) $c->tax_docs_path,
                    'url'      => $c->tax_docs_url,
                ],
                'hr_auth' => [
                    'uploaded' => (bool) $c->hr_auth_path,
                    'url'      => $c->hr_auth_url,
                ],
                'verification_doc' => [
                    'uploaded' => (bool) $c->verification_doc_path,
                    'url'      => $c->verification_doc_url,
                ],
            ],
        ];

        if ($detailed) {
            $base['about']       = $c->about;
            $base['phone']       = $c->phone;
            $base['address']     = $c->address;
            $base['linkedin']    = $c->linkedin_url;
            $base['verifications'] = $c->verifications?->map(fn($v) => [
                'status'      => $v->status,
                'admin_note'  => $v->admin_note,
                'reviewed_by' => $v->reviewer?->name,
                'reviewed_at' => $v->reviewed_at?->toDateTimeString(),
            ])->toArray();
        }

        return $base;
    }
}