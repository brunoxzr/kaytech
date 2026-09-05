<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Services\Prospector\ProspectorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ProspectorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Prospector', [
            'niches' => [
                'Restaurante', 'Pizzaria', 'Padaria / confeitaria', 'Hamburgueria', 'Cafeteria',
                'Barbearia', 'Salão de beleza', 'Estética', 'Academia', 'Estúdio de pilates',
                'Clínica odontológica', 'Clínica médica', 'Petshop', 'Loja de roupas', 'Ótica',
                'Oficina mecânica', 'Autopeças', 'Imobiliária', 'Escritório de advocacia',
                'Escola de idiomas', 'Buffet / eventos',
            ],
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $data = $request->validate([
            'city' => 'required|string|max:120',
            'niche' => 'required|string|max:120',
            'limit' => 'nullable|integer|min:3|max:25',
        ]);

        try {
            $result = app(ProspectorService::class)->search(
                $data['city'],
                $data['niche'],
                $data['limit'] ?? 15,
            );

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('[Prospector] ' . $e->getMessage());

            return response()->json(['leads' => [], 'sources' => [], 'note' => 'Erro na busca: ' . $e->getMessage()], 200);
        }
    }

    /** Salva um resultado da prospecção como cliente no CRM. */
    public function saveClient(Request $request)
    {
        $data = $request->validate([
            'nome' => 'required|string|max:160',
            'telefone' => 'nullable|string|max:40',
            'whatsapp' => 'nullable|string|max:40',
            'endereco' => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255',
            'site' => 'nullable|string|max:255',
            'tem_site' => 'nullable|string|max:20',
            'resumo' => 'nullable|string|max:1000',
            'niche' => 'nullable|string|max:120',
            'city' => 'nullable|string|max:120',
        ]);

        Client::create([
            'name' => $data['nome'],
            'company' => $data['nome'],
            'phone' => $data['whatsapp'] ?: $data['telefone'] ?: null,
            'status' => 'prospect',
            'source' => 'Prospecção',
            'tags' => array_values(array_filter([$data['niche'] ?? null, $data['city'] ?? null])),
            'deal_value' => 0,
            'order' => Client::where('status', 'prospect')->max('order') + 1,
        ])->notes()->create([
            'kind' => 'note',
            'body' => trim(implode("\n", array_filter([
                $data['resumo'] ?? null,
                $data['endereco'] ? 'Endereço: ' . $data['endereco'] : null,
                $data['telefone'] ? 'Telefone: ' . $data['telefone'] : null,
                $data['instagram'] ? 'Instagram: ' . $data['instagram'] : null,
                $data['site'] ? 'Site: ' . $data['site'] : 'Sem site próprio.',
            ]))),
        ]);

        return back()->with('success', "“{$data['nome']}” adicionado ao CRM como prospect.");
    }
}
