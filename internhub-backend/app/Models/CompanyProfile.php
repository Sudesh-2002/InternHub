<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyProfile extends Model
{
    protected $fillable = [
        'user_id', 'company_name', 'about', 'website', 'logo_path'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
