<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyVerification extends Model
{
    protected $fillable = [
        'company_profile_id',
        'reviewed_by',
        'status',
        'admin_note',
        'submitted_at',
        'reviewed_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at'  => 'datetime',
    ];

    public function companyProfile()
    {
        return $this->belongsTo(CompanyProfile::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}