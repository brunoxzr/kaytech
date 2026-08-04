<?php

namespace App\Http\Controllers;

use App\Models\Link;
use App\Models\LinkPageSetting;
use Inertia\Inertia;
use Inertia\Response;

class LinkPageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('LinkPage', [
            'links' => Link::where('group', 'kaytech')
                ->where('active', true)
                ->orderBy('order')
                ->get(),
            'settings' => LinkPageSetting::firstOrCreate(['group' => 'kaytech']),
        ]);
    }

    public function brunokay(): Response
    {
        return Inertia::render('BrunoKay', [
            'links' => Link::where('group', 'brunokay')
                ->where('active', true)
                ->orderBy('order')
                ->get(),
            'settings' => LinkPageSetting::firstOrCreate(['group' => 'brunokay']),
        ]);
    }
}
