<?php

namespace App\Services\Translation;

use InvalidArgumentException;

class TranslationManager implements TranslationService
{
    protected TranslationService $driver;

    public function __construct()
    {
        $driverName = config('translation.driver', 'deepl');
        
        $this->driver = match ($driverName) {
            'deepl' => new DeepLTranslationService(),
            'google' => new GoogleTranslationService(),
            'openai' => new OpenAITranslationService(),
            default => new DeepLTranslationService(),
        };
    }

    public function translate(string $text, string $sourceLocale, string $targetLocale): string
    {
        return $this->driver->translate($text, $sourceLocale, $targetLocale);
    }
}
