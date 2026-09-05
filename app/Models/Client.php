<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = [
        'name', 'company', 'email', 'phone', 'status', 'qualification', 'replied', 'temperature',
        'deal_value', 'source', 'tags', 'next_action', 'next_action_at', 'project_id', 'lead_id', 'order',
    ];

    protected $casts = [
        'deal_value' => 'integer',
        'tags' => 'array',
        'qualification' => 'array',
        'replied' => 'boolean',
        'next_action_at' => 'date:Y-m-d',
    ];

    public const TEMPERATURES = ['cold' => 'Frio', 'warm' => 'Morno', 'hot' => 'Quente'];

    public const STATUSES = ['lead', 'prospect', 'contacted', 'proposal', 'won', 'lost'];

    /** Itens do checklist de qualificação (BANT). */
    public const QUALIFICATION = [
        'need' => 'Tem necessidade real',
        'authority' => 'Falei com quem decide',
        'budget' => 'Tem orçamento',
        'timing' => 'Tem prazo / urgência',
    ];

    public function notes(): HasMany
    {
        return $this->hasMany(ClientNote::class)->latest();
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(ContactLead::class, 'lead_id');
    }
}
