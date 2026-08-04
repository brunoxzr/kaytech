<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShortLink;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShortLinkAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/ShortLinks', [
            'shortLinks' => ShortLink::orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'slug' => 'required|string|max:100|alpha_dash|unique:short_links,slug',
            'destination_url' => 'required|url|max:2048',
        ]);

        ShortLink::create($data);

        return redirect()->back()->with('success', 'Link curto criado com sucesso!');
    }

    public function update(Request $request, ShortLink $shortLink)
    {
        $data = $request->validate([
            'slug' => 'required|string|max:100|alpha_dash|unique:short_links,slug,' . $shortLink->id,
            'destination_url' => 'required|url|max:2048',
        ]);

        $shortLink->update($data);

        return redirect()->back()->with('success', 'Link curto atualizado.');
    }

    public function destroy(ShortLink $shortLink)
    {
        $shortLink->delete();
        return redirect()->back()->with('success', 'Link curto removido.');
    }
}
