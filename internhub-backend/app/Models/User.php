<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = ['name', 'email', 'password', 'role', 'status'];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    /* ── Relationships ───────────────────────────── */

    public function companyProfile()
    {
        return $this->hasOne(CompanyProfile::class);
    }

    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function jobs() 
    {
        return $this->hasMany(InternshipListing::class, 'company_id');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'student_id');
    }

    /* ── Scopes ──────────────────────────────────── */

    public function scopeStudents($query)
    {
        return $query->where('role', 'student');
    }

    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /* ── Helpers ─────────────────────────────────── */

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }
}