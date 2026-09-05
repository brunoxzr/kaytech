<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WaChat extends Model
{
    protected $table = 'wa_chats';

    protected $fillable = [
        'remote_jid', 'phone', 'name', 'is_group', 'profile_pic_url',
        'last_message', 'last_message_at', 'unread', 'archived', 'client_id',
    ];

    protected $casts = [
        'is_group' => 'boolean',
        'archived' => 'boolean',
        'unread' => 'integer',
        'last_message_at' => 'datetime',
    ];

    public function messages(): HasMany
    {
        return $this->hasMany(WaMessage::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
