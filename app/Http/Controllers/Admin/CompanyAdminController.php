<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TrustedCompany;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Companies', [
            'companies' => TrustedCompany::orderBy('order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'required|string',
            'url' => 'nullable|string',
            'order' => 'integer',
        ]);

        TrustedCompany::create($data);

        return redirect()->back()->with('success', 'Empresa cadastrada com sucesso!');
    }

    public function update(Request $request, TrustedCompany $company)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'required|string',
            'url' => 'nullable|string',
            'order' => 'integer',
        ]);

        $company->update($data);

        return redirect()->back()->with('success', 'Empresa atualizada.');
    }

    public function destroy(TrustedCompany $company)
    {
        $company->delete();
        return redirect()->back()->with('success', 'Empresa removida.');
    }
}
