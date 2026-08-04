<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectTranslation;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function show(Request $request, string $locale, string $slug = null): Response
    {
        // Handle routes with or without explicit locale parameter
        if ($slug === null) {
            $slug = $locale;
            $locale = app()->getLocale();
        }

        $translation = ProjectTranslation::where('slug', $slug)->first();

        if (!$translation) {
            // Fallback search by slug across all translations
            $translation = ProjectTranslation::where('slug', 'LIKE', "%{$slug}%")->firstOrFail();
        }

        $project = Project::with('translations')->findOrFail($translation->project_id);
        $projectData = $project->toArrayWithLocale($locale);

        $otherProjects = Project::with('translations')
            ->where('id', '!=', $project->id)
            ->orderBy('order')
            ->get()
            ->map(fn ($p) => $p->toArrayWithLocale($locale));

        return Inertia::render('Projects/Show', [
            'project' => $projectData,
            'relatedProjects' => $otherProjects,
        ]);
    }
}
