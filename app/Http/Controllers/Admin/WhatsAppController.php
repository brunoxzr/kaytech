<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\WaChat;
use App\Services\WhatsApp\EvolutionClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppController extends Controller
{
    public function __construct(private EvolutionClient $evo)
    {
    }

    /** Inbox — lista de conversas + visão geral. */
    public function inbox(Request $request): Response
    {
        $chats = WaChat::query()
            ->when(! $request->boolean('archived'), fn ($q) => $q->where('archived', false))
            ->with('client:id,name,status')
            ->orderByDesc('last_message_at')
            ->limit(300)
            ->get(['id', 'name', 'phone', 'is_group', 'profile_pic_url', 'last_message', 'last_message_at', 'unread', 'client_id'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'phone' => $c->phone,
                'is_group' => $c->is_group,
                'profile_pic_url' => $c->profile_pic_url,
                'last_message' => $c->last_message,
                'last_message_at' => $c->last_message_at,
                'unread' => $c->unread,
                'client_id' => $c->client_id,
                'client_name' => $c->client?->name,
                'client_status' => $c->client?->status,
                'is_lead' => in_array($c->client?->status, ['lead', 'prospect'], true),
            ]);

        return Inertia::render('Admin/WhatsApp/Inbox', [
            'chats' => $chats,
            'connection' => $this->safeState(),
        ]);
    }

    /** Mensagens de uma conversa. */
    public function thread(WaChat $chat)
    {
        $chat->update(['unread' => 0]);

        return response()->json([
            'chat' => $chat->only(['id', 'name', 'phone', 'is_group', 'client_id', 'profile_pic_url']),
            'messages' => $chat->messages()->orderBy('sent_at')->limit(300)
                ->get(['id', 'wamid', 'from_me', 'type', 'body', 'media_url', 'mimetype', 'reply_to_wamid', 'reply_to_preview', 'status', 'sent_at']),
        ]);
    }

    /** Busca clientes do CRM por nome/empresa/telefone (pra vincular manualmente a uma conversa). */
    public function searchClients(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        if ($q === '') {
            return response()->json([]);
        }

        $clients = Client::query()
            ->where(fn ($w) => $w->where('name', 'ilike', "%{$q}%")
                ->orWhere('company', 'ilike', "%{$q}%")
                ->orWhereRaw("regexp_replace(coalesce(phone,''), '\\D', '', 'g') LIKE ?", ['%' . preg_replace('/\D/', '', $q) . '%']))
            ->orderBy('name')
            ->limit(20)
            ->get(['id', 'name', 'company', 'phone', 'status']);

        return response()->json($clients);
    }

    /** Vincula (ou desvincula, com client_id nulo) uma conversa a um cliente existente do CRM. */
    public function link(Request $request, WaChat $chat)
    {
        $data = $request->validate(['client_id' => 'nullable|exists:clients,id']);

        $chat->update(['client_id' => $data['client_id'] ?? null]);

        return back(303);
    }

    /** Sincroniza (ou re-sincroniza) todo o histórico de chats/mensagens da Evolution. */
    public function import()
    {
        $result = $this->evo->importAll();

        return back()->with('success', "Importado: {$result['chats']} conversas, {$result['messages']} mensagens.");
    }

    /** Serve mídia (imagem/áudio/vídeo/documento) decriptando via Evolution. Cacheado em disco local. */
    public function media(\App\Models\WaMessage $message)
    {
        abort_unless($message->wamid && in_array($message->type, ['image', 'video', 'audio', 'document', 'sticker'], true), 404);

        $cachePath = "wa-media/{$message->wamid}";
        if (! \Illuminate\Support\Facades\Storage::disk('local')->exists($cachePath)) {
            $media = $this->evo->getMediaBase64($message->wamid);
            abort_if(! $media, 404);
            \Illuminate\Support\Facades\Storage::disk('local')->put($cachePath, base64_decode($media['base64']));
            if ($media['mimetype'] && $media['mimetype'] !== $message->mimetype) {
                $message->update(['mimetype' => $media['mimetype']]);
            }
        }

        return response(
            \Illuminate\Support\Facades\Storage::disk('local')->get($cachePath),
            200,
            ['Content-Type' => $message->mimetype ?: 'application/octet-stream', 'Cache-Control' => 'private, max-age=604800']
        );
    }

    /** Envia mensagem numa conversa existente, opcionalmente respondendo outra. */
    public function send(Request $request, WaChat $chat)
    {
        $data = $request->validate([
            'text' => 'required|string|max:4096',
            'reply_to_id' => 'nullable|integer',
        ]);

        $replyTo = isset($data['reply_to_id']) ? $chat->messages()->find($data['reply_to_id']) : null;

        $wamid = $this->evo->sendText(
            $chat->phone ?: explode('@', $chat->remote_jid)[0],
            $data['text'],
            $replyTo?->wamid
        );

        $chat->messages()->create([
            'wamid' => $wamid,
            'reply_to_wamid' => $replyTo?->wamid,
            'reply_to_preview' => $replyTo ? ($replyTo->body ?: "[{$replyTo->type}]") : null,
            'from_me' => true,
            'type' => 'text',
            'body' => $data['text'],
            'status' => 'sent',
            'sent_at' => now(),
        ]);
        $chat->update(['last_message' => $data['text'], 'last_message_at' => now(), 'unread' => 0]);

        return back(303);
    }

    /** Página de disparo em massa. */
    public function broadcast(): Response
    {
        return Inertia::render('Admin/WhatsApp/Broadcast', [
            'connection' => $this->safeState(),
            'clients' => Client::whereNotNull('phone')->where('phone', '!=', '')
                ->orderBy('name')
                ->get(['id', 'name', 'company', 'phone', 'status', 'tags']),
            'statuses' => Client::STATUSES,
        ]);
    }

    /** Envia a mesma mensagem para vários números. */
    public function broadcastSend(Request $request)
    {
        $data = $request->validate([
            'message' => 'required|string|max:4096',
            'numbers' => 'required|array|min:1|max:200',
            'numbers.*' => 'string',
        ]);

        $sent = 0;
        $failed = [];
        foreach ($data['numbers'] as $raw) {
            $digits = preg_replace('/\D/', '', $raw);
            if (strlen($digits) < 10) {
                $failed[] = $raw;
                continue;
            }
            if (strlen($digits) <= 11) {
                $digits = '55' . $digits;
            }

            try {
                $text = $data['message'];
                $wamid = $this->evo->sendText($digits, $text);

                $jid = $digits . '@s.whatsapp.net';
                $chat = WaChat::firstOrCreate(['remote_jid' => $jid], ['phone' => $digits, 'is_group' => false]);
                $chat->messages()->create([
                    'wamid' => $wamid, 'from_me' => true, 'type' => 'text',
                    'body' => $text, 'status' => 'sent', 'sent_at' => now(),
                ]);
                $chat->update(['last_message' => $text, 'last_message_at' => now()]);

                $sent++;
                usleep(700_000); // ~0,7s entre envios pra reduzir risco de bloqueio
            } catch (\Throwable $e) {
                Log::warning('[WA broadcast] ' . $e->getMessage());
                $failed[] = $raw;
            }
        }

        return back()->with('success', "Enviadas: {$sent}." . ($failed ? ' Falharam: ' . count($failed) . '.' : ''));
    }

    /** Conecta / mostra QR. */
    public function connect()
    {
        return response()->json([
            'state' => $this->safeState(),
            'qr' => $this->evo->configured() ? $this->evo->connectQr() : null,
        ]);
    }

    /** Webhook chamado pela Evolution a cada evento. Rota pública, protegida por token. */
    public function webhook(Request $request)
    {
        $expected = (string) config('services.evolution.webhook_token');
        if ($expected !== '' && ! hash_equals($expected, (string) $request->header('x-webhook-token', $request->query('token', '')))) {
            abort(401);
        }

        try {
            $this->evo->ingestWebhook($request->all());
        } catch (\Throwable $e) {
            Log::error('[WA webhook] ' . $e->getMessage());
        }

        return response()->json(['ok' => true]);
    }

    private function safeState(): array
    {
        try {
            return $this->evo->configured() ? $this->evo->connectionState() : ['state' => 'not_configured'];
        } catch (\Throwable $e) {
            return ['state' => 'error', 'error' => $e->getMessage()];
        }
    }

}
