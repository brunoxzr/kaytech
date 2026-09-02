<?php

namespace App\Http\Controllers;

use App\Models\ContactLead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BrunoContactController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        ContactLead::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'subject' => $data['subject'] ?? null,
            'message' => $data['message'],
            'project_type' => 'Contato pessoal',
            'status' => 'new',
            'source' => 'brunokay',
        ]);

        return redirect()->back()->with('success', 'Mensagem enviada com sucesso!');
    }
}
