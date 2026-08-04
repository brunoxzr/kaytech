<?php

namespace App\Http\Controllers;

use App\Models\KaytechProduct;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function show(string $slug): Response
    {
        $product = KaytechProduct::where('slug', $slug)->where('active', true)->firstOrFail();

        return Inertia::render('Products/Show', [
            'product' => $product,
        ]);
    }
}
