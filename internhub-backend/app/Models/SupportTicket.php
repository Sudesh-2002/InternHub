<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    protected $fillable = ['user_id', 'subject', 'category', 'status', 'priority', 'rating', 'ended_by_user'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(SupportMessage::class, 'ticket_id')->orderBy('created_at');
    }

    public function latestMessage()
    {
        return $this->hasOne(SupportMessage::class, 'ticket_id')->latestOfMany();
    }
}
