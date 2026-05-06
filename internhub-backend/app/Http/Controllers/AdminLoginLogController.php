<?php

namespace App\Http\Controllers;

use App\Models\LoginLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminLoginLogController extends Controller
{
    /**
     * GET /api/admin/login-logs
     * Returns paginated login log entries with user details.
     * Supports: ?search=, ?role=, ?event=, ?per_page=
     */
    public function index(Request $request): JsonResponse
    {
        $query = LoginLog::with('user:id,name,email,role')
            ->latest();

        // Filter by role
        if ($request->filled('role')) {
            $query->whereHas('user', fn ($q) =>
                $q->where('role', $request->role)
            );
        }

        // Filter by event type
        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }

        // Search by name or email
        if ($request->filled('search')) {
            $s = $request->search;
            $query->whereHas('user', fn ($q) =>
                $q->where('name', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%")
            );
        }

        $perPage = (int) ($request->per_page ?? 15);
        $logs    = $query->paginate($perPage);

        // Summary stats
        $today         = now()->toDateString();
        $totalToday    = LoginLog::whereDate('created_at', $today)->where('event', 'login')->count();
        $totalLogouts  = LoginLog::whereDate('created_at', $today)->whereIn('event', ['logout', 'timeout'])->count();
        $activeSessions = max(0, $totalToday - $totalLogouts);

        return response()->json([
            'logs'            => $logs,
            'stats' => [
                'logins_today'    => $totalToday,
                'active_sessions' => $activeSessions,
                'timeouts_today'  => LoginLog::whereDate('created_at', $today)->where('event', 'timeout')->count(),
            ],
        ]);
    }
}
