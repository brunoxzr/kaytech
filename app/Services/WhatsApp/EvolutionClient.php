<?php

namespace App\Services\WhatsApp;

use App\Models\WaChat;
use App\Models\WaMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Cliente da Evolution API (Baileys) — WhatsApp não-oficial.
 * Uma instância = o número pessoal do Bruno, logado por QR code.
 */
class EvolutionClient
{
    private string $base;
    private string $key;
    private string $instance;

    public function __construct()
    {
        $this->base = (string) config('services.evolution.base_url');
        $this->key = (string) config('services.evolution.api_key');
        $this->instance = (string) config('services.evolution.instance', 'kaytech');
    }

    public function configured(): bool
    {
        return $this->base !== '' && $this->key !== '';
    }

    private function http()
    {
        if (! $this->configured()) {
            throw new RuntimeException('Evolution API não configurada (EVOLUTION_BASE_URL / EVOLUTION_API_KEY).');
        }

        return Http::baseUrl($this->base)
            ->withHeaders(['apikey' => $this->key])
            ->acceptJson()
            ->timeout(30);
    }

    /** Estado da conexão: open | connecting | close. */
    public function connectionState(): array
    {
        $res = $this->http()->get("/instance/connectionState/{$this->instance}");
        if ($res->failed()) {
            return ['state' => 'unknown', 'error' => $res->status()];
        }

        return ['state' => data_get($res->json(), 'instance.state', 'unknown')];
    }

    /** Base64 do QR code para parear o número. */
    public function connectQr(): ?string
    {
        $res = $this->http()->get("/instance/connect/{$this->instance}");
        if ($res->failed()) {
            return null;
        }

        return data_get($res->json(), 'base64') ?? data_get($res->json(), 'qrcode.base64');
    }

    public function logout(): void
    {
        $this->http()->delete("/instance/logout/{$this->instance}");
    }

    /** Envia texto. Retorna o wamid quando disponível. */
    public function sendText(string $phoneDigits, string $text): ?string
    {
        $res = $this->http()->post("/message/sendText/{$this->instance}", [
            'number' => $phoneDigits,
            'text' => $text,
        ]);

        if ($res->failed()) {
            throw new RuntimeException('Falha ao enviar: ' . $res->status() . ' ' . substr($res->body(), 0, 200));
        }

        return data_get($res->json(), 'key.id');
    }

    /**
     * Processa o payload de webhook da Evolution (evento messages.upsert / send.message)
     * e grava chat + mensagem no banco. Retorna o WaChat afetado, se houver.
     */
    public function ingestWebhook(array $payload): ?WaChat
    {
        $event = $payload['event'] ?? '';
        $data = $payload['data'] ?? [];

        if (! str_contains($event, 'messages') && ! str_contains($event, 'send.message')) {
            return null;
        }

        // A Evolution manda ora um objeto, ora lista.
        $items = isset($data['key']) ? [$data] : ($data['messages'] ?? $data);
        if (! is_array($items)) {
            return null;
        }

        $chat = null;
        foreach ($items as $m) {
            $chat = $this->storeIncoming($m) ?? $chat;
        }

        return $chat;
    }

    private function storeIncoming(array $m): ?WaChat
    {
        $jid = data_get($m, 'key.remoteJid');
        if (! $jid) {
            return null;
        }

        $fromMe = (bool) data_get($m, 'key.fromMe', false);
        $isGroup = str_ends_with($jid, '@g.us');
        $wamid = data_get($m, 'key.id');
        $pushName = data_get($m, 'pushName');

        [$type, $body, $mediaUrl] = $this->extractContent($m);

        $tsRaw = data_get($m, 'messageTimestamp');
        $sentAt = $tsRaw ? Carbon::createFromTimestamp(is_array($tsRaw) ? ($tsRaw['low'] ?? time()) : $tsRaw) : now();

        $chat = WaChat::firstOrNew(['remote_jid' => $jid]);
        $chat->is_group = $isGroup;
        if (! $isGroup) {
            $chat->phone = preg_replace('/\D/', '', explode('@', $jid)[0]);
        }
        if ($pushName && (! $chat->name || $chat->is_group)) {
            $chat->name = $pushName;
        }
        $chat->last_message = $body ?: "[{$type}]";
        $chat->last_message_at = $sentAt;
        if (! $fromMe) {
            $chat->unread = ($chat->unread ?? 0) + 1;
        }
        // vincula a um cliente do CRM pelo telefone, se bater
        if (! $chat->client_id && $chat->phone) {
            $client = \App\Models\Client::whereRaw("regexp_replace(coalesce(phone,''), '\\D', '', 'g') LIKE ?", ['%' . substr($chat->phone, -8)])->first();
            if ($client) {
                $chat->client_id = $client->id;
            }
        }
        $chat->save();

        if ($wamid && $chat->messages()->where('wamid', $wamid)->exists()) {
            return $chat;
        }

        $chat->messages()->create([
            'wamid' => $wamid,
            'from_me' => $fromMe,
            'type' => $type,
            'body' => $body,
            'media_url' => $mediaUrl,
            'status' => $fromMe ? 'sent' : null,
            'sent_at' => $sentAt,
        ]);

        return $chat;
    }

    /** @return array{0:string,1:?string,2:?string} [type, body, mediaUrl] */
    private function extractContent(array $m): array
    {
        $msg = data_get($m, 'message', []);

        if ($t = data_get($msg, 'conversation')) {
            return ['text', $t, null];
        }
        if ($t = data_get($msg, 'extendedTextMessage.text')) {
            return ['text', $t, null];
        }
        foreach (['imageMessage' => 'image', 'videoMessage' => 'video', 'audioMessage' => 'audio', 'documentMessage' => 'document', 'stickerMessage' => 'sticker'] as $k => $type) {
            if ($node = data_get($msg, $k)) {
                return [$type, data_get($node, 'caption'), data_get($node, 'url')];
            }
        }
        if ($t = data_get($msg, 'buttonsResponseMessage.selectedDisplayText')) {
            return ['text', $t, null];
        }

        return ['text', null, null];
    }
}
