<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->route('locale');

        if (!$locale) {
            $locale = $request->cookie('kaytech_locale') ?? session('locale') ?? 'pt-BR';
        }

        $supported = ['pt-BR', 'en', 'es'];

        if (!in_array($locale, $supported, true)) {
            $locale = 'pt-BR';
        }

        app()->setLocale($locale);
        session(['locale' => $locale]);

        return $next($request);
    }
}
