<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LinkPageSetting;
use Illuminate\Http\Request;

class LinkPageSettingAdminController extends Controller
{
    public function update(Request $request, string $group)
    {
        if (!in_array($group, ['kaytech', 'brunokay'], true)) {
            abort(404);
        }

        $data = $request->validate([
            'background_color' => 'nullable|string|max:20',
            'background_image' => 'nullable|string|max:255',
            'profile_image' => 'nullable|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
        ]);

        LinkPageSetting::updateOrCreate(['group' => $group], $data);

        return redirect()->back()->with('success', 'Aparência da página atualizada.');
    }
}
