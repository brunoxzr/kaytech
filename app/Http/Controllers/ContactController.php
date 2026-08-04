<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactFormRequest;
use App\Models\ContactLead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(ContactFormRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $lead = ContactLead::create([
            'name' => $data['name'],
            'company' => $data['company'] ?? null,
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'project_type' => $data['project_type'],
            'budget_range' => $data['budget_range'] ?? null,
            'message' => $data['message'],
            'status' => 'new',
        ]);

        Log::info("Novo lead de contato registrado: #{$lead->id} - {$lead->email}");

        return redirect()->back()->with('success', __('contact.success_message'));
    }
}
