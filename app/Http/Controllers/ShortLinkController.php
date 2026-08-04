<?php

namespace App\Http\Controllers;

use App\Models\ShortLink;
use Illuminate\Http\RedirectResponse;

class ShortLinkController extends Controller
{
    public function redirect(string $slug): RedirectResponse
    {
        $shortLink = ShortLink::where('slug', $slug)->firstOrFail();
        $shortLink->increment('clicks');

        return redirect()->away($shortLink->destination_url);
    }
}
