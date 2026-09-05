<?php

namespace App\Services\Gemini;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Cliente mínimo da API Gemini via HTTP, com suporte a function calling.
 * Chave em config('services.gemini.api_key').
 */
class GeminiClient
{
    private string $model;
    private string $key;

    public function __construct(?string $model = null)
    {
        $this->key = (string) config('services.gemini.api_key');
        $this->model = $model ?: (string) config('services.gemini.model', 'gemini-3.6-flash');
    }

    public function configured(): bool
    {
        return $this->key !== '';
    }

    /**
     * Uma rodada de generateContent.
     *
     * @param  array  $contents  histórico no formato Gemini [{role, parts:[...]}]
     * @param  array  $tools     [['function_declarations' => [...]]] ou []
     * @param  string|null  $systemPrompt
     * @return array  {text: ?string, functionCall: ?['name'=>..,'args'=>..], raw: array}
     */
    public function generate(array $contents, array $tools = [], ?string $systemPrompt = null, bool $webSearch = false): array
    {
        if (! $this->configured()) {
            throw new RuntimeException('GEMINI_API_KEY não configurada.');
        }

        $payload = ['contents' => $contents];

        if ($systemPrompt) {
            $payload['system_instruction'] = ['parts' => [['text' => $systemPrompt]]];
        }
        if ($tools) {
            $payload['tools'] = $tools;
            $payload['tool_config'] = ['function_calling_config' => ['mode' => 'AUTO']];
        }
        if ($webSearch) {
            // Grounding com Google Search — pesquisa real antes de responder.
            $payload['tools'] = array_merge($payload['tools'] ?? [], [['google_search' => (object) []]]);
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->key}";

        $res = Http::timeout(60)->retry(2, 1500, function ($e, $req) {
            // repete em sobrecarga temporária (503) e rate limit (429)
            return $e instanceof \Illuminate\Http\Client\RequestException
                && in_array($e->response?->status(), [429, 503], true);
        }, throw: false)->post($url, $payload);

        if ($res->failed()) {
            throw new RuntimeException('Gemini erro ' . $res->status() . ': ' . $res->body());
        }

        $data = $res->json();
        $parts = data_get($data, 'candidates.0.content.parts', []);

        $text = null;
        $functionCall = null;
        foreach ($parts as $p) {
            if (isset($p['text'])) {
                $text = ($text ?? '') . $p['text'];
            }
            if (isset($p['functionCall'])) {
                $functionCall = [
                    'name' => $p['functionCall']['name'],
                    'args' => $p['functionCall']['args'] ?? [],
                ];
            }
        }

        // Fontes usadas pelo grounding (quando webSearch)
        $sources = collect(data_get($data, 'candidates.0.groundingMetadata.groundingChunks', []))
            ->map(fn ($c) => ['title' => data_get($c, 'web.title'), 'uri' => data_get($c, 'web.uri')])
            ->filter(fn ($s) => $s['uri'])
            ->values()->all();

        return [
            'text' => $text,
            'functionCall' => $functionCall,
            'sources' => $sources,
            // parts brutas do modelo — devem ser reenviadas VERBATIM no histórico
            // (carregam thoughtSignature exigido pelos modelos novos)
            'modelParts' => $parts,
            'raw' => $data,
        ];
    }

    /** Helpers para montar `contents`. */
    public static function userTurn(string $text): array
    {
        return ['role' => 'user', 'parts' => [['text' => $text]]];
    }

    public static function modelTurn(string $text): array
    {
        return ['role' => 'model', 'parts' => [['text' => $text]]];
    }

    public static function functionResultTurn(string $name, array $result): array
    {
        return [
            'role' => 'user',
            'parts' => [[
                'functionResponse' => [
                    'name' => $name,
                    // a API exige um objeto; envolvemos em `content`
                    'response' => ['content' => $result],
                ],
            ]],
        ];
    }
}
