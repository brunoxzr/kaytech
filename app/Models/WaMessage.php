<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WaMessage extends Model
{
    protected $table = 'wa_messages';

    protected $fillable = [
        'wa_chat_id', 'wamid', 'reply_to_wamid', 'reply_to_preview', 'from_me', 'type', 'body', 'media_url', 'mimetype', 'status', 'sent_at',
    ];

    protected $casts = [
        'from_me' => 'boolean',
        'sent_at' => 'datetime',
    ];

    public function chat(): BelongsTo
    {
        return $this->belongsTo(WaChat::class, 'wa_chat_id');
    }
}
