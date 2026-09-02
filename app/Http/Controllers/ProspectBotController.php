<?php

namespace App\Http\Controllers;

use App\Models\ContactLead;
use App\Services\Gemini\GeminiClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Chatbot público de prospecção. Conversa livre guiada por um roteiro;
 * quando tem dados suficientes, fecha: salva Lead + devolve link de WhatsApp com o resumo.
 */
class ProspectBotController extends Controller
{
    public function chat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'messages' => 'required|array|min:1|max:40',
            'messages.*.role' => 'required|in:user,model',
            'messages.*.text' => 'required|string|max:2000',
        ]);

        $gemini = new GeminiClient();
        if (! $gemini->configured()) {
            return response()->json([
                'reply' => 'Nosso assistente está indisponível agora. Chame direto no WhatsApp: ' . $this->waLink('Olá! Vim pelo site da KayTech.'),
                'done' => false,
            ]);
        }

        $system = <<<SYS
Você é o assistente de prospecção da KayTech (software house: sistemas web, sites, dashboards, automações e soluções de IA).
Fale em português do Brasil, tom próximo e objetivo, uma pergunta por vez.

Roteiro (siga em ordem, adapte se a pessoa já respondeu):
1. Qual o nicho / ramo do negócio dela.
2. Como ela trabalha hoje (processos, ferramentas, o que trava).
3. O que ela quer: site, sistema/desenvolvimento, automação, IA — e para quê.
4. Orçamento aproximado ou faixa (se não souber, tudo bem).
5. Nome e um contato (e-mail ou telefone).

Quando tiver pelo menos nicho + o que quer + contato, ENCERRE: responda uma frase curta de fechamento e, na MESMA resposta, inclua um bloco JSON entre as marcas <RESUMO> e </RESUMO> assim:
<RESUMO>{"nome":"","contato":"","nicho":"","como_trabalha":"","o_que_quer":"","orcamento":"","resumo":"texto de 2-3 frases"}</RESUMO>
Não mencione o JSON para o usuário. Sem os dados mínimos, continue perguntando e NÃO gere o bloco.
SYS;

        $contents = [];
        foreach ($data['messages'] as $m) {
            $contents[] = $m['role'] === 'user'
                ? GeminiClient::userTurn($m['text'])
                : GeminiClient::modelTurn($m['text']);
        }

        try {
            $out = $gemini->generate($contents, [], $system);
            $text = $out['text'] ?? 'Desculpe, não entendi. Pode repetir?';

            // Extrai o bloco <RESUMO>...</RESUMO>
            if (preg_match('/<RESUMO>(.*?)<\/RESUMO>/s', $text, $mm)) {
                $payload = json_decode(trim($mm[1]), true) ?: [];
                $visibleText = trim(preg_replace('/<RESUMO>.*?<\/RESUMO>/s', '', $text));

                $lead = $this->saveLead($payload);
                $wa = $this->waLink($this->waMessage($payload));

                return response()->json([
                    'reply' => $visibleText ?: 'Perfeito, já registrei tudo. É só finalizar no WhatsApp 👇',
                    'done' => true,
                    'whatsapp' => $wa,
                    'lead_id' => $lead?->id,
                ]);
            }

            return response()->json(['reply' => $text, 'done' => false]);
        } catch (\Throwable $e) {
            Log::error('[ProspectBot] ' . $e->getMessage());

            return response()->json([
                'reply' => 'Tive um problema aqui. Pode falar direto no WhatsApp: ' . $this->waLink('Olá! Vim pelo site da KayTech.'),
                'done' => false,
            ]);
        }
    }

    private function saveLead(array $p): ?ContactLead
    {
        try {
            return ContactLead::create([
                'name' => $p['nome'] ?? 'Lead do chatbot',
                'email' => filter_var($p['contato'] ?? '', FILTER_VALIDATE_EMAIL) ?: null,
                'phone' => filter_var($p['contato'] ?? '', FILTER_VALIDATE_EMAIL) ? null : ($p['contato'] ?? null),
                'company' => $p['nicho'] ?? null,
                'project_type' => $p['o_que_quer'] ?? 'Não especificado',
                'budget_range' => $p['orcamento'] ?? null,
                'subject' => 'Prospecção via chatbot',
                'message' => trim(
                    "Nicho: " . ($p['nicho'] ?? '-') . "\n" .
                    "Como trabalha: " . ($p['como_trabalha'] ?? '-') . "\n" .
                    "O que quer: " . ($p['o_que_quer'] ?? '-') . "\n" .
                    "Orçamento: " . ($p['orcamento'] ?? '-') . "\n\n" .
                    "Resumo: " . ($p['resumo'] ?? '-')
                ),
                'status' => 'new',
                'source' => 'chatbot',
            ]);
        } catch (\Throwable $e) {
            Log::error('[ProspectBot] saveLead: ' . $e->getMessage());
            return null;
        }
    }

    private function waMessage(array $p): string
    {
        return "*Novo lead — chatbot KayTech*\n\n"
            . "Nome: " . ($p['nome'] ?? '-') . "\n"
            . "Contato: " . ($p['contato'] ?? '-') . "\n"
            . "Nicho: " . ($p['nicho'] ?? '-') . "\n"
            . "Como trabalha: " . ($p['como_trabalha'] ?? '-') . "\n"
            . "O que quer: " . ($p['o_que_quer'] ?? '-') . "\n"
            . "Orçamento: " . ($p['orcamento'] ?? '-') . "\n\n"
            . ($p['resumo'] ?? '');
    }

    private function waLink(string $message): string
    {
        $number = preg_replace('/\D/', '', (string) config('services.jarvis.whatsapp', '5543988506395'));

        return 'https://wa.me/' . $number . '?text=' . rawurlencode($message);
    }
}
