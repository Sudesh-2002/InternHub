<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $permissions = [
            // ── Internships ─────────────────────────────
            ['key' => 'browse_internships',  'label' => 'Browse Internship Listings',   'description' => 'View and search available internship listings.',         'category' => 'Internships'],
            ['key' => 'apply_to_internship', 'label' => 'Apply to Internships',          'description' => 'Submit applications to internship opportunities.',        'category' => 'Internships'],
            ['key' => 'post_internship',     'label' => 'Post Internship Listings',      'description' => 'Create and publish new internship listings.',             'category' => 'Internships'],
            ['key' => 'manage_listings',     'label' => 'Edit / Delete Own Listings',   'description' => 'Modify or remove their own posted listings.',             'category' => 'Internships'],

            // ── Profiles ────────────────────────────────
            ['key' => 'view_company_profiles', 'label' => 'View Company Profiles',      'description' => 'Access company profile pages and details.',               'category' => 'Profiles'],
            ['key' => 'view_student_profiles', 'label' => 'View Student Profiles',      'description' => 'Access student profile pages and details.',               'category' => 'Profiles'],
            ['key' => 'download_resume',       'label' => 'Download Student Resumes',   'description' => 'Download CV/resume files attached to student profiles.',  'category' => 'Profiles'],

            // ── Applications ────────────────────────────
            ['key' => 'view_own_applications',  'label' => 'View Own Applications',     'description' => 'See status of their own submitted applications.',         'category' => 'Applications'],
            ['key' => 'manage_applications',    'label' => 'Manage Received Applications','description' => 'Review, accept, or reject applications from students.',  'category' => 'Applications'],

            // ── Communication ───────────────────────────
            ['key' => 'receive_notifications', 'label' => 'Receive Platform Notifications','description' => 'Receive in-app notifications from the platform.',      'category' => 'Communication'],
        ];

        foreach ($permissions as &$p) {
            $p['created_at'] = $now;
            $p['updated_at'] = $now;
        }

        DB::table('permissions')->upsert($permissions, ['key'], ['label', 'description', 'category', 'updated_at']);

        // Defaults per role
        $defaults = [
            // Student defaults
            ['role' => 'student', 'permission_key' => 'browse_internships',     'is_enabled' => true],
            ['role' => 'student', 'permission_key' => 'apply_to_internship',    'is_enabled' => true],
            ['role' => 'student', 'permission_key' => 'post_internship',         'is_enabled' => false],
            ['role' => 'student', 'permission_key' => 'manage_listings',         'is_enabled' => false],
            ['role' => 'student', 'permission_key' => 'view_company_profiles',   'is_enabled' => true],
            ['role' => 'student', 'permission_key' => 'view_student_profiles',   'is_enabled' => false],
            ['role' => 'student', 'permission_key' => 'download_resume',         'is_enabled' => false],
            ['role' => 'student', 'permission_key' => 'view_own_applications',   'is_enabled' => true],
            ['role' => 'student', 'permission_key' => 'manage_applications',     'is_enabled' => false],
            ['role' => 'student', 'permission_key' => 'receive_notifications',   'is_enabled' => true],

            // Company defaults
            ['role' => 'company', 'permission_key' => 'browse_internships',     'is_enabled' => true],
            ['role' => 'company', 'permission_key' => 'apply_to_internship',    'is_enabled' => false],
            ['role' => 'company', 'permission_key' => 'post_internship',         'is_enabled' => true],
            ['role' => 'company', 'permission_key' => 'manage_listings',         'is_enabled' => true],
            ['role' => 'company', 'permission_key' => 'view_company_profiles',   'is_enabled' => true],
            ['role' => 'company', 'permission_key' => 'view_student_profiles',   'is_enabled' => true],
            ['role' => 'company', 'permission_key' => 'download_resume',         'is_enabled' => true],
            ['role' => 'company', 'permission_key' => 'view_own_applications',   'is_enabled' => false],
            ['role' => 'company', 'permission_key' => 'manage_applications',     'is_enabled' => true],
            ['role' => 'company', 'permission_key' => 'receive_notifications',   'is_enabled' => true],
        ];

        foreach ($defaults as &$d) {
            $d['created_at'] = $now;
            $d['updated_at'] = $now;
        }

        DB::table('role_permissions')->upsert(
            $defaults,
            ['role', 'permission_key'],
            ['is_enabled', 'updated_at']
        );
    }
}
