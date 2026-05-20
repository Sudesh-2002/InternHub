<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    protected $table = 'admin_notifications';

    protected $fillable = [
        'type',
        'title',
        'message',
        'link',
        'meta',
        'is_read',
    ];

    protected $casts = [
        'meta'    => 'array',
        'is_read' => 'boolean',
    ];

    /**
     * Fire (create) a new admin notification.
     */
    public static function fire(
        string $type,
        string $title,
        string $message,
        ?string $link = null,
        array $meta = []
    ): self {
        return self::create([
            'type'    => $type,
            'title'   => $title,
            'message' => $message,
            'link'    => $link,
            'meta'    => $meta,
            'is_read' => false,
        ]);
    }
}
