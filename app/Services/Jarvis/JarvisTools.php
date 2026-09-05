<?php

namespace App\Services\Jarvis;

use App\Models\Client;
use App\Models\ClientNote;
use App\Models\ContactLead;
use App\Models\FinancialAccount;
use App\Models\FinancialCategory;
use App\Models\FinancialTransaction;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Ferramentas pré-definidas do Jarvis (admin). O modelo só escolhe qual chamar;
 * nunca gera SQL. Ações de escrita são registradas em log.
 */
class JarvisTools
{
    /** Ferramentas que um usuário 'finance' pode usar. */
    private const FINANCE_TOOLS = [
        'saldo_contas', 'resumo_mes', 'total_levantado', 'ultimos_lancamentos',
        'gastos_por_categoria', 'criar_lancamento',
    ];

    /** Declarações no formato function_declarations do Gemini. $scope: 'all' | 'finance'. */
    public static function declarations(string $scope = 'all'): array
    {
        $decls = self::allDeclarations()[0]['function_declarations'];

        if ($scope === 'finance') {
            $decls = array_values(array_filter($decls, fn ($d) => in_array($d['name'], self::FINANCE_TOOLS, true)));
        }

        return [['function_declarations' => $decls]];
    }

    private static function allDeclarations(): array
    {
        return [[
            'function_declarations' => [
                // ---------- LEITURA ----------
                [
                    'name' => 'saldo_contas',
                    'description' => 'Saldo atual de cada conta financeira e o total consolidado. Use para "quanto tenho hoje".',
                    'parameters' => ['type' => 'object', 'properties' => (object) []],
                ],
                [
                    'name' => 'resumo_mes',
                    'description' => 'Entradas, saídas, resultado, a pagar e a receber de um mês.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'ano' => ['type' => 'integer', 'description' => 'Ano; padrão: ano atual'],
                            'mes' => ['type' => 'integer', 'description' => '1-12; padrão: mês atual'],
                        ],
                    ],
                ],
                [
                    'name' => 'total_levantado',
                    'description' => 'Soma de todas as entradas já recebidas no histórico (exclui ajustes de saldo).',
                    'parameters' => ['type' => 'object', 'properties' => (object) []],
                ],
                [
                    'name' => 'ultimos_lancamentos',
                    'description' => 'Últimos lançamentos financeiros.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => ['limite' => ['type' => 'integer', 'description' => 'Padrão 10, máx 30']],
                    ],
                ],
                [
                    'name' => 'gastos_por_categoria',
                    'description' => 'Total gasto por categoria num mês.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'ano' => ['type' => 'integer'],
                            'mes' => ['type' => 'integer'],
                        ],
                    ],
                ],
                [
                    'name' => 'pipeline_clientes',
                    'description' => 'Quantidade e valor de clientes por status do CRM (prospect, contacted, proposal, won, lost).',
                    'parameters' => ['type' => 'object', 'properties' => (object) []],
                ],
                [
                    'name' => 'followups_pendentes',
                    'description' => 'Próximos follow-ups de clientes (com data), marcando os atrasados.',
                    'parameters' => ['type' => 'object', 'properties' => (object) []],
                ],
                [
                    'name' => 'leads_recentes',
                    'description' => 'Últimos leads recebidos pelo formulário/chatbot do site.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => ['limite' => ['type' => 'integer', 'description' => 'Padrão 10']],
                    ],
                ],
                [
                    'name' => 'contar_registros',
                    'description' => 'Contagem simples de uma entidade: projetos, clientes, leads, contas.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'entidade' => ['type' => 'string', 'enum' => ['projetos', 'clientes', 'leads', 'contas']],
                        ],
                        'required' => ['entidade'],
                    ],
                ],

                // ---------- ESCRITA ----------
                [
                    'name' => 'criar_lancamento',
                    'description' => 'Cria um lançamento financeiro (entrada ou saída) numa conta.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'tipo' => ['type' => 'string', 'enum' => ['income', 'expense']],
                            'valor' => ['type' => 'number', 'description' => 'Em reais, ex 150.00'],
                            'descricao' => ['type' => 'string'],
                            'conta' => ['type' => 'string', 'description' => 'Nome da conta; se omitido usa a primeira'],
                            'categoria' => ['type' => 'string', 'description' => 'Nome da categoria (opcional)'],
                            'data' => ['type' => 'string', 'description' => 'AAAA-MM-DD; padrão hoje'],
                            'pago' => ['type' => 'boolean', 'description' => 'Padrão true'],
                        ],
                        'required' => ['tipo', 'valor', 'descricao'],
                    ],
                ],
                [
                    'name' => 'mudar_status_cliente',
                    'description' => 'Altera o status de um cliente no pipeline.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'cliente' => ['type' => 'string', 'description' => 'Nome do cliente'],
                            'status' => ['type' => 'string', 'enum' => ['prospect', 'contacted', 'proposal', 'won', 'lost']],
                        ],
                        'required' => ['cliente', 'status'],
                    ],
                ],
                [
                    'name' => 'anotar_cliente',
                    'description' => 'Adiciona uma anotação (timeline) a um cliente.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'cliente' => ['type' => 'string'],
                            'texto' => ['type' => 'string'],
                        ],
                        'required' => ['cliente', 'texto'],
                    ],
                ],
                [
                    'name' => 'prospectar_leads',
                    'description' => 'Busca no Google empresas de um nicho numa cidade, priorizando as que não têm site próprio (bons alvos para vender landing page). Retorna nome, telefone, endereço, instagram e situação do site.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'cidade' => ['type' => 'string'],
                            'nicho' => ['type' => 'string', 'description' => 'ex: padaria, barbearia, clínica odontológica'],
                            'quantidade' => ['type' => 'integer', 'description' => 'Padrão 12, máx 20'],
                        ],
                        'required' => ['cidade', 'nicho'],
                    ],
                ],
                [
                    'name' => 'enviar_whatsapp',
                    'description' => 'Envia uma mensagem de WhatsApp pelo número do Bruno (via Evolution API). Use só quando o senhor pedir explicitamente para mandar mensagem para alguém.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'numero' => ['type' => 'string', 'description' => 'Telefone com DDD, com ou sem +55'],
                            'mensagem' => ['type' => 'string'],
                        ],
                        'required' => ['numero', 'mensagem'],
                    ],
                ],
            ],
        ]];
    }

    /** Executa a tool escolhida pelo modelo. Retorna array serializável. */
    public static function run(string $name, array $args): array
    {
        return match ($name) {
            'saldo_contas' => self::saldoContas(),
            'resumo_mes' => self::resumoMes($args),
            'total_levantado' => self::totalLevantado(),
            'ultimos_lancamentos' => self::ultimosLancamentos($args),
            'gastos_por_categoria' => self::gastosPorCategoria($args),
            'pipeline_clientes' => self::pipelineClientes(),
            'followups_pendentes' => self::followupsPendentes(),
            'leads_recentes' => self::leadsRecentes($args),
            'contar_registros' => self::contarRegistros($args),
            'criar_lancamento' => self::criarLancamento($args),
            'mudar_status_cliente' => self::mudarStatusCliente($args),
            'anotar_cliente' => self::anotarCliente($args),
            'prospectar_leads' => self::prospectarLeads($args),
            'enviar_whatsapp' => self::enviarWhatsapp($args),
            default => ['erro' => "Ferramenta desconhecida: {$name}"],
        };
    }

    /* ================= LEITURA ================= */

    private static function money(int $cents): string
    {
        return 'R$ ' . number_format($cents / 100, 2, ',', '.');
    }

    private static function saldoContas(): array
    {
        $contas = FinancialAccount::where('archived', false)->orderBy('order')->get()
            ->map(fn ($a) => ['conta' => $a->name, 'tipo' => $a->type, 'saldo' => self::money($a->current_balance), 'saldo_centavos' => $a->current_balance]);

        return [
            'contas' => $contas,
            'total_consolidado' => self::money((int) $contas->sum('saldo_centavos')),
        ];
    }

    private static function ref(array $args): array
    {
        $now = Carbon::now();
        return [(int) ($args['ano'] ?? $now->year), (int) ($args['mes'] ?? $now->month)];
    }

    private static function resumoMes(array $args): array
    {
        [$y, $m] = self::ref($args);
        $rows = FinancialTransaction::whereYear('date', $y)->whereMonth('date', $m)->get();
        $inPaid = (int) $rows->where('type', 'income')->where('paid', true)->sum('amount');
        $outPaid = (int) $rows->where('type', 'expense')->where('paid', true)->sum('amount');

        return [
            'mes' => sprintf('%02d/%d', $m, $y),
            'entradas' => self::money($inPaid),
            'saidas' => self::money($outPaid),
            'resultado' => self::money($inPaid - $outPaid),
            'a_pagar' => self::money((int) FinancialTransaction::where('paid', false)->where('type', 'expense')->sum('amount')),
            'a_receber' => self::money((int) FinancialTransaction::where('paid', false)->where('type', 'income')->sum('amount')),
        ];
    }

    private static function totalLevantado(): array
    {
        $adjust = FinancialCategory::where('name', 'Ajuste de saldo')->pluck('id');
        $total = (int) FinancialTransaction::where('type', 'income')->where('paid', true)
            ->whereNotIn('category_id', $adjust)->sum('amount');

        return ['total_levantado' => self::money($total)];
    }

    private static function ultimosLancamentos(array $args): array
    {
        $limite = min(30, max(1, (int) ($args['limite'] ?? 10)));

        return ['lancamentos' => FinancialTransaction::with(['account', 'category'])
            ->orderByDesc('date')->orderByDesc('id')->limit($limite)->get()
            ->map(fn ($t) => [
                'data' => $t->date->toDateString(),
                'tipo' => $t->type,
                'valor' => self::money($t->amount),
                'descricao' => $t->description,
                'conta' => $t->account?->name,
                'categoria' => $t->category?->name,
                'pago' => $t->paid,
            ])];
    }

    private static function gastosPorCategoria(array $args): array
    {
        [$y, $m] = self::ref($args);
        $rows = FinancialTransaction::whereYear('date', $y)->whereMonth('date', $m)
            ->where('type', 'expense')->where('paid', true)->whereNotNull('category_id')
            ->get()->groupBy('category_id');

        $out = [];
        foreach ($rows as $catId => $group) {
            $out[] = [
                'categoria' => FinancialCategory::find($catId)?->name ?? '—',
                'total' => self::money((int) $group->sum('amount')),
            ];
        }
        usort($out, fn ($a, $b) => strcmp($b['total'], $a['total']));

        return ['mes' => sprintf('%02d/%d', $m, $y), 'gastos' => $out];
    }

    private static function pipelineClientes(): array
    {
        $out = [];
        foreach (Client::STATUSES as $s) {
            $q = Client::where('status', $s);
            $out[$s] = ['quantidade' => $q->count(), 'valor_total' => self::money((int) $q->sum('deal_value'))];
        }
        return ['pipeline' => $out];
    }

    private static function followupsPendentes(): array
    {
        return ['followups' => Client::whereNotNull('next_action_at')
            ->whereIn('status', ['prospect', 'contacted', 'proposal'])
            ->orderBy('next_action_at')->limit(15)->get()
            ->map(fn ($c) => [
                'cliente' => $c->name,
                'empresa' => $c->company,
                'acao' => $c->next_action,
                'data' => $c->next_action_at?->toDateString(),
                'atrasado' => $c->next_action_at && $c->next_action_at->isPast() && ! $c->next_action_at->isToday(),
            ])];
    }

    private static function leadsRecentes(array $args): array
    {
        $limite = min(30, max(1, (int) ($args['limite'] ?? 10)));

        return ['leads' => ContactLead::latest()->limit($limite)->get()
            ->map(fn ($l) => [
                'nome' => $l->name, 'email' => $l->email,
                'tipo' => $l->project_type, 'status' => $l->status,
                'mensagem' => $l->message, 'quando' => $l->created_at?->toDateTimeString(),
            ])];
    }

    private static function contarRegistros(array $args): array
    {
        $map = [
            'projetos' => Project::class,
            'clientes' => Client::class,
            'leads' => ContactLead::class,
            'contas' => FinancialAccount::class,
        ];
        $model = $map[$args['entidade'] ?? ''] ?? null;
        if (! $model) {
            return ['erro' => 'Entidade inválida.'];
        }

        return ['entidade' => $args['entidade'], 'total' => $model::count()];
    }

    /* ================= ESCRITA ================= */

    private static function criarLancamento(array $args): array
    {
        $conta = isset($args['conta'])
            ? FinancialAccount::where('name', 'like', '%' . $args['conta'] . '%')->first()
            : FinancialAccount::orderBy('order')->first();

        if (! $conta) {
            return ['erro' => 'Nenhuma conta encontrada.'];
        }

        $categoria = null;
        if (! empty($args['categoria'])) {
            $categoria = FinancialCategory::where('name', 'like', '%' . $args['categoria'] . '%')
                ->where('type', $args['tipo'])->first();
        }

        $tx = FinancialTransaction::create([
            'account_id' => $conta->id,
            'category_id' => $categoria?->id,
            'type' => $args['tipo'],
            'amount' => (int) round(((float) $args['valor']) * 100),
            'description' => $args['descricao'],
            'notes' => 'Criado pelo Jarvis',
            'date' => $args['data'] ?? now()->toDateString(),
            'paid' => $args['pago'] ?? true,
        ]);

        Log::info('[Jarvis] criar_lancamento', ['user' => auth()->id(), 'tx' => $tx->id, 'args' => $args]);

        return ['ok' => true, 'lancamento_id' => $tx->id, 'conta' => $conta->name, 'valor' => self::money($tx->amount)];
    }

    private static function mudarStatusCliente(array $args): array
    {
        $cliente = Client::where('name', 'like', '%' . $args['cliente'] . '%')->first();
        if (! $cliente) {
            return ['erro' => "Cliente \"{$args['cliente']}\" não encontrado."];
        }

        $old = $cliente->status;
        $cliente->update(['status' => $args['status']]);
        if ($old !== $args['status']) {
            $cliente->notes()->create(['body' => "Status alterado de \"{$old}\" para \"{$args['status']}\" (via Jarvis).", 'kind' => 'status_change']);
        }

        Log::info('[Jarvis] mudar_status_cliente', ['user' => auth()->id(), 'client' => $cliente->id, 'de' => $old, 'para' => $args['status']]);

        return ['ok' => true, 'cliente' => $cliente->name, 'status' => $cliente->status];
    }

    private static function anotarCliente(array $args): array
    {
        $cliente = Client::where('name', 'like', '%' . $args['cliente'] . '%')->first();
        if (! $cliente) {
            return ['erro' => "Cliente \"{$args['cliente']}\" não encontrado."];
        }

        $note = $cliente->notes()->create(['body' => $args['texto'], 'kind' => 'note']);
        Log::info('[Jarvis] anotar_cliente', ['user' => auth()->id(), 'client' => $cliente->id, 'note' => $note->id]);

        return ['ok' => true, 'cliente' => $cliente->name];
    }

    private static function prospectarLeads(array $args): array
    {
        try {
            $result = app(\App\Services\Prospector\ProspectorService::class)->search(
                (string) ($args['cidade'] ?? ''),
                (string) ($args['nicho'] ?? ''),
                (int) ($args['quantidade'] ?? 12),
            );

            Log::info('[Jarvis] prospectar_leads', ['user' => auth()->id(), 'args' => $args, 'n' => count($result['leads'])]);

            return [
                'total' => count($result['leads']),
                'leads' => $result['leads'],
                'obs' => $result['note'] ?? 'Confirme telefone/Instagram antes de contatar. Veja a lista completa em /admin/prospeccao.',
            ];
        } catch (\Throwable $e) {
            return ['erro' => $e->getMessage()];
        }
    }

    private static function enviarWhatsapp(array $args): array
    {
        $digits = preg_replace('/\D/', '', (string) ($args['numero'] ?? ''));
        $msg = trim((string) ($args['mensagem'] ?? ''));
        if (strlen($digits) < 10 || $msg === '') {
            return ['erro' => 'Número ou mensagem inválidos.'];
        }
        if (strlen($digits) <= 11) {
            $digits = '55' . $digits;
        }

        try {
            $wamid = app(\App\Services\WhatsApp\EvolutionClient::class)->sendText($digits, $msg);

            $jid = $digits . '@s.whatsapp.net';
            $chat = \App\Models\WaChat::firstOrCreate(['remote_jid' => $jid], ['phone' => $digits, 'is_group' => false]);
            $chat->messages()->create([
                'wamid' => $wamid, 'from_me' => true, 'type' => 'text',
                'body' => $msg, 'status' => 'sent', 'sent_at' => now(),
            ]);
            $chat->update(['last_message' => $msg, 'last_message_at' => now()]);

            Log::info('[Jarvis] enviar_whatsapp', ['user' => auth()->id(), 'to' => $digits]);

            return ['ok' => true, 'para' => $digits];
        } catch (\Throwable $e) {
            return ['erro' => $e->getMessage()];
        }
    }
}
