<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,           // Creates admin user + admin_profiles row
            RolePermissionSeeder::class,  // Seeds permissions + role_permissions defaults
            SystemSettingsSeeder::class,  // Seeds all system_settings defaults
        ]);
    }
}