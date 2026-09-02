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
            'role_tagline' => 'nullable|string|max:255',
            'hero_title' => 'nullable|string|max:255',
            'hero_description' => 'nullable|string',
            'bio' => 'nullable|string',
            'stat_1_value' => 'nullable|string|max:50',
            'stat_1_label' => 'nullable|string|max:100',
            'stat_2_value' => 'nullable|string|max:50',
            'stat_2_label' => 'nullable|string|max:100',
            'stat_3_value' => 'nullable|string|max:50',
            'stat_3_label' => 'nullable|string|max:100',
            'whatsapp_url' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
        ]);

        LinkPageSetting::updateOrCreate(['group' => $group], $data);

        return redirect()->back()->with('success', 'Aparência da página atualizada.');
    }
}
