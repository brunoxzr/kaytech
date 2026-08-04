<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingAdminController extends Controller
{
    public function index(): Response
    {
        $settings = SiteSetting::all()->pluck('value', 'key')->toArray();

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
            'driver' => config('translation.driver'),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'whatsapp_url' => 'required|string',
            'contact_email' => 'required|email',
        ]);

        foreach ($data as $key => $value) {
            SiteSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return redirect()->back()->with('success', 'Configurações atualizadas com sucesso!');
    }
}
