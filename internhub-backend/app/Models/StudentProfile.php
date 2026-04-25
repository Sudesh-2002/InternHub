<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    protected $fillable = [
        'user_id', 'skills', 'education', 'resume_path'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
