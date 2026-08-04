<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'icon_name',
        'order',
    ];

    public function translations(): HasMany
    {
        return $this->hasMany(ServiceTranslation::class);
    }

    public function toArrayWithLocale(?string $locale = null): array
    {
        $locale = $locale ?: app()->getLocale();
        $trans = $this->translations->firstWhere('locale', $locale)
            ?: $this->translations->firstWhere('locale', 'pt-BR')
            ?: $this->translations->first();

        return [
            'id' => $this->id,
            'number' => $this->number,
            'iconName' => $this->icon_name,
            'order' => $this->order,
            'title' => $trans?->title ?? '',
            'description' => $trans?->description ?? '',
            'translations' => $this->translations->keyBy('locale')->toArray(),
        ];
    }
}
