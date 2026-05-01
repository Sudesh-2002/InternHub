<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{
    public function apply(Request $request)
    {
        $useExisting = $request->boolean('use_existing_resume');

        // Validate — resume file only required if NOT using existing
        $request->validate([
            'internship_listing_id' => 'required|exists:internship_listings,id',
            'resume'                => $useExisting ? 'nullable' : 'required|file|mimes:pdf,doc,docx|max:2048',
            'cover_note'            => 'nullable|string|max:2000',
        ]);

        // Prevent duplicate application
        $exists = Application::where('student_id', Auth::id())
            ->where('internship_listing_id', $request->internship_listing_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'You have already applied for this internship.'], 400);
        }

        // Resolve resume path
        if ($useExisting) {
            // Pull the saved resume from the student's profile
            $profile = StudentProfile::where('user_id', Auth::id())->first();

            if (!$profile || !$profile->resume_path) {
                return response()->json(['message' => 'No resume found on your profile. Please upload one.'], 422);
            }

            $resumePath = $profile->resume_path;
        } else {
            // Store the newly uploaded file
            $resumePath = $request->file('resume')->store('applications/resumes', 'public');
        }

        // Create the application
        $application = Application::create([
            'student_id'            => Auth::id(),
            'internship_listing_id' => $request->internship_listing_id,
            'resume_path'           => $resumePath,
            'cover_note'            => $request->cover_note,
            'status'                => 'pending',
        ]);

        return response()->json([
            'message' => 'Application submitted successfully.',
            'data'    => $application,
        ], 201);
    }

    public function myApplication($id)
    {
        $application = Application::where('student_id', Auth::id())
            ->where('internship_listing_id', $id)
            ->first();

        return response()->json([
            'applied' => (bool) $application,
            'status'  => $application?->status,
        ]);
    }
}