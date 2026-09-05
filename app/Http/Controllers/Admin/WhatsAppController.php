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
            ->orderByDesc('last_message_at')
            ->limit(200)
            ->get(['id', 'name', 'phone', 'is_group', 'profile_pic_url', 'last_message', 'last_message_at', 'unread', 'client_id']);

        return Inertia::render('Admin/WhatsApp/Inbox', [
            'chats' => $chats,
            'connection' => $this->safeState(),
            'overview' => $this->overview(),
        ]);
    }

    /** Mensagens de uma conversa. */
    public function thread(WaChat $chat)
    {
        $chat->update(['unread' => 0]);

        return response()->json([
            'chat' => $chat->only(['id', 'name', 'phone', 'is_group', 'client_id']),
            'messages' => $chat->messages()->orderBy('sent_at')->limit(300)
                ->get(['id', 'from_me', 'type', 'body', 'media_url', 'status', 'sent_at']),
        ]);
    }

    /** Envia mensagem numa conversa existente. */
    public function send(Request $request, WaChat $chat)
    {
        $data = $request->validate(['text' => 'required|string|max:4096']);

        $wamid = $this->evo->sendText($chat->phone ?: explode('@', $chat->remote_jid)[0], $data['text']);

        $chat->messages()->create([
            'wamid' => $wamid,
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

    private function overview(): array
    {
        $today = now()->startOfDay();

        return [
            'chats' => (int) WaChat::count(),
            'unread' => (int) WaChat::sum('unread'),
            'waiting' => (int) WaChat::where('unread', '>', 0)->count(),
            'sent_today' => (int) \App\Models\WaMessage::where('from_me', true)->where('sent_at', '>=', $today)->count(),
            'received_today' => (int) \App\Models\WaMessage::where('from_me', false)->where('sent_at', '>=', $today)->count(),
            'linked_clients' => (int) WaChat::whereNotNull('client_id')->count(),
        ];
    }
}
