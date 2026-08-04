<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LinkPageSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'group',
        'background_color',
        'background_image',
        'profile_image',
        'display_name',
        'bio',
    ];
}
