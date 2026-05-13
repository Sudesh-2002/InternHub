<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AdminAnnouncementController extends Controller
{
    private const TYPES     = ['general', 'maintenance', 'internship_alert', 'platform_update'];
    private const AUDIENCES = ['all', 'students', 'companies', 'user'];

    // GET /api/admin/announcements
    public function index(): JsonResponse
    {
        $announcements = Announcement::with('admin:id,name', 'targetUser:id,name,email,role')
            ->latest()
            ->get()
            ->map(fn ($a) => $this->format($a));

        return response()->json(['data' => $announcements]);
    }

    // POST /api/admin/announcements
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'          => 'required|string|max:255',
            'body'           => 'required|string',
            'type'           => ['required', Rule::in(self::TYPES)],
            'audience'       => ['required', Rule::in(self::AUDIENCES)],
            'target_user_id' => 'required_if:audience,user|nullable|exists:users,id',
        ]);

        $announcement = Announcement::create([
            'admin_id'       => Auth::id(),
            'title'          => $data['title'],
            'body'           => $data['body'],
            'type'           => $data['type'],
            'audience'       => $data['audience'],
            'target_user_id' => $data['audience'] === 'user' ? ($data['target_user_id'] ?? null) : null,
        ]);

        // Fan out to notifications table
        Announcement::dispatchNotifications($announcement);

        $announcement->load('admin:id,name', 'targetUser:id,name,email,role');

        return response()->json([
            'message' => 'Announcement created and notifications dispatched.',
            'data'    => $this->format($announcement),
        ], 201);
    }

    // PUT /api/admin/announcements/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'body'  => 'required|string',
            'type'  => ['required', Rule::in(self::TYPES)],
        ]);

        $announcement->update($data);
        $announcement->load('admin:id,name', 'targetUser:id,name,email,role');

        return response()->json([
            'message' => 'Announcement updated.',
            'data'    => $this->format($announcement),
        ]);
    }

    // DELETE /api/admin/announcements/{id}
    public function destroy(int $id): JsonResponse
    {
        Announcement::findOrFail($id)->delete();
        return response()->json(['message' => 'Announcement deleted.']);
    }

    // GET /api/admin/users/search?q=&role=
    public function userSearch(Request $request): JsonResponse
    {
        $q    = $request->query('q', '');
        $role = $request->query('role', '');

        $query = User::whereIn('role', ['student', 'company'])
            ->where(function ($q2) use ($q) {
                $q2->where('name', 'like', "%{$q}%")
                   ->orWhere('email', 'like', "%{$q}%");
            });

        if (in_array($role, ['student', 'company'])) {
            $query->where('role', $role);
        }

        $users = $query->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json(['data' => $users]);
    }

    private function format(Announcement $a): array
    {
        return [
            'id'          => $a->id,
            'title'       => $a->title,
            'body'        => $a->body,
            'type'        => $a->type,
            'audience'    => $a->audience,
            'target_user' => $a->targetUser ? [
                'id'    => $a->targetUser->id,
                'name'  => $a->targetUser->name,
                'email' => $a->targetUser->email,
                'role'  => $a->targetUser->role,
            ] : null,
            'admin_name'  => optional($a->admin)->name,
            'created_at'  => $a->created_at?->diffForHumans(),
            'created_raw' => $a->created_at?->toDateTimeString(),
        ];
    }
}
