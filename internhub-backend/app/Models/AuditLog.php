<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'actor_name',
        'actor_email',
        'actor_role',
        'action',
        'entity_type',
        'entity_id',
        'entity_name',
        'description',
        'ip_address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Record an admin action in the audit log.
     */
    public static function record(
        string  $action,
        string  $description,
        ?string $entityType = null,
        ?int    $entityId   = null,
        ?string $entityName = null
    ): void {
        $user = Auth::user();

        static::create([
            'user_id'     => $user?->id,
            'actor_name'  => $user?->name  ?? 'System',
            'actor_email' => $user?->email ?? null,
            'actor_role'  => $user?->role  ?? 'system',
            'action'      => $action,
            'entity_type' => $entityType,
            'entity_id'   => $entityId,
            'entity_name' => $entityName,
            'description' => $description,
            'ip_address'  => Request::ip(),
        ]);
    }
}
