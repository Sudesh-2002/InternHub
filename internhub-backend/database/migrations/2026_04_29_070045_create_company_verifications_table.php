<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_verifications', function (Blueprint $table) {
            $table->id();

            // One verification record per company profile
            $table->foreignId('company_profile_id')
                  ->constrained('company_profiles')
                  ->onDelete('cascade');

            // Which admin handled this review (nullable until actioned)
            $table->foreignId('reviewed_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            // Workflow status
            $table->enum('status', ['pending', 'verified', 'rejected', 'resubmit'])
                  ->default('pending');

            // Admin note written during review
            $table->text('admin_note')->nullable();

            // Timestamps for audit trail
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
        });

        Schema::table('company_profiles', function (Blueprint $table) {
            $table->enum('verification_status', ['pending', 'verified', 'rejected', 'resubmit'])
                  ->default('pending')
                  ->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropColumn('verification_status');
        });
        Schema::dropIfExists('company_verifications');
    }
};