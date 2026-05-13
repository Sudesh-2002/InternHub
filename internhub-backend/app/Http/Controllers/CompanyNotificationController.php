<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\RolePermission;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CompanyNotificationController extends Controller
{
    // GET /api/company/notifications
    public function index(): JsonResponse
    {
        if (!RolePermission::isEnabled('company', 'receive_notifications')) {
            return response()->json(['data' => [], 'unread_count' => 0]);
        }

        $notifications = Notification::where('user_id', Auth::id())
            ->latest()
            ->take(50)
            ->get()
            ->map(fn($n) => [
                'id'      => $n->id,
                'type'    => $n->type,
                'title'   => $n->title,
                'message' => $n->message,
                'is_read' => $n->is_read,
                'time'    => $n->created_at->diffForHumans(),
            ]);

        return response()->json([
            'data'         => $notifications,
            'unread_count' => Notification::where('user_id', Auth::id())->where('is_read', false)->count(),
        ]);
    }

    // PATCH /api/company/notifications/{id}/read
    public function markRead(int $id): JsonResponse
    {
        $notif = Notification::where('user_id', Auth::id())->findOrFail($id);
        $notif->update(['is_read' => true]);
        return response()->json(['message' => 'Marked as read.']);
    }

    // PATCH /api/company/notifications/read-all
    public function markAllRead(): JsonResponse
    {
        Notification::where('user_id', Auth::id())->where('is_read', false)->update(['is_read' => true]);
        return response()->json(['message' => 'All marked as read.']);
    }
}
