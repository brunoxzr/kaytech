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
        try {
            $city = trim((string) $request->input('city', ''));
            $niche = trim((string) $request->input('niche', ''));
            $limit = (int) $request->input('limit', 15);

            if ($city === '' || $niche === '') {
                return response()->json(['leads' => [], 'sources' => [], 'note' => 'Informe cidade e nicho.'], 200);
            }

            $result = app(ProspectorService::class)->search($city, $niche, $limit);

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('[Prospector] ' . $e->getMessage());

            $msg = str_contains($e->getMessage(), '429') || str_contains($e->getMessage(), 'RESOURCE_EXHAUSTED')
                ? 'Cota da IA atingida por agora. Tente novamente daqui a pouco.'
                : (str_contains($e->getMessage(), '503') || str_contains($e->getMessage(), 'UNAVAILABLE')
                    ? 'A IA está sobrecarregada. Tente de novo em alguns segundos.'
                    : 'Não foi possível concluir a busca agora.');

            return response()->json(['leads' => [], 'sources' => [], 'note' => $msg], 200);
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
