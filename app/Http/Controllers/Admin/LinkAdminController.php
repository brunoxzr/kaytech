<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Link;
use App\Models\LinkPageSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LinkAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Links', [
            'links' => Link::orderBy('group')->orderBy('order')->get(),
            'settings' => [
                'kaytech' => LinkPageSetting::firstOrCreate(['group' => 'kaytech']),
                'brunokay' => LinkPageSetting::firstOrCreate(['group' => 'brunokay']),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'group' => 'required|in:kaytech,brunokay',
            'title' => 'required|string|max:255',
            'url' => 'required|string|max:2048',
            'icon_name' => 'nullable|string|max:100',
            'icon_image' => 'nullable|string|max:255',
            'order' => 'integer',
            'active' => 'boolean',
        ]);

        Link::create($data);

        return redirect()->back()->with('success', 'Link cadastrado com sucesso!');
    }

    public function update(Request $request, Link $link)
    {
        $data = $request->validate([
            'group' => 'required|in:kaytech,brunokay',
            'title' => 'required|string|max:255',
            'url' => 'required|string|max:2048',
            'icon_name' => 'nullable|string|max:100',
            'icon_image' => 'nullable|string|max:255',
            'order' => 'integer',
            'active' => 'boolean',
        ]);

        $link->update($data);

        return redirect()->back()->with('success', 'Link atualizado.');
    }

    public function destroy(Link $link)
    {
        $link->delete();
        return redirect()->back()->with('success', 'Link removido.');
    }
}
