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

    /** Lista os chats já sincronizados pela Evolution (histórico completo). */
    public function findChats(): array
    {
        $res = $this->http()->post("/chat/findChats/{$this->instance}", []);
        if ($res->failed()) {
            return [];
        }

        return $res->json() ?? [];
    }

    /** Lista os contatos salvos, indexados por remoteJid — fonte confiável de nome/foto. */
    public function findContacts(): array
    {
        $res = $this->http()->timeout(60)->post("/chat/findContacts/{$this->instance}", []);
        if ($res->failed()) {
            return [];
        }

        $byJid = [];
        foreach ($res->json() ?? [] as $c) {
            $jid = data_get($c, 'remoteJid');
            if ($jid) {
                $byJid[$jid] = $c;
            }
        }

        return $byJid;
    }

    /** Lista mensagens de um chat específico, paginado. */
    public function findMessages(string $remoteJid, int $page = 1, int $offset = 100): array
    {
        $res = $this->http()->post("/chat/findMessages/{$this->instance}", [
            'where' => ['key' => ['remoteJid' => $remoteJid]],
            'page' => $page,
            'offset' => $offset,
        ]);
        if ($res->failed()) {
            return ['records' => [], 'pages' => 0, 'currentPage' => $page];
        }

        return data_get($res->json(), 'messages', ['records' => [], 'pages' => 0, 'currentPage' => $page]);
    }

    /** Baixa e decripta uma mídia a partir do wamid, retornando [base64, mimetype, fileName] ou null. */
    public function getMediaBase64(string $wamid): ?array
    {
        $res = $this->http()->timeout(60)->post("/chat/getBase64FromMediaMessage/{$this->instance}", [
            'message' => ['key' => ['id' => $wamid]],
            'convertToMp4' => false,
        ]);
        if ($res->failed()) {
            return null;
        }

        $json = $res->json();
        $base64 = data_get($json, 'base64');
        if (! $base64) {
            return null;
        }

        return [
            'base64' => $base64,
            'mimetype' => data_get($json, 'mimetype', 'application/octet-stream'),
            'fileName' => data_get($json, 'fileName'),
        ];
    }

    /** Envia texto, opcionalmente citando outra mensagem (reply). Retorna o wamid quando disponível. */
    public function sendText(string $phoneDigits, string $text, ?string $quotedWamid = null): ?string
    {
        $payload = ['number' => $phoneDigits, 'text' => $text];
        if ($quotedWamid) {
            $payload['quoted'] = ['key' => ['id' => $quotedWamid]];
        }

        $res = $this->http()->post("/message/sendText/{$this->instance}", $payload);

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

    /**
     * Importa todo o histórico já sincronizado pela Evolution (chats + mensagens)
     * pro banco local. Idempotente — pode rodar de novo a qualquer momento.
     */
    public function importAll(int $messagesPerChat = 200): array
    {
        $chats = $this->findChats();
        $contacts = $this->findContacts();
        $chatCount = 0;
        $msgCount = 0;

        foreach ($chats as $c) {
            $jid = data_get($c, 'remoteJid');
            if (! $jid || str_ends_with($jid, '@broadcast') || $jid === 'status@broadcast') {
                continue;
            }

            $isGroup = str_ends_with($jid, '@g.us');
            $altJid = data_get($c, 'remoteJidAlt');
            // pushName do chat/lastMessage não é confiável (pode vir "Você" quando a última msg foi nossa);
            // o nome salvo do contato é a fonte correta.
            $contact = $contacts[$jid] ?? null;
            $pushName = data_get($contact, 'pushName') ?: data_get($c, 'pushName');

            $chat = WaChat::firstOrNew(['remote_jid' => $jid]);
            $chat->is_group = $isGroup;
            if (! $isGroup) {
                $phoneSource = $altJid ?: $jid;
                $chat->phone = preg_replace('/\D/', '', explode('@', $phoneSource)[0]);
            }
            if ($pushName && strtolower(trim($pushName)) !== 'você' && ! ctype_digit(str_replace(['+', ' '], '', $pushName))) {
                $chat->name = $pushName;
            }
            if ($url = data_get($contact, 'profilePicUrl') ?: data_get($c, 'profilePicUrl')) {
                $chat->profile_pic_url = $url;
            }
            if (! $chat->client_id && $chat->phone) {
                $client = \App\Models\Client::whereRaw("regexp_replace(coalesce(phone,''), '\\D', '', 'g') LIKE ?", ['%' . substr($chat->phone, -8)])->first();
                if ($client) {
                    $chat->client_id = $client->id;
                }
            }
            $chat->save();
            $chatCount++;

            $messages = $this->findMessages($jid, 1, $messagesPerChat);
            $records = $messages['records'] ?? [];
            // vem mais recente -> mais antiga; grava em ordem cronológica
            foreach (array_reverse($records) as $m) {
                if ($this->storeHistoryMessage($chat, $m)) {
                    $msgCount++;
                }
            }

            $last = $chat->messages()->orderByDesc('sent_at')->first();
            if ($last) {
                $chat->last_message = $last->body ?: "[{$last->type}]";
                $chat->last_message_at = $last->sent_at;
                $chat->save();
            }
        }

        return ['chats' => $chatCount, 'messages' => $msgCount];
    }

    private function storeHistoryMessage(WaChat $chat, array $m): bool
    {
        $wamid = data_get($m, 'key.id');
        if (! $wamid || $chat->messages()->where('wamid', $wamid)->exists()) {
            return false;
        }

        $fromMe = (bool) data_get($m, 'key.fromMe', false);
        [$type, $body, $mediaUrl, $mimetype] = $this->extractContent($m);
        [$replyWamid, $replyPreview] = $this->extractQuoted($m);
        $tsRaw = data_get($m, 'messageTimestamp');
        $sentAt = $tsRaw ? Carbon::createFromTimestamp(is_array($tsRaw) ? ($tsRaw['low'] ?? time()) : $tsRaw) : now();

        $chat->messages()->create([
            'wamid' => $wamid,
            'reply_to_wamid' => $replyWamid,
            'reply_to_preview' => $replyPreview,
            'from_me' => $fromMe,
            'type' => $type,
            'body' => $body,
            'media_url' => $mediaUrl,
            'mimetype' => $mimetype,
            'status' => data_get($m, 'status'),
            'sent_at' => $sentAt,
        ]);

        return true;
    }

    /** @return array{0:?string,1:?string} [wamid citado, preview de texto] */
    private function extractQuoted(array $m): array
    {
        $ctx = data_get($m, 'message.extendedTextMessage.contextInfo')
            ?? data_get($m, 'contextInfo');
        $stanzaId = data_get($ctx, 'stanzaId');
        if (! $stanzaId) {
            return [null, null];
        }

        $quotedMsg = data_get($ctx, 'quotedMessage', []);
        $preview = data_get($quotedMsg, 'conversation')
            ?? data_get($quotedMsg, 'extendedTextMessage.text')
            ?? (data_get($quotedMsg, 'imageMessage') ? '📷 Imagem' : null)
            ?? (data_get($quotedMsg, 'audioMessage') ? '🎤 Áudio' : null)
            ?? (data_get($quotedMsg, 'videoMessage') ? '🎬 Vídeo' : null)
            ?? (data_get($quotedMsg, 'documentMessage') ? '📄 Documento' : null);

        return [$stanzaId, $preview ? mb_substr($preview, 0, 160) : null];
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
        // contatos "@lid" (identidade oculta) trazem o número real em remoteJidAlt
        $altJid = data_get($m, 'key.remoteJidAlt');

        [$type, $body, $mediaUrl, $mimetype] = $this->extractContent($m);

        $tsRaw = data_get($m, 'messageTimestamp');
        $sentAt = $tsRaw ? Carbon::createFromTimestamp(is_array($tsRaw) ? ($tsRaw['low'] ?? time()) : $tsRaw) : now();

        $chat = WaChat::firstOrNew(['remote_jid' => $jid]);
        $chat->is_group = $isGroup;
        if (! $isGroup) {
            $phoneSource = $altJid ?: $jid;
            $chat->phone = preg_replace('/\D/', '', explode('@', $phoneSource)[0]);
        }
        if ($pushName && ! $fromMe && strtolower(trim($pushName)) !== 'você' && $pushName !== $chat->phone && (! $chat->name || $chat->is_group)) {
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

        [$replyWamid, $replyPreview] = $this->extractQuoted($m);

        $chat->messages()->create([
            'wamid' => $wamid,
            'reply_to_wamid' => $replyWamid,
            'reply_to_preview' => $replyPreview,
            'from_me' => $fromMe,
            'type' => $type,
            'body' => $body,
            'media_url' => $mediaUrl,
            'mimetype' => $mimetype,
            'status' => $fromMe ? 'sent' : null,
            'sent_at' => $sentAt,
        ]);

        return $chat;
    }

    /** @return array{0:string,1:?string,2:?string,3:?string} [type, body, mediaUrl, mimetype] */
    private function extractContent(array $m): array
    {
        $msg = data_get($m, 'message', []);

        if ($t = data_get($msg, 'conversation')) {
            return ['text', $t, null, null];
        }
        if ($t = data_get($msg, 'extendedTextMessage.text')) {
            return ['text', $t, null, null];
        }
        foreach (['imageMessage' => 'image', 'videoMessage' => 'video', 'audioMessage' => 'audio', 'documentMessage' => 'document', 'stickerMessage' => 'sticker'] as $k => $type) {
            if ($node = data_get($msg, $k)) {
                return [$type, data_get($node, 'caption'), data_get($node, 'url'), data_get($node, 'mimetype')];
            }
        }
        if ($t = data_get($msg, 'buttonsResponseMessage.selectedDisplayText')) {
            return ['text', $t, null, null];
        }

        return ['text', null, null, null];
    }
}
