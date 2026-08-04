<?php

namespace App\Services\Translation;

interface TranslationService
{
    public function translate(
        string $text,
        string $sourceLocale,
        string $targetLocale
    ): string;
}
