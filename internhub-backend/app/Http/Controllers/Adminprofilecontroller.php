<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AdminProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class AdminProfileController extends Controller
{
    /* ────────────────────────────────────────────────────
     |  GET  /api/admin/profile
     |  Return the authenticated admin's profile.
     |  Creates the admin_profiles row on first access.
     * ─────────────────────────────────────────────────── */
    public function show(): JsonResponse
    {
        /** @var User $admin */
        $admin   = Auth::user();
        $profile = $this->getOrCreate($admin);

        return response()->json([
            'success' => true,
            'data'    => $this->format($admin, $profile),
        ]);
    }

    /* ────────────────────────────────────────────────────
     |  PATCH  /api/admin/profile
     |  Update editable profile fields.
     * ─────────────────────────────────────────────────── */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone'      => 'nullable|string|max:30',
            'department' => 'nullable|string|max:100',
            'position'   => 'nullable|string|max:100',
            'bio'        => 'nullable|string|max:1000',
            'location'   => 'nullable|string|max:150',
            'timezone'   => 'nullable|string|max:60',
        ]);

        /** @var User $admin */
        $admin   = Auth::user();
        $profile = $this->getOrCreate($admin);
        $profile->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data'    => $this->format($admin, $profile->fresh()),
        ]);
    }

    /* ────────────────────────────────────────────────────
     |  POST  /api/admin/profile/password
     |  Change the admin's login password.
     * ─────────────────────────────────────────────────── */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers(),
            ],
        ]);

        /** @var User $admin */
        $admin = Auth::user();

        if (!Hash::check($request->current_password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $admin->update(['password' => $request->new_password]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }

    /* ────────────────────────────────────────────────────
     |  POST  /api/admin/profile/avatar
     |  Upload / replace the profile picture.
     * ─────────────────────────────────────────────────── */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        /** @var User $admin */
        $admin   = Auth::user();
        $profile = $this->getOrCreate($admin);

        // Delete old avatar from storage
        if ($profile->avatar_path) {
            Storage::disk('public')->delete($profile->avatar_path);
        }

        $path = $request->file('avatar')->store('admin/avatars', 'public');
        $profile->update(['avatar_path' => $path]);

        return response()->json([
            'success'    => true,
            'message'    => 'Profile picture updated.',
            'avatar_url' => asset('storage/' . $path),
        ]);
    }

    /* ── Private helpers ─────────────────────────── */

    /**
     * Get or auto-create the admin_profiles row for this user.
     */
    private function getOrCreate(User $admin): AdminProfile
    {
        return AdminProfile::firstOrCreate(['user_id' => $admin->id]);
    }

    /**
     * Build the response payload.
     */
    private function format(User $admin, AdminProfile $profile): array
    {
        return [
            // From users table (read-only on this page)
            'name'       => $admin->name,
            'email'      => $admin->email,
            'role'       => $admin->role,
            'joined'     => $admin->created_at?->format('d M Y') ?? '—',

            // From admin_profiles table
            'admin_id'   => $profile->admin_id,
            'avatar_url' => $profile->avatar_url,   // accessor
            'phone'      => $profile->phone,
            'department' => $profile->department,
            'position'   => $profile->position,
            'bio'        => $profile->bio,
            'location'   => $profile->location,
            'timezone'   => $profile->timezone,

            // Live platform stats
            'stats' => [
                'total_students'    => User::where('role', 'student')->count(),
                'total_companies'   => User::where('role', 'company')->count(),
                'total_internships' => \App\Models\InternshipListing::count(),
            ],
        ];
    }
}