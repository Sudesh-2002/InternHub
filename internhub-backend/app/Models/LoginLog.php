<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginLog extends Model
{
    protected $fillable = [
        'user_id',
        'event',
        'ip_address',
        'user_agent',
    ];

    /* ── Relationships ─────────────────────────── */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /* ── Helpers ───────────────────────────────── */

    /**
     * Create a log entry from the current HTTP request context.
     */
    public static function record(int $userId, string $event, ?\Illuminate\Http\Request $request = null): self
    {
        return self::create([
            'user_id'    => $userId,
            'event'      => $event,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}
