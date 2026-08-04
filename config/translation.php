<?php

return [
    'driver' => env('TRANSLATION_DRIVER', 'deepl'),

    'supported_locales' => [
        'pt-BR',
        'en',
        'es',
    ],

    'default_locale' => 'pt-BR',

    'cache_ttl' => 86400, // 24 hours

    'deepl' => [
        'api_key' => env('DEEPL_API_KEY'),
        'endpoint' => env('DEEPL_ENDPOINT', 'https://api-free.deepl.com/v2/translate'),
    ],

    'google' => [
        'api_key' => env('GOOGLE_TRANSLATE_API_KEY'),
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_TRANSLATION_MODEL', 'gpt-4o-mini'),
    ],
];
