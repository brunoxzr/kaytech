<?php

namespace App\Http\Controllers;

use App\Models\TrustedCompany;
use App\Models\Project;
use App\Models\Service;
use App\Models\KaytechProduct;
use App\Models\SiteSetting;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $locale = app()->getLocale();

        $companies = TrustedCompany::orderBy('order')->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'logo' => $c->logo,
                'url' => $c->url,
            ];
        });

        $projects = Project::with('translations')
            ->orderBy('order')
            ->get()
            ->map(fn ($p) => $p->toArrayWithLocale($locale));

        $services = Service::with('translations')
            ->orderBy('order')
            ->get()
            ->map(fn ($s) => $s->toArrayWithLocale($locale));

        $products = KaytechProduct::where('active', true)->orderBy('order')->get();

        $whatsappUrl = SiteSetting::where('key', 'whatsapp_url')->value('value')
            ?? env('VITE_WHATSAPP_URL', 'https://wa.me/5500000000000');
        $contactEmail = SiteSetting::where('key', 'contact_email')->value('value')
            ?? 'bruno.kay2304@gmail.com';

        return Inertia::render('Home', [
            'trustedCompanies' => $companies,
            'projects' => $projects,
            'services' => $services,
            'products' => $products,
            'siteSettings' => [
                'whatsapp_url' => $whatsappUrl,
                'contact_email' => $contactEmail,
            ],
        ]);
    }
}
