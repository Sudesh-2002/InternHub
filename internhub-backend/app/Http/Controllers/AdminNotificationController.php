<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use Illuminate\Http\JsonResponse;

class AdminNotificationController extends Controller
{
    // GET /api/admin/notifications
    public function index(): JsonResponse
    {
        $notifications = AdminNotification::latest()
            ->take(60)
            ->get()
            ->map(fn($n) => [
                'id'      => $n->id,
                'type'    => $n->type,
                'title'   => $n->title,
                'message' => $n->message,
                'link'    => $n->link,
                'meta'    => $n->meta,
                'is_read' => $n->is_read,
                'time'    => $n->created_at->diffForHumans(),
            ]);

        return response()->json([
            'data'         => $notifications,
            'unread_count' => AdminNotification::where('is_read', false)->count(),
        ]);
    }

    // PATCH /api/admin/notifications/{id}/read
    public function markRead(int $id): JsonResponse
    {
        $notif = AdminNotification::findOrFail($id);
        $notif->update(['is_read' => true]);
        return response()->json(['message' => 'Marked as read.']);
    }

    // PATCH /api/admin/notifications/read-all
    public function markAllRead(): JsonResponse
    {
        AdminNotification::where('is_read', false)->update(['is_read' => true]);
        return response()->json(['message' => 'All marked as read.']);
    }
}
