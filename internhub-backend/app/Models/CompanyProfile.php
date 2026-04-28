<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyProfile extends Model
{
    protected $fillable = [
        // Identity
        'user_id',
        'logo_path',
        'company_name',
        'registered_name',
        'industry',
        'registration_no',
        'year_founded',
        'company_size',
        'headquarters',
        'website',

        // Description
        'about',
        'mission',
        'vision',
        'services',
        'technologies',
        'culture',

        // Contact
        'official_email',
        'hr_email',
        'phone',
        'address',
        'linkedin_url',
        'facebook_url',

        // Documents
        'business_cert_path',
        'tax_docs_path',
        'verification_doc_path',
        'hr_auth_path',
    ];

    protected $casts = [
        'year_founded' => 'integer',
    ];

    // ── Relationships ─────────────────────────────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ── Accessors: full storage URL for file fields ───────────────────────
    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo_path) return null;

        if (str_starts_with($this->logo_path, 'http')) {
            return $this->logo_path;
        }

        return asset('storage/' . $this->logo_path);
    }

    public function getBusinessCertUrlAttribute(): ?string
    {
        return $this->business_cert_path
            ? asset('storage/' . $this->business_cert_path)
            : null;
    }

    public function getTaxDocsUrlAttribute(): ?string
    {
        return $this->tax_docs_path
            ? asset('storage/' . $this->tax_docs_path)
            : null;
    }

    public function getVerificationDocUrlAttribute(): ?string
    {
        return $this->verification_doc_path
            ? asset('storage/' . $this->verification_doc_path)
            : null;
    }

    public function getHrAuthUrlAttribute(): ?string
    {
        return $this->hr_auth_path
            ? asset('storage/' . $this->hr_auth_path)
            : null;
    }
}