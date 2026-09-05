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
        'background_blur',
        'background_dim',
        'profile_image',
        'display_name',
        'role_tagline',
        'hero_title',
        'hero_description',
        'bio',
        'stat_1_value',
        'stat_1_label',
        'stat_2_value',
        'stat_2_label',
        'stat_3_value',
        'stat_3_label',
        'whatsapp_url',
        'contact_email',
    ];
}
