<?php

// app/Http/Controllers/InternshipListingController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInternshipRequest;
use App\Models\InternshipListing;
use App\Models\RolePermission;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InternshipListingController extends Controller
{
    // ── COMPANY: Get own internships ──────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = InternshipListing::forCompany(Auth::id())
            ->withCount('applications')
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->paginate(15));
    }

    // ── STUDENT: Browse approved internships ──────────────────────────────────
    //
    // IMPORTANT: We do NOT use with('company') here because the 'company'
    // relationship returns a full User object, which React cannot render directly.
    // Instead we join the company_profiles table and return a flat string field
    // called 'company_name' so the frontend never receives a nested object.
    //
    public function browse(Request $request): JsonResponse
    {
        if (!RolePermission::isEnabled('student', 'browse_internships')) {
            return response()->json(['message' => 'Browsing internships is currently disabled for students.'], 403);
        }

        $query = InternshipListing::approved()
            ->select('internship_listings.*')
            ->leftJoin('company_profiles', 'company_profiles.user_id', '=', 'internship_listings.company_id')
            ->selectRaw(
                'COALESCE(company_profiles.company_name, company_profiles.registered_name, (
                    SELECT name FROM users WHERE users.id = internship_listings.company_id
                )) AS company_name'
            )
            ->latest('internship_listings.created_at');

        // Search by title or company name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('internship_listings.title', 'like', "%{$search}%")
                  ->orWhere('company_profiles.company_name', 'like', "%{$search}%")
                  ->orWhereExists(function ($sub) use ($search) {
                      $sub->selectRaw(1)
                          ->from('users')
                          ->whereColumn('users.id', 'internship_listings.company_id')
                          ->where('users.name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by location
        if ($request->filled('location')) {
            $query->where('internship_listings.location', $request->location);
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('internship_listings.type', $request->type);
        }

        $paginated = $query->paginate(6);

        // Transform: ensure all fields are primitives (no nested objects)
        $paginated->getCollection()->transform(function ($item) {
            return [
                'id'           => $item->id,
                'title'        => $item->title,
                'company_name' => $item->company_name ?? 'Unknown Company',
                'location'     => $item->location,
                'type'         => $item->type,
                'salary'       => $item->salary,
                'deadline'     => $item->deadline?->toDateString(),
                'requirements' => $item->requirements,
                'description'  => $item->description,
                'duration'     => $item->duration,
                'vacancies'    => $item->vacancies,
                'status'       => $item->status,
                'created_at'   => $item->created_at?->toDateString(),
            ];
        });

        return response()->json($paginated);
    }

    // ── COMPANY: Create internship ─────────────────────────────────────────────
    public function store(StoreInternshipRequest $request): JsonResponse
    {
        if (!RolePermission::isEnabled('company', 'post_internship')) {
            return response()->json(['message' => 'Posting internship listings is currently disabled for companies.'], 403);
        }

        $company = Auth::user()->companyProfile;

        if (!$company || $company->verification_status !== 'verified') {
            return response()->json([
                'message' => 'Only verified companies can post internships.',
            ], 403);
        }

        // ── SystemSetting: max active listings per company ──────────────────
        $maxListings = SystemSetting::get('max_listings_per_company', 20);
        if ($maxListings > 0) {
            $activeCount = InternshipListing::where('company_id', Auth::id())
                ->whereNotIn('status', ['expired', 'rejected'])
                ->count();
            if ($activeCount >= $maxListings) {
                return response()->json([
                    'message' => "You have reached the maximum of {$maxListings} active listings allowed per company.",
                ], 422);
            }
        }

        // ── SystemSetting: max vacancies per listing ────────────────────────
        $maxVacancies = SystemSetting::get('max_vacancies_per_listing', 50);
        if ($maxVacancies > 0 && ($request->vacancies ?? 1) > $maxVacancies) {
            return response()->json([
                'message' => "Vacancies cannot exceed {$maxVacancies} per listing.",
            ], 422);
        }

        // ── SystemSetting: auto-approve listings ────────────────────────────
        $autoApprove = SystemSetting::get('auto_approve_listings', false);

        $listing = InternshipListing::create([
            ...$request->validated(),
            'company_id' => Auth::id(),
            'status'     => $autoApprove ? 'approved' : 'pending',
        ]);

        return response()->json([
            'message' => $autoApprove
                ? 'Internship posted and published automatically.'
                : 'Internship posted successfully. Awaiting admin approval.',
            'listing' => $listing,
        ], 201);
    }

    // ── COMPANY: Show single ───────────────────────────────────────────────────
    public function show(InternshipListing $internshipListing): JsonResponse
    {
        $this->authorizeOwner($internshipListing);
        return response()->json($internshipListing->loadCount('applications'));
    }

    // ── COMPANY: Update ───────────────────────────────────────────────────────
    public function update(StoreInternshipRequest $request, InternshipListing $internshipListing): JsonResponse
    {
        $this->authorizeOwner($internshipListing);

        if (!RolePermission::isEnabled('company', 'manage_listings')) {
            return response()->json(['message' => 'Managing listings is currently disabled for companies.'], 403);
        }

        if ($internshipListing->status === 'approved') {
            return response()->json([
                'message' => 'Approved listings cannot be edited. Please contact admin.',
            ], 403);
        }

        $internshipListing->update($request->validated());

        return response()->json([
            'message' => 'Listing updated successfully.',
            'listing' => $internshipListing->fresh(),
        ]);
    }

    // ── COMPANY: Delete ───────────────────────────────────────────────────────
    public function destroy(InternshipListing $internshipListing): JsonResponse
    {
        $this->authorizeOwner($internshipListing);

        if (!RolePermission::isEnabled('company', 'manage_listings')) {
            return response()->json(['message' => 'Managing listings is currently disabled for companies.'], 403);
        }

        $internshipListing->delete();
        return response()->json(['message' => 'Listing deleted successfully.']);
    }

    // ── Private ───────────────────────────────────────────────────────────────
    private function authorizeOwner(InternshipListing $listing): void
    {
        abort_if($listing->company_id !== Auth::id(), 403, 'Unauthorized.');
    }
}