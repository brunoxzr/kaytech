<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'technologies',
        'cover',
        'gallery',
        'project_url',
        'extra_links',
        'featured',
        'show_on_bruno_profile',
        'order',
    ];

    protected $casts = [
        'technologies' => 'array',
        'gallery' => 'array',
        'extra_links' => 'array',
        'featured' => 'boolean',
        'show_on_bruno_profile' => 'boolean',
    ];

    public function translations(): HasMany
    {
        return $this->hasMany(ProjectTranslation::class);
    }

    public function translation(?string $locale = null)
    {
        $locale = $locale ?: app()->getLocale();
        $trans = $this->translations->firstWhere('locale', $locale);
        if (!$trans && $locale !== 'pt-BR') {
            $trans = $this->translations->firstWhere('locale', 'pt-BR');
        }
        return $trans ?: $this->translations->first();
    }

    public function toArrayWithLocale(?string $locale = null): array
    {
        $locale = $locale ?: app()->getLocale();
        $trans = $this->translation($locale);

        return [
            'id' => $this->id,
            'slug' => $trans?->slug ?? '',
            'title' => $trans?->title ?? '',
            'category' => $trans?->category ?? '',
            'summary' => $trans?->summary ?? '',
            'challenge' => $trans?->challenge ?? '',
            'solution' => $trans?->solution ?? '',
            'technologies' => $this->technologies ?? [],
            'cover' => $this->cover,
            'gallery' => $this->gallery ?? [],
            'projectUrl' => $this->project_url,
            'extraLinks' => $this->extra_links ?? [],
            'featured' => (bool)$this->featured,
            'showOnBrunoProfile' => (bool)$this->show_on_bruno_profile,
            'order' => (int)$this->order,
            'translation_status' => $trans?->translation_status ?? 'published',
            'translations' => $this->translations->keyBy('locale')->toArray(),
        ];
    }
}
