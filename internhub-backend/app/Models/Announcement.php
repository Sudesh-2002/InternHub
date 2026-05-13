<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'admin_id',
        'title',
        'body',
        'type',
        'audience',
        'target_user_id',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function targetUser()
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    /**
     * Dispatch notifications to the appropriate users based on audience.
     */
    public static function dispatchNotifications(self $announcement): void
    {
        $userIds = match ($announcement->audience) {
            'students'  => User::where('role', 'student')->pluck('id'),
            'companies' => User::where('role', 'company')->pluck('id'),
            'user'      => collect([$announcement->target_user_id])->filter(),
            default     => User::whereIn('role', ['student', 'company'])->pluck('id'),
        };

        $now = now();
        $rows = $userIds->map(fn ($uid) => [
            'user_id'    => $uid,
            'type'       => $announcement->type,
            'title'      => $announcement->title,
            'message'    => $announcement->body,
            'is_read'    => false,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all();

        // Chunk inserts to avoid hitting SQLite/MySQL param limits
        foreach (array_chunk($rows, 500) as $chunk) {
            Notification::insert($chunk);
        }
    }
}
