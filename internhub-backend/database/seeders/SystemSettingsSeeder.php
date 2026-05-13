<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SystemSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $now      = now();
        $settings = [
            // ── Platform ─────────────────────────────────────────────────
            ['key' => 'platform_name',               'value' => 'InternHub',              'type' => 'string',  'group' => 'platform',      'label' => 'Platform Name',                     'description' => 'Displayed in the browser title and emails.'],
            ['key' => 'platform_tagline',             'value' => 'Connect. Grow. Succeed.','type' => 'string',  'group' => 'platform',      'label' => 'Platform Tagline',                  'description' => 'Short tagline shown on the landing page.'],
            ['key' => 'maintenance_mode',             'value' => '0',                      'type' => 'boolean', 'group' => 'platform',      'label' => 'Maintenance Mode',                  'description' => 'When enabled, non-admin users see a maintenance page.'],
            ['key' => 'student_registration_open',    'value' => '1',                      'type' => 'boolean', 'group' => 'platform',      'label' => 'Student Registration Open',         'description' => 'Allow new student sign-ups.'],
            ['key' => 'company_registration_open',    'value' => '1',                      'type' => 'boolean', 'group' => 'platform',      'label' => 'Company Registration Open',         'description' => 'Allow new company sign-ups.'],
            ['key' => 'guest_browsing',               'value' => '1',                      'type' => 'boolean', 'group' => 'platform',      'label' => 'Guest Browsing',                    'description' => 'Allow unauthenticated users to browse internship listings.'],

            // ── Internship ────────────────────────────────────────────────
            ['key' => 'auto_approve_listings',        'value' => '0',                      'type' => 'boolean', 'group' => 'internship',    'label' => 'Auto-approve Listings',             'description' => 'Listings go live without admin review when enabled.'],
            ['key' => 'max_vacancies_per_listing',    'value' => '50',                     'type' => 'integer', 'group' => 'internship',    'label' => 'Max Vacancies per Listing',         'description' => 'Maximum number of vacancies a company can set per listing.'],
            ['key' => 'listing_expiry_days',          'value' => '90',                     'type' => 'integer', 'group' => 'internship',    'label' => 'Listing Expiry (days)',             'description' => 'Days after posting before a listing is automatically expired.'],
            ['key' => 'max_listings_per_company',     'value' => '20',                     'type' => 'integer', 'group' => 'internship',    'label' => 'Max Listings per Company',          'description' => 'Maximum active listings allowed per verified company.'],

            // ── Applications ──────────────────────────────────────────────
            ['key' => 'max_applications_per_student', 'value' => '10',                     'type' => 'integer', 'group' => 'applications',  'label' => 'Max Applications per Student',      'description' => 'Set to 0 for unlimited.'],
            ['key' => 'allow_multi_apply_same_company','value' => '1',                     'type' => 'boolean', 'group' => 'applications',  'label' => 'Allow Multiple Apps – Same Company','description' => 'Students can apply to multiple listings from the same company.'],
            ['key' => 'allow_withdraw_application',   'value' => '1',                      'type' => 'boolean', 'group' => 'applications',  'label' => 'Allow Withdrawal',                  'description' => 'Students can withdraw their own applications.'],

            // ── Notifications ─────────────────────────────────────────────
            ['key' => 'notify_new_application',       'value' => '1',                      'type' => 'boolean', 'group' => 'notifications', 'label' => 'New Application Alert',             'description' => 'Notify companies when a student applies.'],
            ['key' => 'notify_status_change',         'value' => '1',                      'type' => 'boolean', 'group' => 'notifications', 'label' => 'Status Change Alert',               'description' => 'Notify students when their application status changes.'],
            ['key' => 'notify_listing_approved',      'value' => '1',                      'type' => 'boolean', 'group' => 'notifications', 'label' => 'Listing Approved Alert',            'description' => 'Notify companies when their listing is approved.'],
            ['key' => 'notify_announcements',         'value' => '1',                      'type' => 'boolean', 'group' => 'notifications', 'label' => 'Announcement Alerts',               'description' => 'Deliver admin announcements to targeted users.'],
            ['key' => 'notify_support_reply',         'value' => '1',                      'type' => 'boolean', 'group' => 'notifications', 'label' => 'Support Reply Alert',               'description' => 'Notify users when admin replies to their support ticket.'],

            // ── Security ──────────────────────────────────────────────────
            ['key' => 'session_timeout_minutes',      'value' => '60',                     'type' => 'integer', 'group' => 'security',      'label' => 'Session Timeout (minutes)',         'description' => 'Idle time before a user is automatically logged out.'],
            ['key' => 'max_login_attempts',           'value' => '5',                      'type' => 'integer', 'group' => 'security',      'label' => 'Max Login Attempts',                'description' => 'Failed attempts before the account is temporarily locked.'],
            ['key' => 'lockout_minutes',              'value' => '15',                     'type' => 'integer', 'group' => 'security',      'label' => 'Lockout Duration (minutes)',        'description' => 'How long an account remains locked after too many failed logins.'],
            ['key' => 'require_email_verification',   'value' => '0',                      'type' => 'boolean', 'group' => 'security',      'label' => 'Require Email Verification',        'description' => 'Users must verify their email before accessing the platform.'],
        ];

        foreach ($settings as &$s) {
            $s['created_at'] = $now;
            $s['updated_at'] = $now;
        }

        DB::table('system_settings')->upsert($settings, ['key'], ['value', 'label', 'description', 'updated_at']);
    }
}
