<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KaytechProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'tagline',
        'description',
        'cover',
        'access_url',
        'background_color',
        'background_image',
        'order',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
