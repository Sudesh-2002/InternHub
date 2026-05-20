<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\LoginLog;
use App\Models\StudentProfile;
use App\Models\CompanyProfile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

use App\Models\SystemSetting;

class AuthController extends Controller
{
    // ✅ REGISTER
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role'     => 'required|in:student,company',
        ]);

        // ── System settings gates ──────────────────────────────────────────
        if ($request->role === 'student' && !SystemSetting::get('student_registration_open', true)) {
            return response()->json(['message' => 'Student registration is currently closed. Please check back later.'], 403);
        }
        if ($request->role === 'company' && !SystemSetting::get('company_registration_open', true)) {
            return response()->json(['message' => 'Company registration is currently closed. Please check back later.'], 403);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        // Auto-create profile based on role
        if ($user->role === 'student') {
            StudentProfile::create(['user_id' => $user->id]);
        } elseif ($user->role === 'company') {
            CompanyProfile::create([
                'user_id'      => $user->id,
                'company_name' => $request->name,
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'token'   => $token,
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ], 201);
    }

    // LOGIN
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        // Revoke old tokens (single session)
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        // Record login event
        LoginLog::record($user->id, 'login', $request);

        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        // Record logout event before revoking token
        LoginLog::record($request->user()->id, 'logout', $request);

        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    // SESSION TIMEOUT LOGOUT (records a 'timeout' event)
    public function timeout(Request $request)
    {
        // Record timeout event before revoking token
        LoginLog::record($request->user()->id, 'timeout', $request);

        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Session timed out',
        ]);
    }

    // GET LOGGED IN USER
    public function me(Request $request)
    {
        $user = $request->user();

        // Load the correct profile relation based on role
        $relation = match ($user->role) {
            'student' => 'studentProfile',
            'company' => 'companyProfile',
            'admin'   => 'adminProfile',
            default   => null,
        };

        if ($relation) {
            $user->load($relation);
        }

        return response()->json(['user' => $user]);
    }
}