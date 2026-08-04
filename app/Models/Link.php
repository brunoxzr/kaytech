<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Link extends Model
{
    use HasFactory;

    protected $fillable = [
        'group',
        'title',
        'url',
        'icon_name',
        'order',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
