<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internship_listings', function (Blueprint $table) {
            $table->id();

            // Company relationship
            $table->foreignId('company_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            // Core fields
            $table->string('title');
            $table->text('description');
            $table->string('location');
            $table->enum('type', ['Remote', 'On-site', 'Hybrid'])->default('Remote');
            $table->string('salary')->nullable();          // e.g. "$800/mo"
            $table->date('deadline')->nullable();

            // Requirements
            $table->text('requirements')->nullable();       // bullet-point requirements
            $table->string('duration')->nullable();         // e.g. "3 months"
            $table->integer('vacancies')->default(1);

            // Admin approval workflow
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();

            // Soft delete + timestamps
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internship_listings');
    }
};