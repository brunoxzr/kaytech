<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AchievementAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Achievements', [
            'achievements' => Achievement::orderBy('order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'order' => 'integer',
        ]);

        Achievement::create($data);

        return redirect()->back()->with('success', 'Conquista cadastrada com sucesso!');
    }

    public function update(Request $request, Achievement $achievement)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'order' => 'integer',
        ]);

        $achievement->update($data);

        return redirect()->back()->with('success', 'Conquista atualizada.');
    }

    public function destroy(Achievement $achievement)
    {
        $achievement->delete();
        return redirect()->back()->with('success', 'Conquista removida.');
    }
}
