<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectTranslation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class ProjectAdminController extends Controller
{
    public function index(): Response
    {
        $projects = Project::with('translations')->orderBy('order')->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'cover' => $p->cover,
                'technologies' => $p->technologies,
                'featured' => (bool)$p->featured,
                'order' => $p->order,
                'translations' => $p->translations->keyBy('locale')->toArray(),
            ];
        });

        return Inertia::render('Admin/Projects', [
            'projects' => $projects,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cover' => 'required|string',
            'technologies' => 'required|array',
            'project_url' => 'nullable|string',
            'featured' => 'boolean',
            'order' => 'integer',
            'translations' => 'required|array',
            'translations.pt-BR.title' => 'required|string',
            'translations.pt-BR.category' => 'required|string',
            'translations.pt-BR.summary' => 'required|string',
        ]);

        $project = Project::create([
            'cover' => $data['cover'],
            'technologies' => $data['technologies'],
            'project_url' => $data['project_url'] ?? null,
            'featured' => $data['featured'] ?? false,
            'order' => $data['order'] ?? 0,
        ]);

        foreach (['pt-BR', 'en', 'es'] as $locale) {
            if (isset($data['translations'][$locale]['title'])) {
                $t = $data['translations'][$locale];
                ProjectTranslation::create([
                    'project_id' => $project->id,
                    'locale' => $locale,
                    'title' => $t['title'],
                    'category' => $t['category'] ?? ($data['translations']['pt-BR']['category'] ?? 'Geral'),
                    'summary' => $t['summary'] ?? ($data['translations']['pt-BR']['summary'] ?? ''),
                    'challenge' => $t['challenge'] ?? null,
                    'solution' => $t['solution'] ?? null,
                    'slug' => Str::slug($t['title'] ?: 'project-' . $project->id),
                    'translation_status' => $t['translation_status'] ?? ($locale === 'pt-BR' ? 'published' : 'draft'),
                ]);
            }
        }

        return redirect()->back()->with('success', 'Projeto cadastrado com sucesso!');
    }

    public function update(Request $request, Project $project)
    {
        $data = $request->validate([
            'cover' => 'required|string',
            'technologies' => 'required|array',
            'project_url' => 'nullable|string',
            'featured' => 'boolean',
            'order' => 'integer',
            'translations' => 'required|array',
        ]);

        $project->update([
            'cover' => $data['cover'],
            'technologies' => $data['technologies'],
            'project_url' => $data['project_url'] ?? null,
            'featured' => $data['featured'] ?? false,
            'order' => $data['order'] ?? 0,
        ]);

        foreach (['pt-BR', 'en', 'es'] as $locale) {
            if (isset($data['translations'][$locale]['title'])) {
                $t = $data['translations'][$locale];
                ProjectTranslation::updateOrCreate(
                    [
                        'project_id' => $project->id,
                        'locale' => $locale,
                    ],
                    [
                        'title' => $t['title'],
                        'category' => $t['category'] ?? '',
                        'summary' => $t['summary'] ?? '',
                        'challenge' => $t['challenge'] ?? null,
                        'solution' => $t['solution'] ?? null,
                        'slug' => $t['slug'] ?? Str::slug($t['title']),
                        'translation_status' => $t['translation_status'] ?? 'published',
                    ]
                );
            }
        }

        return redirect()->back()->with('success', 'Projeto atualizado com sucesso!');
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return redirect()->back()->with('success', 'Projeto excluído.');
    }
}
