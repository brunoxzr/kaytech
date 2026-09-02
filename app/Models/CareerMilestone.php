<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CareerMilestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'year',
        'title',
        'description',
        'technologies',
        'icon_name',
        'order',
    ];

    protected $casts = [
        'technologies' => 'array',
    ];
}
