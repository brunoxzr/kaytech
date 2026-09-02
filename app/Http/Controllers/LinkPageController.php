<?php

namespace App\Http\Controllers;

use App\Models\Link;
use App\Models\LinkPageSetting;
use App\Models\CareerMilestone;
use App\Models\Project;
use App\Models\Achievement;
use App\Models\Testimonial;
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
        $locale = app()->getLocale();

        return Inertia::render('BrunoKay', [
            'links' => Link::where('group', 'brunokay')
                ->where('active', true)
                ->orderBy('order')
                ->get(),
            'settings' => LinkPageSetting::firstOrCreate(['group' => 'brunokay']),
            'milestones' => CareerMilestone::orderBy('order')->get(),
            'projects' => Project::with('translations')
                ->where('show_on_bruno_profile', true)
                ->orderBy('order')
                ->get()
                ->map(fn ($p) => $p->toArrayWithLocale($locale)),
            'achievements' => Achievement::orderBy('order')->get(),
            'testimonials' => Testimonial::orderBy('order')->get(),
        ]);
    }
}
