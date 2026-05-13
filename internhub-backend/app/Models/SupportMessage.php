<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportMessage extends Model
{
    protected $fillable = ['ticket_id', 'user_id', 'message', 'is_admin'];

    protected $casts = ['is_admin' => 'boolean'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
