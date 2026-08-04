<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactLead;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeadAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Leads', [
            'leads' => ContactLead::latest()->get(),
        ]);
    }

    public function updateStatus(Request $request, ContactLead $lead)
    {
        $data = $request->validate([
            'status' => 'required|in:new,contacted,qualified,closed,archived',
        ]);

        $lead->update(['status' => $data['status']]);

        return redirect()->back()->with('success', 'Status do lead atualizado.');
    }
}
