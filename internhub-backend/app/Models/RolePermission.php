<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    protected $fillable = ['role', 'permission_key', 'is_enabled'];

    protected $casts = ['is_enabled' => 'boolean'];

    /** Per-request in-memory cache so we never hit the DB twice for the same key. */
    private static array $cache = [];

    /**
     * Check if a permission is enabled for a role.
     * Defaults to TRUE if no DB record exists (permissive default).
     */
    public static function isEnabled(string $role, string $key): bool
    {
        $cacheKey = "{$role}.{$key}";

        if (!array_key_exists($cacheKey, self::$cache)) {
            $record = static::where('role', $role)
                ->where('permission_key', $key)
                ->first();

            self::$cache[$cacheKey] = $record ? $record->is_enabled : true;
        }

        return self::$cache[$cacheKey];
    }

    /** Call this after saving changes so the cache is invalidated. */
    public static function clearCache(): void
    {
        self::$cache = [];
    }

    public function permission()
    {
        return $this->belongsTo(Permission::class, 'permission_key', 'key');
    }
}

