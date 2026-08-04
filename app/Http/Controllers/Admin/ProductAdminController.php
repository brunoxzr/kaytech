<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KaytechProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Products', [
            'products' => KaytechProduct::orderBy('order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'description' => 'required|string',
            'cover' => 'required|string',
            'access_url' => 'nullable|string|max:2048',
            'background_color' => 'nullable|string|max:20',
            'background_image' => 'nullable|string|max:255',
            'order' => 'integer',
            'active' => 'boolean',
        ]);

        $data['slug'] = $this->uniqueSlug($data['name']);

        KaytechProduct::create($data);

        return redirect()->back()->with('success', 'Produto cadastrado com sucesso!');
    }

    public function update(Request $request, KaytechProduct $product)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'description' => 'required|string',
            'cover' => 'required|string',
            'access_url' => 'nullable|string|max:2048',
            'background_color' => 'nullable|string|max:20',
            'background_image' => 'nullable|string|max:255',
            'order' => 'integer',
            'active' => 'boolean',
        ]);

        if ($data['name'] !== $product->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
        }

        $product->update($data);

        return redirect()->back()->with('success', 'Produto atualizado.');
    }

    public function destroy(KaytechProduct $product)
    {
        $product->delete();
        return redirect()->back()->with('success', 'Produto removido.');
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;

        while (
            KaytechProduct::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-" . ++$i;
        }

        return $slug;
    }
}
