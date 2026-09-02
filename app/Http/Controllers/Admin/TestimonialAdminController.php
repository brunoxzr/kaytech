<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Testimonials', [
            'testimonials' => Testimonial::orderBy('order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'author_name' => 'required|string|max:255',
            'author_role' => 'required|string|max:255',
            'quote' => 'required|string',
            'photo' => 'nullable|string|max:255',
            'order' => 'integer',
        ]);

        Testimonial::create($data);

        return redirect()->back()->with('success', 'Depoimento cadastrado com sucesso!');
    }

    public function update(Request $request, Testimonial $testimonial)
    {
        $data = $request->validate([
            'author_name' => 'required|string|max:255',
            'author_role' => 'required|string|max:255',
            'quote' => 'required|string',
            'photo' => 'nullable|string|max:255',
            'order' => 'integer',
        ]);

        $testimonial->update($data);

        return redirect()->back()->with('success', 'Depoimento atualizado.');
    }

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->delete();
        return redirect()->back()->with('success', 'Depoimento removido.');
    }
}
