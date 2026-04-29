<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InternshipListing extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'title',
        'description',
        'location',
        'type',
        'salary',
        'deadline',
        'requirements',
        'duration',
        'vacancies',
        'status',
        'rejection_reason',
        'approved_at',
    ];

    protected $casts = [
        'deadline'    => 'date',
        'approved_at' => 'datetime',
        'vacancies'   => 'integer',
    ];

    // ── Relationships ────────────────────────────────────────────────────────

    /** Company (User) that posted this listing */
    public function company()
    {
        return $this->belongsTo(User::class, 'company_id');
    }

    /** Applications submitted for this listing */
    public function applications()
    {
        return $this->hasMany(Application::class, 'listing_id');
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeForCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /** Whether the deadline has passed */
    public function getIsExpiredAttribute(): bool
    {
        return $this->deadline && $this->deadline->isPast();
    }
}