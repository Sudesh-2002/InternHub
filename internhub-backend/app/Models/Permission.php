<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = ['key', 'label', 'description', 'category'];

    public function rolePermissions()
    {
        return $this->hasMany(RolePermission::class, 'permission_key', 'key');
    }
}
