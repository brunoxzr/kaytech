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
            'existingNames' => Client::pluck('name')->map(fn ($n) => mb_strtolower($n))->values(),
            // Nichos que mais convertem em landing page / site — priorizados no topo.
            'niches' => [
                'Dentista / clínica odontológica',
                'Advogado / escritório de advocacia',
                'Barbearia',
                'Clínica de estética / harmonização facial',
                'Nutricionista',
                'Psicólogo / clínica de psicologia',
                'Academia / studio de treino',
                'Salão de beleza',
                'Arquiteto / escritório de arquitetura',
                'Imobiliária / corretor de imóveis',
                'Pet shop / clínica veterinária',
                'Fisioterapeuta / pilates',
                'Contador / escritório de contabilidade',
                'Oficina mecânica / funilaria',
                'Restaurante',
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

            $result = (new ProspectorService())->search($city, $niche, $limit);

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('[Prospector] ' . $e->getMessage(), ['file' => $e->getFile(), 'line' => $e->getLine()]);

            $m = $e->getMessage();
            $msg = str_contains($m, 'APIFY_TOKEN')
                ? 'Configure o APIFY_TOKEN no servidor.'
                : (str_contains($m, '402') || str_contains($m, 'usage limit')
                    ? 'Crédito do Apify esgotado neste mês.'
                    : 'Não foi possível concluir a busca agora. Tente de novo em instantes.');

            return response()->json(['leads' => [], 'sources' => [], 'note' => $msg], 200);
        }
    }

    /** Salva um resultado da prospecção como cliente no CRM. */
    public function saveClient(Request $request)
    {
        $d = $request->all();
        $nome = trim((string) ($d['nome'] ?? ''));
        if ($nome === '') {
            return back()->with('error', 'Lead sem nome.');
        }

        // não duplica: mesmo nome já no pipeline
        if (Client::where('name', $nome)->exists()) {
            return back()->with('error', "“{$nome}” já está no pipeline.");
        }

        Client::create([
            'name' => $nome,
            'company' => $nome,
            'phone' => ($d['whatsapp'] ?? '') ?: ($d['telefone'] ?? '') ?: null,
            'status' => 'lead',
            'source' => 'Prospecção Google Maps',
            'tags' => array_values(array_filter(['Prospecção', $d['niche'] ?? null, $d['city'] ?? null])),
            'deal_value' => 0,
            'order' => Client::where('status', 'lead')->max('order') + 1,
        ])->notes()->create([
            'kind' => 'note',
            'body' => trim(implode("\n", array_filter([
                $d['resumo'] ?? null,
                ! empty($d['endereco']) ? 'Endereço: ' . $d['endereco'] : null,
                ! empty($d['telefone']) ? 'Telefone: ' . $d['telefone'] : null,
                ! empty($d['instagram']) ? 'Instagram: ' . $d['instagram'] : null,
                isset($d['avaliacoes']) ? "Google: {$d['avaliacoes']} avaliações" . (isset($d['nota']) ? " · nota {$d['nota']}" : '') : null,
                ! empty($d['site']) ? 'Site: ' . $d['site'] : 'Sem site próprio — bom alvo para landing page.',
                ! empty($d['maps_url']) ? 'Maps: ' . $d['maps_url'] : null,
            ]))),
        ]);

        return back()->with('success', "“{$nome}” adicionado ao CRM como prospect.");
    }
}
