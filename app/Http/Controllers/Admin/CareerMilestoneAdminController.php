<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareerMilestone;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CareerMilestoneAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/CareerMilestones', [
            'milestones' => CareerMilestone::orderBy('order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'year' => 'required|string|max:20',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'technologies' => 'nullable|array',
            'technologies.*' => 'string|max:100',
            'icon_name' => 'nullable|string|max:100',
            'order' => 'integer',
        ]);

        CareerMilestone::create($data);

        return redirect()->back()->with('success', 'Marco de carreira cadastrado com sucesso!');
    }

    public function update(Request $request, CareerMilestone $careerMilestone)
    {
        $data = $request->validate([
            'year' => 'required|string|max:20',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'technologies' => 'nullable|array',
            'technologies.*' => 'string|max:100',
            'icon_name' => 'nullable|string|max:100',
            'order' => 'integer',
        ]);

        $careerMilestone->update($data);

        return redirect()->back()->with('success', 'Marco de carreira atualizado.');
    }

    public function destroy(CareerMilestone $careerMilestone)
    {
        $careerMilestone->delete();
        return redirect()->back()->with('success', 'Marco de carreira removido.');
    }
}
