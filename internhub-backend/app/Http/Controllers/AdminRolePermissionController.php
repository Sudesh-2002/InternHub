<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\RolePermission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminRolePermissionController extends Controller
{
    private const ROLES = ['student', 'company'];

    // GET /api/admin/role-permissions
    public function index(): JsonResponse
    {
        $permissions = Permission::orderBy('category')->orderBy('label')->get();

        // Build a lookup: ['student' => ['browse_internships' => true, ...], 'company' => [...]]
        $stored = RolePermission::whereIn('role', self::ROLES)->get()
            ->groupBy('role')
            ->map(fn ($items) => $items->keyBy('permission_key')->map(fn ($rp) => $rp->is_enabled));

        $result = [];
        foreach ($permissions as $perm) {
            $row = [
                'key'         => $perm->key,
                'label'       => $perm->label,
                'description' => $perm->description,
                'category'    => $perm->category,
                'roles'       => [],
            ];

            foreach (self::ROLES as $role) {
                // Default to true if no DB record yet
                $row['roles'][$role] = $stored[$role][$perm->key] ?? true;
            }

            // Admin always has full access
            $row['roles']['admin'] = true;

            $result[] = $row;
        }

        // Group by category for the frontend
        $grouped = collect($result)->groupBy('category')->map(fn ($items, $cat) => [
            'category' => $cat,
            'items'    => $items->values(),
        ])->values();

        // Summary counts
        $summary = [];
        foreach (self::ROLES as $role) {
            $summary[$role] = RolePermission::where('role', $role)->where('is_enabled', true)->count();
        }
        $summary['admin'] = Permission::count(); // always all

        return response()->json([
            'data'    => $grouped,
            'summary' => $summary,
            'total'   => Permission::count(),
        ]);
    }

    // PATCH /api/admin/role-permissions
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'changes'                   => 'required|array|min:1',
            'changes.*.role'            => 'required|in:student,company',
            'changes.*.permission_key'  => 'required|exists:permissions,key',
            'changes.*.is_enabled'      => 'required|boolean',
        ]);

        foreach ($data['changes'] as $change) {
            RolePermission::updateOrCreate(
                ['role' => $change['role'], 'permission_key' => $change['permission_key']],
                ['is_enabled' => $change['is_enabled']]
            );
        }

        RolePermission::clearCache();

        return response()->json(['message' => 'Permissions updated successfully.']);
    }

    // POST /api/admin/role-permissions/reset
    public function reset(): JsonResponse
    {
        // Delete all and let the seeder defaults be re-applied by re-running seeder,
        // or we can hard-code defaults here for a quick reset.
        RolePermission::whereIn('role', self::ROLES)->delete();

        $now = now();
        $defaults = [
            ['role' => 'student', 'permission_key' => 'browse_internships',   'is_enabled' => true,  'created_at' => $now, 'updated_at' => $now],
            ['role' => 'student', 'permission_key' => 'apply_to_internship',  'is_enabled' => true,  'created_at' => $now, 'updated_at' => $now],
            ['role' => 'student', 'permission_key' => 'post_internship',       'is_enabled' => false, 'created_at' => $now, 'updated_at' => $now],
            ['role' => 'student', 'permission_key' => 'manage_listings',       'is_enabled' => false, 'created_at' => $now, 'updated_at' => $now],
            ['role' => 'student', 'permission_key' => 'view_company_profiles', 'is_enabled' => true,  'created_at' => $now, 'updated_at' => $now],
            ['role' => 'student', 'permission_key' => 'view_student_profiles', 'is_enabled' => false, 'created_at' => $now, 'updated_at' => $now],
            ['role' => 'student', 'permission_key' => 'download_resume',       'is_enabled' => false, 'created_at' => $now, 'updated_at' => $now],
            ['role' => 'student', 'permission_key' => 'view_own_applications', 'is_enabled' => true,  'created_at' => $now, 'updated_at' => $now],
            ['role' => 'student', 'permission_key' => 'manage_applications',   'is_enabled' => false, 'created_at' => $now, 'updated_at' => $now],
            ['role' => 'student', 'permission_key' => 'receive_notifications', 'is_enabled' => true,  'created_at' => $now, 'updated_at' => $now],
            ['role' => 'company', 'permission_key' => 'browse_internships',   'is_enabled' => true,  'created_at' => $now, 'updated_at' => $now],
            ['role' => 'company', 'permission_key' => 'apply_to_internship',  'is_enabled' => false, 'created_at' => $now, 'updated_at' => $now],
            ['role' => 'company', 'permission_key' => 'post_internship',       'is_enabled' => true,  'created_at' => $now, 'updated_at' => $now],
            ['role' => 'company', 'permission_key' => 'manage_listings',       'is_enabled' => true,  'created_at' => $now, 'updated_at' => $now],
            ['role' => 'company', 'permission_key' => 'view_company_profiles', 'is_enabled' => true,  'created_at' => $now, 'updated_at' => $now],
            ['role' => 'company', 'permission_key' => 'view_student_profiles', 'is_enabled' => true,  'created_at' => $now, 'updated_at' => $now],
            ['role' => 'company', 'permission_key' => 'download_resume',       'is_enabled' => true,  'created_at' => $now, 'updated_at' => $now],
            ['role' => 'company', 'permission_key' => 'view_own_applications', 'is_enabled' => false, 'created_at' => $now, 'updated_at' => $now],
            ['role' => 'company', 'permission_key' => 'manage_applications',   'is_enabled' => true,  'created_at' => $now, 'updated_at' => $now],
            ['role' => 'company', 'permission_key' => 'receive_notifications', 'is_enabled' => true,  'created_at' => $now, 'updated_at' => $now],
        ];

        RolePermission::insert($defaults);
        RolePermission::clearCache();

        return response()->json(['message' => 'Permissions reset to defaults.']);
    }
}
