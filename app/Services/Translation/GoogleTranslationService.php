<?php

namespace App\Services\Translation;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GoogleTranslationService implements TranslationService
{
    public function translate(string $text, string $sourceLocale, string $targetLocale): string
    {
        if (empty(trim($text)) || $sourceLocale === $targetLocale) {
            return $text;
        }

        $cacheKey = 'trans_g_' . md5($text . '_' . $sourceLocale . '_' . $targetLocale);

        return Cache::remember($cacheKey, config('translation.cache_ttl', 86400), function () use ($text, $targetLocale) {
            $apiKey = config('translation.google.api_key');
            if (!$apiKey) {
                Log::warning('Google Translate API key not configured, returning original text.');
                return $text;
            }

            try {
                $targetCode = explode('-', $targetLocale)[0];
                $response = Http::timeout(10)->post("https://translation.googleapis.com/language/translate/v2?key={$apiKey}", [
                    'q' => $text,
                    'target' => $targetCode,
                    'format' => 'text',
                ]);

                if ($response->successful() && isset($response->json()['data']['translations'][0]['translatedText'])) {
                    return $response->json()['data']['translations'][0]['translatedText'];
                }

                Log::error('Google Translation error: ' . $response->body());
            } catch (\Throwable $e) {
                Log::error('Google Translation exception: ' . $e->getMessage());
            }

            return $text;
        });
    }
}
