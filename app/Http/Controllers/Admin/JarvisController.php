<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Gemini\GeminiClient;
use App\Services\Jarvis\JarvisTools;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class JarvisController extends Controller
{
    public function chat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'messages' => 'required|array|min:1',
            'messages.*.role' => 'required|in:user,model',
            'messages.*.text' => 'required|string|max:4000',
        ]);

        $gemini = new GeminiClient();
        if (! $gemini->configured()) {
            return response()->json(['reply' => 'A chave do Gemini (GEMINI_API_KEY) não está configurada no servidor.'], 200);
        }

        $now = Carbon::now()->format('d/m/Y H:i');
        $system = <<<SYS
Você é o Jarvis, mordomo e assistente de IA pessoal do Bruno, no estilo do Jarvis do Homem de Ferro.
Data e hora atual: {$now}.

TOM E PERSONALIDADE:
- Seco, formal, britânico. Sarcasmo fino e ácido faz parte do seu jeito — use com frequência, especialmente quando os números são ruins ou o pedido é óbvio.
- O sarcasmo é sempre elegante e contido, nunca deboche vulgar nem gíria. Uma alfinetada por resposta, no máximo.
- Exemplos do tom: "Cinco mil reais, senhor. Praticamente um império." / "Os milhões seguem a caminho. Devem chegar por volta de nunca." / "Feito. Tente não gastar tudo de uma vez."
- Nunca efusivo, nunca caloroso, sem frases de boas-vindas exageradas.
- Respostas curtas e objetivas (1 a 3 frases), sem enrolação. Dê o número primeiro, a alfinetada depois.
- Sem emojis, sem markdown. Texto limpo, pronto para ser falado em voz alta.

TRATAMENTO:
- Sempre se refira ao usuário como "senhor", nunca pelo nome.
- Se perguntarem quem é a namorada do Bruno (ou "minha namorada"): a namorada dele é a Isadora Bolelo, e o Bruno a ama muito.
- Se o usuário disser apenas "Jarvis", responda "Sim, senhor?" e aguarde.

DADOS E AÇÕES:
- Você tem ferramentas para consultar e alterar dados reais da KayTech: financeiro, clientes/CRM, leads e projetos.
- Use as ferramentas sempre que a pergunta exigir números ou ações. Nunca invente valores.
- Ao criar lançamento, mudar status ou anotar, execute e confirme de forma seca o que foi feito.
- Para ações destrutivas ou irreversíveis, peça confirmação antes de executar.
- Formate valores em reais. Se uma ferramenta retornar "erro", explique o problema em uma frase.
SYS;

        // Monta histórico no formato Gemini
        $contents = [];
        foreach ($data['messages'] as $m) {
            $contents[] = $m['role'] === 'user'
                ? GeminiClient::userTurn($m['text'])
                : GeminiClient::modelTurn($m['text']);
        }

        $tools = JarvisTools::declarations();

        try {
            // Loop de function calling (máx 6 rodadas)
            for ($i = 0; $i < 6; $i++) {
                $out = $gemini->generate($contents, $tools, $system);

                if ($out['functionCall']) {
                    $fc = $out['functionCall'];
                    $result = JarvisTools::run($fc['name'], $fc['args']);

                    // Reenvia as parts do modelo (carregam thoughtSignature), normalizando
                    // functionCall.args vazio: json_decode devolve [] mas a API exige objeto {}.
                    $parts = array_map(function ($p) {
                        if (isset($p['functionCall']) && empty($p['functionCall']['args'])) {
                            $p['functionCall']['args'] = new \stdClass();
                        }
                        return $p;
                    }, $out['modelParts']);

                    $contents[] = ['role' => 'model', 'parts' => $parts];
                    $contents[] = GeminiClient::functionResultTurn($fc['name'], $result);
                    continue;
                }

                return response()->json(['reply' => $out['text'] ?? '(sem resposta)']);
            }

            return response()->json(['reply' => 'Não consegui concluir — muitas etapas. Tente reformular.']);
        } catch (\Throwable $e) {
            Log::error('[Jarvis] ' . $e->getMessage());

            return response()->json(['reply' => 'Erro ao falar com a IA: ' . $e->getMessage()], 200);
        }
    }
}
