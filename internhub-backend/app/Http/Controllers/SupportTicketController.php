<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\SupportMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupportTicketController extends Controller
{
    // GET /api/{role}/support-tickets
    public function index(): JsonResponse
    {
        $tickets = SupportTicket::where('user_id', Auth::id())
            ->with('latestMessage')
            ->withCount('messages')
            ->latest()
            ->get()
            ->map(fn($t) => $this->format($t));

        return response()->json(['data' => $tickets]);
    }

    // POST /api/{role}/support-tickets
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject'  => 'required|string|max:200',
            'category' => 'required|in:general,technical,billing,other',
            'priority' => 'required|in:low,medium,high',
            'message'  => 'required|string|max:5000',
        ]);

        $ticket = SupportTicket::create([
            'user_id'  => Auth::id(),
            'subject'  => $data['subject'],
            'category' => $data['category'],
            'priority' => $data['priority'],
            'status'   => 'open',
        ]);

        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'user_id'   => Auth::id(),
            'message'   => $data['message'],
            'is_admin'  => false,
        ]);

        return response()->json(['message' => 'Ticket submitted successfully.', 'data' => $this->format($ticket->fresh())], 201);
    }

    // GET /api/{role}/support-tickets/{id}
    public function show(int $id): JsonResponse
    {
        $ticket = SupportTicket::where('user_id', Auth::id())
            ->with(['messages.user:id,name,role'])
            ->findOrFail($id);

        return response()->json([
            'data' => [
                ...$this->format($ticket),
                'messages' => $ticket->messages->map(fn($m) => [
                    'id'       => $m->id,
                    'message'  => $m->message,
                    'is_admin' => $m->is_admin,
                    'sender'   => $m->user?->name ?? 'Unknown',
                    'created_at' => $m->created_at->format('d M Y, H:i'),
                ]),
            ],
        ]);
    }

    // POST /api/{role}/support-tickets/{id}/reply
    public function reply(Request $request, int $id): JsonResponse
    {
        $ticket = SupportTicket::where('user_id', Auth::id())->findOrFail($id);

        if (in_array($ticket->status, ['closed'])) {
            return response()->json(['message' => 'This ticket is closed and cannot receive new messages.'], 403);
        }

        if ($ticket->ended_by_user) {
            return response()->json(['message' => 'You have already ended this conversation.'], 403);
        }

        $data = $request->validate(['message' => 'required|string|max:5000']);

        $msg = SupportMessage::create([
            'ticket_id' => $ticket->id,
            'user_id'   => Auth::id(),
            'message'   => $data['message'],
            'is_admin'  => false,
        ]);

        // Re-open if was resolved
        if ($ticket->status === 'resolved') {
            $ticket->update(['status' => 'open']);
        }

        return response()->json(['message' => 'Reply sent.', 'data' => [
            'id'       => $msg->id,
            'message'  => $msg->message,
            'is_admin' => false,
            'sender'   => Auth::user()->name,
            'created_at' => $msg->created_at->format('d M Y, H:i'),
        ]]);
    }

    // POST /api/{role}/support-tickets/{id}/end
    public function end(int $id): JsonResponse
    {
        $ticket = SupportTicket::where('user_id', Auth::id())->findOrFail($id);

        if ($ticket->ended_by_user) {
            return response()->json(['message' => 'Conversation already ended.'], 422);
        }

        if ($ticket->status === 'closed') {
            return response()->json(['message' => 'This ticket has been closed by admin.'], 403);
        }

        $ticket->update([
            'ended_by_user' => true,
            'status'        => 'resolved',
        ]);

        return response()->json(['message' => 'Conversation ended.', 'data' => $this->format($ticket->fresh())]);
    }

    // POST /api/{role}/support-tickets/{id}/rate
    public function rate(Request $request, int $id): JsonResponse
    {
        $ticket = SupportTicket::where('user_id', Auth::id())->findOrFail($id);

        if (!$ticket->ended_by_user) {
            return response()->json(['message' => 'You can only rate after ending the conversation.'], 422);
        }

        if ($ticket->rating !== null) {
            return response()->json(['message' => 'You have already rated this conversation.'], 422);
        }

        $data = $request->validate(['rating' => 'required|integer|min:1|max:5']);
        $ticket->update(['rating' => $data['rating']]);

        return response()->json(['message' => 'Thank you for your feedback!', 'rating' => $ticket->rating]);
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
            'messages_count' => $t->messages_count ?? 0,
            'last_message'   => $t->latestMessage?->message,
            'created_at'     => $t->created_at->format('d M Y'),
            'updated_at'     => $t->updated_at->format('d M Y, H:i'),
        ];
    }
}
