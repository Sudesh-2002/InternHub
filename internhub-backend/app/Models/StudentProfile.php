<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    protected $fillable = [
        'user_id',
        'phone',
        'location',
        'summary',
        'skills',
        'education',
        'experience',
        'projects',
        'github',
        'linkedin',
        'portfolio',
        'resume_path',
        'resume_name',
        'avatar_path',
    ];

    protected $casts = [
        'skills'     => 'array',
        'education'  => 'array',
        'experience' => 'array',
        'projects'   => 'array',
    ];

    // Expose avatar_url accessor in JSON (/me response)
    protected $appends = ['avatar_url', 'resume_url'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Full public URL for the resume download.
     */
    public function getResumeUrlAttribute(): ?string
    {
        return $this->resume_path
            ? asset('storage/' . $this->resume_path)
            : null;
    }

    /**
     * Full public URL for the avatar image.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar_path
            ? asset('storage/' . $this->avatar_path)
            : null;
    }
}