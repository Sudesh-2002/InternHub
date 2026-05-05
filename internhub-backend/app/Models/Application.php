<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $fillable = [
        'internship_listing_id',
        'student_id',
        'resume_path',
        'status',
        'is_flagged',
    ];

    // Internship listing
    public function internship()
    {
        return $this->belongsTo(
            InternshipListing::class,
            'internship_listing_id'
        );
    }

    // Student
    public function student()
    {
        return $this->belongsTo(
            User::class,
            'student_id'
        );
    }
}