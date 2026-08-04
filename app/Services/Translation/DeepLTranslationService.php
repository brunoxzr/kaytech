<?php

namespace App\Services\Translation;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DeepLTranslationService implements TranslationService
{
    public function translate(string $text, string $sourceLocale, string $targetLocale): string
    {
        if (empty(trim($text)) || $sourceLocale === $targetLocale) {
            return $text;
        }

        $cacheKey = 'trans_' . md5($text . '_' . $sourceLocale . '_' . $targetLocale);

        return Cache::remember($cacheKey, config('translation.cache_ttl', 86400), function () use ($text, $sourceLocale, $targetLocale) {
            $apiKey = config('translation.deepl.api_key');
            if (!$apiKey) {
                Log::warning('DeepL API key not configured, returning original text.');
                return $text;
            }

            try {
                $targetCode = strtoupper(explode('-', $targetLocale)[0]);
                if ($targetLocale === 'pt-BR') {
                    $targetCode = 'PT-BR';
                } elseif ($targetLocale === 'en') {
                    $targetCode = 'EN-US';
                }

                $response = Http::timeout(10)->withHeaders([
                    'Authorization' => 'DeepL-Auth-Key ' . $apiKey,
                ])->post(config('translation.deepl.endpoint'), [
                    'text' => [$text],
                    'target_lang' => $targetCode,
                ]);

                if ($response->successful() && isset($response->json()['translations'][0]['text'])) {
                    return $response->json()['translations'][0]['text'];
                }

                Log::error('DeepL translation error: ' . $response->body());
            } catch (\Throwable $e) {
                Log::error('DeepL translation exception: ' . $e->getMessage());
            }

            return $text;
        });
    }
}
