<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $locale = app()->getLocale();

        return array_merge(parent::share($request), [
            'locale' => $locale,
            'supportedLocales' => [
                'pt-BR' => 'Português',
                'en' => 'English',
                'es' => 'Español',
            ],
            'translations' => [
                'navigation' => __('navigation'),
                'home' => __('home'),
                'projects' => __('projects'),
                'services' => __('services'),
                'contact' => __('contact'),
            ],
            'whatsappUrl' => env('VITE_WHATSAPP_URL', 'https://wa.me/5500000000000'),
            'contactEmail' => 'bruno.kay2304@gmail.com',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role ?? 'admin',
                ] : null,
            ],
        ]);
    }
}
