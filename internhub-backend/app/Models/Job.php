<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    protected $fillable = [
        'company_id', 'title', 'description',
        'location', 'type', 'status'
    ];
    
    public function company() {
        return $this->belongsTo(User::class, 'company_id');
    }

    public function applications() {
        return $this->hasMany(Application::class);
    }
}
