<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInternshipRequest;
use App\Models\InternshipListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InternshipListingController extends Controller
{
    // ── GET /company/internships ─────────────────────────────────────────────
    // Returns all listings for the authenticated company
    public function index(Request $request): JsonResponse
    {
        $query = InternshipListing::forCompany(Auth::id())
            ->withCount('applications')
            ->latest();

        // Optional status filter: ?status=approved
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Optional search: ?search=frontend
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $listings = $query->paginate(15);

        return response()->json($listings);
    }

    // ── POST /company/internships ────────────────────────────────────────────
    // Creates a new listing (status defaults to 'pending')
    public function store(StoreInternshipRequest $request): JsonResponse
    {
        $company = Auth::user()->companyProfile;

        if (!$company || $company->verification_status !== 'verified') {
            return response()->json([
                'message' => 'Only verified companies can post internships.'
            ], 403);
        }

        $listing = InternshipListing::create([
            ...$request->validated(),
            'company_id' => Auth::id(),
            'status'     => 'pending',
        ]);

        return response()->json([
            'message' => 'Internship posted successfully. Awaiting admin approval.',
            'listing' => $listing,
        ], 201);
    }

    // ── GET /company/internships/{id} ────────────────────────────────────────
    public function show(InternshipListing $internshipListing): JsonResponse
    {
        $this->authorizeOwner($internshipListing);

        return response()->json(
            $internshipListing->loadCount('applications')
        );
    }

    // ── PUT /company/internships/{id} ────────────────────────────────────────
    // Companies can only edit pending listings (approved listings are locked)
    public function update(StoreInternshipRequest $request, InternshipListing $internshipListing): JsonResponse
    {
        $this->authorizeOwner($internshipListing);

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

    // ── DELETE /company/internships/{id} ─────────────────────────────────────
    public function destroy(InternshipListing $internshipListing): JsonResponse
    {
        $this->authorizeOwner($internshipListing);

        $internshipListing->delete(); // soft delete

        return response()->json(['message' => 'Listing deleted successfully.']);
    }

    // ── Helper ───────────────────────────────────────────────────────────────
    private function authorizeOwner(InternshipListing $listing): void
    {
        abort_if($listing->company_id !== Auth::id(), 403, 'Unauthorized.');
    }
}