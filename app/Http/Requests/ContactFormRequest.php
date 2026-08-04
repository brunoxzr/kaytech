<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'project_type' => ['required', 'string', 'max:100'],
            'budget_range' => ['nullable', 'string', 'max:100'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            'privacy' => ['required', 'accepted'],
            'website' => ['nullable', 'max:0'], // Honeypot field: must be empty!
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => __('validation.required', ['attribute' => 'nome']),
            'email.required' => __('validation.required', ['attribute' => 'e-mail']),
            'email.email' => __('validation.email', ['attribute' => 'e-mail']),
            'project_type.required' => __('validation.required', ['attribute' => 'tipo de projeto']),
            'message.required' => __('validation.required', ['attribute' => 'mensagem']),
            'message.min' => __('validation.min.string', ['attribute' => 'mensagem', 'min' => 10]),
            'privacy.accepted' => 'Você deve concordar com os termos de privacidade para enviar.',
            'website.max' => 'Tentativa de spam detectada.',
        ];
    }
}
