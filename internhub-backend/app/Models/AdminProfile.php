<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AdminProfile extends Model
{
    protected $fillable = [
        'user_id',
        'admin_id',
        'avatar_path',
        'phone',
        'department',
        'position',
        'bio',
        'location',
        'timezone',
    ];

    /* ── Boot: auto-generate admin_id on create ─── */

    protected static function booted(): void
    {
        static::creating(function (AdminProfile $profile) {
            if (empty($profile->admin_id)) {
                // ADM-000001 format, padded to 6 digits
                $next = (static::max('id') ?? 0) + 1;
                $profile->admin_id = 'ADM-' . str_pad($next, 6, '0', STR_PAD_LEFT);
            }
        });
    }

    /* ── Relationships ───────────────────────────── */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /* ── Accessors ───────────────────────────────── */

    /**
     * Full public URL for the admin avatar.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar_path
            ? asset('storage/' . $this->avatar_path)
            : null;
    }
}