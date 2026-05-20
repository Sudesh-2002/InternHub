<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AdminAuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::query()->orderByDesc('created_at');

        // Full-text search across actor and description fields
        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('actor_name',  'like', "%{$search}%")
                  ->orWhere('actor_email', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('entity_name', 'like', "%{$search}%");
            });
        }

        if ($action = $request->action) {
            $query->where('action', $action);
        }

        if ($entityType = $request->entity_type) {
            $query->where('entity_type', $entityType);
        }

        if ($role = $request->role) {
            $query->where('actor_role', $role);
        }

        // Date range filter
        if ($from = $request->from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->to) {
            $query->whereDate('created_at', '<=', $to);
        }

        $perPage = (int) ($request->per_page ?? 20);
        $logs    = $query->paginate($perPage);

        $today = now()->startOfDay();

        $stats = [
            'total_today'   => AuditLog::where('created_at', '>=', $today)->count(),
            'total_all'     => AuditLog::count(),
            'unique_actors' => AuditLog::where('created_at', '>=', $today)
                                        ->whereNotNull('user_id')
                                        ->distinct('user_id')
                                        ->count('user_id'),
            'top_action'    => AuditLog::where('created_at', '>=', $today)
                                        ->selectRaw('action, COUNT(*) as cnt')
                                        ->groupBy('action')
                                        ->orderByDesc('cnt')
                                        ->value('action') ?? '—',
        ];

        return response()->json(['logs' => $logs, 'stats' => $stats]);
    }
}
