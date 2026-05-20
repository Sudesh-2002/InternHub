<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type');          // student_registered | company_registered | listing_submitted | verification_request | support_ticket
            $table->string('title');
            $table->text('message');
            $table->string('link')->nullable(); // deep-link e.g. /admin/dashboard/students
            $table->json('meta')->nullable();   // extra payload (user id, name, etc.)
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_notifications');
    }
};
