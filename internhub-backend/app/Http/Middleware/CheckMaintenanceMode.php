<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Closure;
use Illuminate\Http\Request;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next)
    {
        // Admin always bypasses maintenance mode
        if ($request->user() && $request->user()->role === 'admin') {
            return $next($request);
        }

        if (SystemSetting::get('maintenance_mode', false)) {
            return response()->json([
                'message' => 'The platform is currently under maintenance. Please check back later.',
                'maintenance' => true,
            ], 503);
        }

        return $next($request);
    }
}
