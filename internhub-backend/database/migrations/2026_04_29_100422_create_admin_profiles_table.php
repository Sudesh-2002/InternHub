<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * php artisan migrate
     */
    public function up(): void
    {
        Schema::create('admin_profiles', function (Blueprint $table) {
            $table->id();

            // Link to users table
            $table->foreignId('user_id')
                  ->unique()
                  ->constrained()
                  ->onDelete('cascade');

            // Auto-generated admin ID (e.g. ADM-000001)
            $table->string('admin_id')->unique();

            // Profile picture
            $table->string('avatar_path')->nullable();

            // Contact & identity
            $table->string('phone')->nullable();
            $table->string('department')->nullable();  // e.g. "Platform Operations"
            $table->string('position')->nullable();    // e.g. "Super Admin"

            // Extra details
            $table->text('bio')->nullable();
            $table->string('location')->nullable();    // e.g. "Colombo, Sri Lanka"
            $table->string('timezone')->nullable();    // e.g. "Asia/Colombo"

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_profiles');
    }
};