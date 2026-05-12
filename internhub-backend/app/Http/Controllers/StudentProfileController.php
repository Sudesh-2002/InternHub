<?php

namespace App\Http\Controllers;

use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class StudentProfileController extends Controller
{
    /**
     * GET /api/profile
     * Returns the authenticated user's profile merged with user table data.
     */
    public function show()
    {
        $user    = Auth::user();
        $profile = StudentProfile::firstOrCreate(
            ['user_id' => $user->id],
            ['skills' => [], 'education' => [], 'experience' => [], 'projects' => []]
        );

        return response()->json([
            'name'        => $user->name,
            'email'       => $user->email,
            'phone'       => $profile->phone,
            'location'    => $profile->location,
            'summary'     => $profile->summary,
            'skills'      => $profile->skills      ?? [],
            'education'   => $profile->education   ?? [],
            'experience'  => $profile->experience  ?? [],
            'projects'    => $profile->projects    ?? [],
            'github'      => $profile->github,
            'linkedin'    => $profile->linkedin,
            'portfolio'   => $profile->portfolio,
            'resume_name' => $profile->resume_name,
            'resume_url'  => $profile->resume_url,   // model accessor: asset('storage/...')
            'avatar_url'  => $profile->avatar_url,   // model accessor: asset('storage/...')
        ]);
    }

    /**
     * PUT /api/profile
     * Updates basic info, summary, social links, and JSON arrays.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name'              => 'sometimes|string|max:255',
            'phone'             => 'sometimes|nullable|string|max:30',
            'location'          => 'sometimes|nullable|string|max:255',
            'summary'           => 'sometimes|nullable|string|max:2000',
            'skills'            => 'sometimes|array',
            'skills.*'          => 'string|max:100',
            'education'         => 'sometimes|array',
            'education.*.degree'      => 'required_with:education|string|max:255',
            'education.*.university'  => 'required_with:education|string|max:255',
            'education.*.start'       => 'required_with:education|string|max:10',
            'education.*.end'         => 'required_with:education|string|max:10',
            'education.*.gpa'         => 'nullable|string|max:10',
            'experience'        => 'sometimes|array',
            'experience.*.title'       => 'required_with:experience|string|max:255',
            'experience.*.company'     => 'required_with:experience|string|max:255',
            'experience.*.duration'    => 'required_with:experience|string|max:100',
            'experience.*.description' => 'nullable|string|max:1000',
            'projects'          => 'sometimes|array',
            'projects.*.title'       => 'required_with:projects|string|max:255',
            'projects.*.description' => 'nullable|string|max:1000',
            'projects.*.tech'        => 'nullable|string|max:255',
            'projects.*.github'      => 'nullable|url|max:255',
            'github'            => 'sometimes|nullable|url|max:255',
            'linkedin'          => 'sometimes|nullable|url|max:255',
            'portfolio'         => 'sometimes|nullable|url|max:255',
        ]);

        // Update name on the users table if provided
        if (isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
        }

        // Strip name out before saving to profile
        $profileData = collect($validated)->except('name')->toArray();

        // Re-index arrays to strip frontend IDs, assign fresh numeric IDs
        foreach (['education', 'experience', 'projects'] as $key) {
            if (isset($profileData[$key])) {
                $profileData[$key] = array_values(
                    array_map(function ($item, $index) {
                        return array_merge(['id' => $index + 1], $item);
                    }, $profileData[$key], array_keys($profileData[$key]))
                );
            }
        }

        $profile = StudentProfile::updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        return response()->json([
            'message' => 'Profile updated successfully.',
            'profile' => $profile,
        ]);
    }

    /**
     * POST /api/profile/resume
     * Uploads or replaces the student's resume PDF.
     */
    public function uploadResume(Request $request)
    {
        $request->validate([
            'resume' => 'required|file|mimes:pdf|max:5120', // 5 MB max
        ]);

        $user    = Auth::user();
        $profile = StudentProfile::firstOrCreate(['user_id' => $user->id]);

        // Delete old resume if it exists
        if ($profile->resume_path && Storage::disk('public')->exists($profile->resume_path)) {
            Storage::disk('public')->delete($profile->resume_path);
        }

        $file = $request->file('resume');
        $path = $file->store("resumes/{$user->id}", 'public');

        $profile->update([
            'resume_path' => $path,
            'resume_name' => $file->getClientOriginalName(),
        ]);

        return response()->json([
            'message'     => 'Resume uploaded successfully.',
            'resume_name' => $profile->resume_name,
            'resume_url'  => Storage::url($path),
        ]);
    }

    /**
     * DELETE /api/profile/resume
     * Removes the uploaded resume.
     */
    public function deleteResume()
    {
        $user    = Auth::user();
        $profile = StudentProfile::where('user_id', $user->id)->first();

        if ($profile && $profile->resume_path) {
            if (Storage::disk('public')->exists($profile->resume_path)) {
                Storage::disk('public')->delete($profile->resume_path);
            }
            $profile->update(['resume_path' => null, 'resume_name' => null]);
        }

        return response()->json(['message' => 'Resume deleted successfully.']);
    }

    /**
     * POST /api/profile/avatar
     * Upload or replace the student's profile avatar image.
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048', // 2 MB max
        ]);

        $user    = Auth::user();
        $profile = StudentProfile::firstOrCreate(['user_id' => $user->id]);

        // Delete old avatar if it exists
        if ($profile->avatar_path && Storage::disk('public')->exists($profile->avatar_path)) {
            Storage::disk('public')->delete($profile->avatar_path);
        }

        $path = $request->file('avatar')->store("avatars/{$user->id}", 'public');
        $profile->update(['avatar_path' => $path]);

        return response()->json([
            'message'    => 'Avatar uploaded successfully.',
            'avatar_url' => asset('storage/' . $path),
        ]);
    }

    /**
     * DELETE /api/profile/avatar
     * Remove the student's profile avatar.
     */
    public function deleteAvatar()
    {
        $user    = Auth::user();
        $profile = StudentProfile::where('user_id', $user->id)->first();

        if ($profile && $profile->avatar_path) {
            if (Storage::disk('public')->exists($profile->avatar_path)) {
                Storage::disk('public')->delete($profile->avatar_path);
            }
            $profile->update(['avatar_path' => null]);
        }

        return response()->json(['message' => 'Avatar deleted successfully.']);
    }
}