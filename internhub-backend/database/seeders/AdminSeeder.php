<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\AdminProfile;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create (or find) the admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@internhub.com'],
            [
                'name'     => 'Admin',
                'password' => Hash::make('password123'),
                'role'     => 'admin',
            ]
        );

        // 2. Create the admin_profiles row if it doesn't exist yet.
        //    The model's booted() hook auto-generates admin_id on insert,
        //    but we guarantee the non-nullable column is always populated.
        if (!AdminProfile::where('user_id', $admin->id)->exists()) {
            $next    = (AdminProfile::max('id') ?? 0) + 1;
            $adminId = 'ADM-' . str_pad($next, 6, '0', STR_PAD_LEFT);

            AdminProfile::create([
                'user_id'    => $admin->id,
                'admin_id'   => $adminId,
                'department' => 'Platform Operations',
                'position'   => 'Super Admin',
            ]);
        }
    }
}