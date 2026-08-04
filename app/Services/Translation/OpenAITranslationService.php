<?php

namespace App\Services\Translation;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class OpenAITranslationService implements TranslationService
{
    public function translate(string $text, string $sourceLocale, string $targetLocale): string
    {
        if (empty(trim($text)) || $sourceLocale === $targetLocale) {
            return $text;
        }

        $cacheKey = 'trans_oai_' . md5($text . '_' . $sourceLocale . '_' . $targetLocale);

        return Cache::remember($cacheKey, config('translation.cache_ttl', 86400), function () use ($text, $sourceLocale, $targetLocale) {
            $apiKey = config('translation.openai.api_key');
            if (!$apiKey) {
                Log::warning('OpenAI API key not configured, returning original text.');
                return $text;
            }

            try {
                $targetLang = $targetLocale === 'en' ? 'English' : ($targetLocale === 'es' ? 'Spanish' : 'Portuguese');
                $response = Http::timeout(15)->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ])->post('https://api.openai.com/v1/chat/completions', [
                    'model' => config('translation.openai.model', 'gpt-4o-mini'),
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are a professional software localization translator. Translate text accurately preserving proper nouns like KayTech, KayVision, CEEP, Espaço Assahi, Minoru Bentô, Billy Bob, Laravel, PostgreSQL, React.',
                        ],
                        [
                            'role' => 'user',
                            'content' => "Translate the following text to {$targetLang}. Return ONLY the translated string without quotes or markdown wrappers:\n\n{$text}",
                        ]
                    ],
                    'temperature' => 0.2,
                ]);

                if ($response->successful() && isset($response->json()['choices'][0]['message']['content'])) {
                    return trim($response->json()['choices'][0]['message']['content']);
                }

                Log::error('OpenAI translation error: ' . $response->body());
            } catch (\Throwable $e) {
                Log::error('OpenAI translation exception: ' . $e->getMessage());
            }

            return $text;
        });
    }
}
