<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // ── Step 1: Identity ──────────────────────────────────────────
            $table->string('logo_path')->nullable();
            $table->string('company_name');
            $table->string('registered_name')->nullable();
            $table->string('industry')->nullable();
            $table->string('registration_no')->nullable();
            $table->year('year_founded')->nullable();
            $table->string('company_size')->nullable();        // e.g. "50-100"
            $table->string('headquarters')->nullable();
            $table->string('website')->nullable();

            // ── Step 2: Description ───────────────────────────────────────
            $table->text('about')->nullable();
            $table->text('mission')->nullable();
            $table->text('vision')->nullable();
            $table->text('services')->nullable();
            $table->text('technologies')->nullable();          // comma-separated
            $table->text('culture')->nullable();

            // ── Step 3: Contact ───────────────────────────────────────────
            $table->string('official_email')->nullable();
            $table->string('hr_email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('facebook_url')->nullable();

            // ── Step 4: Documents ─────────────────────────────────────────
            $table->string('business_cert_path')->nullable();
            $table->string('tax_docs_path')->nullable();
            $table->string('verification_doc_path')->nullable();
            $table->string('hr_auth_path')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_profiles');
    }
};