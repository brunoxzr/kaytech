<?php

namespace App\Services\Prospector;

use App\Services\Gemini\GeminiClient;
use RuntimeException;

/**
 * Encontra empresas de um nicho numa cidade usando o Gemini com Google Search (grounding).
 * Foca em leads sem site próprio — bons alvos para vender landing page.
 */
class ProspectorService
{
    /**
     * @return array{leads: array<int, array>, sources: array, note: ?string}
     */
    public function search(string $city, string $niche, int $limit = 15): array
    {
        $gemini = new GeminiClient();
        if (! $gemini->configured()) {
            throw new RuntimeException('GEMINI_API_KEY não configurada no servidor.');
        }

        $limit = max(3, min(25, $limit));

        $prompt = <<<PROMPT
Pesquise no Google empresas do nicho "{$niche}" na cidade "{$city}" (Brasil).
Priorize negócios pequenos/médios que NÃO tenham site próprio (só aparecem no Google Maps, Instagram, iFood, Facebook ou não têm nada).

Para cada empresa (até {$limit}), retorne o que encontrar de:
- nome
- telefone (com DDD, formato só dígitos se possível)
- whatsapp (se diferente do telefone)
- endereco (rua, bairro, cidade)
- instagram (URL ou @)
- facebook (URL)
- site (URL do site PRÓPRIO, se tiver; deixe vazio se só tem Instagram/iFood/Facebook)
- tem_site: "sim" se tem site próprio, "rede_social" se só tem Instagram/Facebook/iFood, "nao" se não tem nada
- resumo: 1 frase sobre o que a empresa faz / o que dá pra ver do trabalho dela

Responda APENAS com um JSON válido, sem texto antes ou depois, no formato:
{"leads":[{"nome":"","telefone":"","whatsapp":"","endereco":"","instagram":"","facebook":"","site":"","tem_site":"nao","resumo":""}]}
Se não achar nada, retorne {"leads":[]}.
PROMPT;

        $out = $gemini->generate(
            [GeminiClient::userTurn($prompt)],
            tools: [],
            systemPrompt: 'Você é um pesquisador de prospecção B2B. Use a busca do Google para dados reais e atuais. Nunca invente empresas, telefones ou endereços — se não encontrar, deixe o campo vazio.',
            webSearch: true,
        );

        $leads = $this->parseLeads($out['text'] ?? '');

        return [
            'leads' => $leads,
            'sources' => $out['sources'] ?? [],
            'note' => $leads ? null : 'Nenhum resultado. Tente outro termo de nicho ou uma cidade maior.',
        ];
    }

    private function parseLeads(string $text): array
    {
        // remove cercas de código
        $text = preg_replace('/^```(?:json)?|```$/m', '', trim($text));

        // pega o primeiro { ... } que parecer JSON
        if (preg_match('/\{.*\}/s', $text, $m)) {
            $text = $m[0];
        }

        $data = json_decode($text, true);
        $raw = is_array($data['leads'] ?? null) ? $data['leads'] : [];

        $clean = [];
        foreach ($raw as $l) {
            $nome = trim((string) ($l['nome'] ?? ''));
            if ($nome === '') {
                continue;
            }
            $site = trim((string) ($l['site'] ?? ''));
            $temSite = strtolower((string) ($l['tem_site'] ?? ''));
            if (! in_array($temSite, ['sim', 'rede_social', 'nao'], true)) {
                $temSite = $site !== '' ? 'sim' : 'nao';
            }

            $clean[] = [
                'nome' => $nome,
                'telefone' => trim((string) ($l['telefone'] ?? '')),
                'whatsapp' => trim((string) ($l['whatsapp'] ?? '')),
                'endereco' => trim((string) ($l['endereco'] ?? '')),
                'instagram' => $this->normalizeInstagram((string) ($l['instagram'] ?? '')),
                'facebook' => trim((string) ($l['facebook'] ?? '')),
                'site' => $site,
                'tem_site' => $temSite,
                'resumo' => trim((string) ($l['resumo'] ?? '')),
            ];
        }

        return $clean;
    }

    private function normalizeInstagram(string $v): string
    {
        $v = trim($v);
        if ($v === '') {
            return '';
        }
        if (str_starts_with($v, 'http')) {
            return $v;
        }
        return 'https://instagram.com/' . ltrim($v, '@/');
    }
}
