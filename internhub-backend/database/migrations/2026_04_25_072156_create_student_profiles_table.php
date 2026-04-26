<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Basic Info (name, email, phone come from users table)
            $table->string('phone')->nullable();
            $table->string('location')->nullable();

            // Summary
            $table->text('summary')->nullable();

            // JSON columns for complex data
            $table->json('skills')->nullable();       // ["React", "Laravel", ...]
            $table->json('education')->nullable();     // [{degree, university, start, end, gpa}, ...]
            $table->json('experience')->nullable();    // [{title, company, duration, description}, ...]
            $table->json('projects')->nullable();      // [{title, description, tech, github}, ...]

            // Social links
            $table->string('github')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('portfolio')->nullable();

            // Resume
            $table->string('resume_path')->nullable();
            $table->string('resume_name')->nullable(); // original filename for display

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};