<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SystemSetting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'group', 'label', 'description'];

    /**
     * Get a setting value by key (with cache).
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = Cache::rememberForever("setting:{$key}", fn () =>
            static::where('key', $key)->first()
        );

        if (!$setting) return $default;

        return match ($setting->type) {
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $setting->value,
            default   => $setting->value,
        };
    }

    /**
     * Set a setting value and bust cache.
     */
    public static function set(string $key, mixed $value): void
    {
        static::where('key', $key)->update(['value' => $value]);
        Cache::forget("setting:{$key}");
    }

    /**
     * Clear all settings from cache.
     */
    public static function clearCache(): void
    {
        static::all()->each(fn ($s) => Cache::forget("setting:{$s->key}"));
    }

    /**
     * Typed accessor for the value.
     */
    public function getCastValueAttribute(): mixed
    {
        return match ($this->type) {
            'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $this->value,
            default   => $this->value,
        };
    }
}
