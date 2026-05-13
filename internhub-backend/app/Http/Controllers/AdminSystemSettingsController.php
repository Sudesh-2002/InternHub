<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSystemSettingsController extends Controller
{
    // GET /api/admin/settings
    public function index(): JsonResponse
    {
        $settings = SystemSetting::orderBy('group')->orderBy('id')->get();

        $grouped = $settings->groupBy('group')->map(fn($items, $group) => [
            'group' => $group,
            'items' => $items->map(fn($s) => [
                'key'         => $s->key,
                'value'       => $s->cast_value,
                'type'        => $s->type,
                'label'       => $s->label,
                'description' => $s->description,
            ])->values(),
        ])->values();

        return response()->json(['data' => $grouped]);
    }

    // PATCH /api/admin/settings
    public function update(Request $request): JsonResponse
    {
        $changes = $request->validate([
            'settings'       => 'required|array|min:1',
            'settings.*.key' => 'required|exists:system_settings,key',
            'settings.*.value' => 'present',
        ]);

        foreach ($changes['settings'] as $change) {
            $setting = SystemSetting::where('key', $change['key'])->first();
            if (!$setting) continue;

            // Sanitise value by type
            $value = match ($setting->type) {
                'boolean' => $change['value'] ? '1' : '0',
                'integer' => (string)(int) $change['value'],
                default   => (string) $change['value'],
            };

            $setting->update(['value' => $value]);
        }

        SystemSetting::clearCache();

        return response()->json(['message' => 'Settings saved successfully.']);
    }

    // POST /api/admin/settings/reset
    public function reset(): JsonResponse
    {
        // Re-run the seeder to restore defaults
        (new \Database\Seeders\SystemSettingsSeeder())->run();
        SystemSetting::clearCache();

        return response()->json(['message' => 'Settings reset to defaults.']);
    }
}
