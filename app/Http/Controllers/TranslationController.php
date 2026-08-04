<?php

namespace App\Http\Controllers;

use App\Services\Translation\TranslationManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TranslationController extends Controller
{
    public function translate(Request $request): JsonResponse
    {
        $request->validate([
            'text' => 'required|string',
            'source_locale' => 'nullable|string',
            'target_locale' => 'required|string|in:pt-BR,en,es',
        ]);

        $text = $request->input('text');
        $source = $request->input('source_locale', 'pt-BR');
        $target = $request->input('target_locale');

        try {
            $translator = new TranslationManager();
            $translated = $translator->translate($text, $source, $target);

            return response()->json([
                'success' => true,
                'translatedText' => $translated,
                'driver' => config('translation.driver'),
            ]);
        } catch (\Throwable $e) {
            Log::error('Erro ao traduzir via API: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'translatedText' => $text, // Fallback to original text
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
