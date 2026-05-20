<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\SupportMessage;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminSupportController extends Controller
{
    // GET /api/admin/support-tickets
    public function index(Request $request): JsonResponse
    {
        $query = SupportTicket::with(['user:id,name,email,role', 'latestMessage'])
            ->withCount('messages')
            ->latest();

        if ($status = $request->status) {
            if ($status !== 'all') $query->where('status', $status);
        }

        if ($priority = $request->priority) {
            if ($priority !== 'all') $query->where('priority', $priority);
        }

        if ($role = $request->role) {
            if ($role !== 'all') $query->whereHas('user', fn($q) => $q->where('role', $role));
        }

        if ($s = $request->search) {
            $query->where(function ($q) use ($s) {
                $q->where('subject', 'like', "%$s%")
                  ->orWhereHas('user', fn($q2) => $q2->where('name', 'like', "%$s%")
                      ->orWhere('email', 'like', "%$s%"));
            });
        }

        $tickets = $query->paginate(20);

        $stats = [
            'open'        => SupportTicket::where('status', 'open')->count(),
            'in_progress' => SupportTicket::where('status', 'in_progress')->count(),
            'resolved'    => SupportTicket::where('status', 'resolved')->count(),
            'total'       => SupportTicket::count(),
            'avg_rating'  => round(SupportTicket::whereNotNull('rating')->avg('rating'), 1),
        ];

        return response()->json([
            'data' => $tickets->map(fn($t) => $this->format($t)),
            'meta' => [
                'total'        => $tickets->total(),
                'current_page' => $tickets->currentPage(),
                'last_page'    => $tickets->lastPage(),
            ],
            'stats' => $stats,
        ]);
    }

    // GET /api/admin/support-tickets/{id}
    public function show(int $id): JsonResponse
    {
        $ticket = SupportTicket::with([
            'user:id,name,email,role',
            'messages.user:id,name,role',
        ])->findOrFail($id);

        return response()->json([
            'data' => [
                ...$this->format($ticket),
                'user_email' => $ticket->user?->email,
                'user_role'  => $ticket->user?->role,
                'messages'   => $ticket->messages->map(fn($m) => [
                    'id'       => $m->id,
                    'message'  => $m->message,
                    'is_admin' => $m->is_admin,
                    'sender'   => $m->is_admin ? 'Support Team' : ($m->user?->name ?? 'User'),
                    'created_at' => $m->created_at->format('d M Y, H:i'),
                ]),
            ],
        ]);
    }

    // PATCH /api/admin/support-tickets/{id}/status
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $data   = $request->validate(['status' => 'required|in:open,in_progress,resolved,closed']);
        $ticket = SupportTicket::findOrFail($id);
        $ticket->update($data);

        $statusLabels = [
            'open'        => '🔓 Ticket Re-opened',
            'in_progress' => '🔄 Ticket In Progress',
            'resolved'    => '✅ Ticket Resolved',
            'closed'      => '🔒 Ticket Closed',
        ];
        Notification::notify(
            $ticket->user_id,
            'support',
            $statusLabels[$data['status']] ?? 'Ticket Updated',
            "Your support ticket \"" . $ticket->subject . "\" has been " . $data['status'] . "."
        );

        return response()->json(['message' => 'Status updated.', 'status' => $ticket->status]);
    }

    // POST /api/admin/support-tickets/{id}/reply
    public function reply(Request $request, int $id): JsonResponse
    {
        $ticket = SupportTicket::findOrFail($id);
        $data   = $request->validate(['message' => 'required|string|max:5000']);

        $msg = SupportMessage::create([
            'ticket_id' => $ticket->id,
            'user_id'   => Auth::id(),
            'message'   => $data['message'],
            'is_admin'  => true,
        ]);

        // Auto-move to in_progress if still open
        if ($ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }

        // Notify user
        Notification::notify(
            $ticket->user_id,
            'support',
            '💬 Support Reply',
            "Admin replied to your ticket: \"" . $ticket->subject . "\""
        );

        return response()->json(['message' => 'Reply sent.', 'data' => [
            'id'       => $msg->id,
            'message'  => $msg->message,
            'is_admin' => true,
            'sender'   => 'Support Team',
            'created_at' => $msg->created_at->format('d M Y, H:i'),
        ]]);
    }

    private function format(SupportTicket $t): array
    {
        return [
            'id'             => $t->id,
            'subject'        => $t->subject,
            'category'       => $t->category,
            'status'         => $t->status,
            'priority'       => $t->priority,
            'rating'         => $t->rating,
            'ended_by_user'  => (bool) $t->ended_by_user,
            'user'           => $t->user?->name ?? '—',
            'user_role'      => $t->user?->role ?? '—',
            'messages_count' => $t->messages_count ?? 0,
            'last_message'   => $t->latestMessage?->message,
            'created_at'     => $t->created_at->format('d M Y'),
            'updated_at'     => $t->updated_at->format('d M Y, H:i'),
        ];
    }
}
