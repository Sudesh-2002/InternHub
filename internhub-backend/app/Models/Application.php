<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $fillable = [
        'job_id', 'student_id', 'resume_path', 'status'
    ];
    
    public function job() {
        return $this->belongsTo(Job::class);
    }

    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }
}
