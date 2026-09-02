<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = [
        'name', 'company', 'email', 'phone', 'status', 'deal_value', 'source',
        'tags', 'next_action', 'next_action_at', 'project_id', 'lead_id', 'order',
    ];

    protected $casts = [
        'deal_value' => 'integer',
        'tags' => 'array',
        'next_action_at' => 'date',
    ];

    public const STATUSES = ['prospect', 'contacted', 'proposal', 'won', 'lost'];

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
