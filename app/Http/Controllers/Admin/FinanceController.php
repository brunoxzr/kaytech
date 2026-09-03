<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\FinancialAccount;
use App\Models\FinancialCategory;
use App\Models\FinancialGoal;
use App\Models\FinancialTransaction;
use App\Models\RecurringTransaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    /** Cria as categorias padrão para um usuário que ainda não tem nenhuma. */
    private function seedDefaultsFor(?int $ownerId): void
    {
        if (! $ownerId || FinancialCategory::where('owner_id', $ownerId)->exists()) {
            return;
        }

        $expenses = [
            ['Moradia', '#F59E0B'], ['Alimentação', '#EF4444'], ['Transporte', '#3B82F6'],
            ['Saúde', '#10B981'], ['Educação', '#8B5CF6'], ['Lazer', '#EC4899'],
            ['Assinaturas', '#6366F1'], ['Impostos e Taxas', '#64748B'],
            ['Investimentos', '#14B8A6'], ['Outros', '#6B7280'],
        ];
        $incomes = [
            ['Salário', '#22C55E'], ['Freelance / Projetos', '#10B981'],
            ['Rendimentos', '#3B82F6'], ['Reembolsos', '#A3E635'], ['Outros', '#6B7280'],
        ];

        foreach ($expenses as $i => [$name, $color]) {
            FinancialCategory::create(['owner_id' => $ownerId, 'name' => $name, 'type' => 'expense', 'color' => $color, 'order' => $i]);
        }
        foreach ($incomes as $i => [$name, $color]) {
            FinancialCategory::create(['owner_id' => $ownerId, 'name' => $name, 'type' => 'income', 'color' => $color, 'order' => $i]);
        }
    }

    /* ===================== DASHBOARD ===================== */

    public function dashboard(Request $request): Response
    {
        $this->seedDefaultsFor(auth()->id());

        $ref = $request->date
            ? Carbon::parse($request->date)->startOfMonth()
            : Carbon::now()->startOfMonth();

        $year = $ref->year;
        $month = $ref->month;

        $accounts = FinancialAccount::where('archived', false)->orderBy('order')->get();

        $monthTx = FinancialTransaction::inMonth($year, $month)->get();
        $income = $monthTx->where('type', 'income')->where('paid', true)->sum('amount');
        $expense = $monthTx->where('type', 'expense')->where('paid', true)->sum('amount');

        // Saldo consolidado = soma do saldo atual de cada conta ativa
        $totalBalance = (int) $accounts->sum(fn ($a) => $a->current_balance);

        // "Total levantado" = receitas pagas de verdade (exclui a categoria técnica "Ajuste de saldo")
        $adjustCatId = FinancialCategory::where('name', 'Ajuste de saldo')->pluck('id');
        $totalRaised = (int) FinancialTransaction::where('type', 'income')->where('paid', true)
            ->whereNotIn('category_id', $adjustCatId)
            ->sum('amount');

        $pendingPayable = FinancialTransaction::where('paid', false)->where('type', 'expense')->sum('amount');
        $pendingReceivable = FinancialTransaction::where('paid', false)->where('type', 'income')->sum('amount');
        $overdue = FinancialTransaction::where('paid', false)
            ->where('date', '<', Carbon::today())
            ->count();

        // Fluxo de caixa — últimos 6 meses
        $cashflow = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = $ref->copy()->subMonths($i);
            $rows = FinancialTransaction::inMonth($m->year, $m->month)->where('paid', true)->get();
            $cashflow[] = [
                'label' => $m->translatedFormat('M/y'),
                'income' => (int) $rows->where('type', 'income')->sum('amount'),
                'expense' => (int) $rows->where('type', 'expense')->sum('amount'),
            ];
        }

        // Evolução do saldo consolidado — últimos 12 meses (fim de cada mês)
        $openingSum = (int) $accounts->sum('opening_balance');
        $balanceTrend = [];
        for ($i = 11; $i >= 0; $i--) {
            $end = $ref->copy()->subMonths($i)->endOfMonth();
            $paidUntil = FinancialTransaction::where('paid', true)
                ->whereDate('date', '<=', $end->toDateString());
            $in = (int) (clone $paidUntil)->where('type', 'income')->sum('amount');
            $out = (int) (clone $paidUntil)->where('type', 'expense')->sum('amount');
            // transferências não mudam o consolidado
            $balanceTrend[] = [
                'label' => $end->translatedFormat('M/y'),
                'balance' => $openingSum + $in - $out,
            ];
        }

        // Gasto por categoria no mês
        $byCategory = FinancialTransaction::inMonth($year, $month)
            ->where('type', 'expense')->where('paid', true)
            ->whereNotNull('category_id')
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('category_id')
            ->get()
            ->map(function ($row) {
                $cat = FinancialCategory::find($row->category_id);
                return [
                    'name' => $cat?->name ?? 'Sem categoria',
                    'color' => $cat?->color ?? '#6B7280',
                    'total' => (int) $row->total,
                ];
            })
            ->sortByDesc('total')
            ->values();

        $recentTransactions = FinancialTransaction::with(['account', 'category'])
            ->orderByDesc('date')->orderByDesc('id')
            ->limit(8)->get();

        // Orçamento previsto vs realizado
        $budgets = Budget::with('category')
            ->where('year', $year)->where('month', $month)
            ->get()
            ->map(function ($b) use ($year, $month) {
                $spent = (int) FinancialTransaction::inMonth($year, $month)
                    ->where('type', 'expense')->where('paid', true)
                    ->where('category_id', $b->category_id)
                    ->sum('amount');
                return [
                    'category' => $b->category?->name,
                    'color' => $b->category?->color ?? '#6B7280',
                    'planned' => $b->amount,
                    'spent' => $spent,
                ];
            });

        return Inertia::render('Admin/Finance/Dashboard', [
            'refDate' => $ref->toDateString(),
            'summary' => [
                'totalBalance' => $totalBalance,
                'totalRaised' => $totalRaised,
                'income' => (int) $income,
                'expense' => (int) $expense,
                'net' => (int) ($income - $expense),
                'pendingPayable' => (int) $pendingPayable,
                'pendingReceivable' => (int) $pendingReceivable,
                'overdueCount' => $overdue,
            ],
            'accounts' => $accounts->map(fn ($a) => [
                'id' => $a->id, 'name' => $a->name, 'type' => $a->type,
                'color' => $a->color, 'balance' => $a->current_balance,
            ]),
            'cashflow' => $cashflow,
            'balanceTrend' => $balanceTrend,
            'byCategory' => $byCategory,
            'budgets' => $budgets,
            'goals' => FinancialGoal::with('account')->orderBy('achieved')->get()
                ->map(fn ($g) => array_merge($g->toArray(), ['current_amount' => $g->saved])),
            'recentTransactions' => $recentTransactions,
        ]);
    }

    /** Página única "Config" — contas, categorias, recorrências e orçamentos em abas. */
    public function config(Request $request): Response
    {
        $this->seedDefaultsFor(auth()->id());

        $ref = $request->date ? Carbon::parse($request->date) : Carbon::now();
        $year = $ref->year;
        $month = $ref->month;

        $budgetRows = FinancialCategory::where('type', 'expense')->orderBy('name')->get()->map(function ($cat) use ($year, $month) {
            $budget = Budget::where('category_id', $cat->id)->where('year', $year)->where('month', $month)->first();
            $spent = (int) FinancialTransaction::inMonth($year, $month)
                ->where('type', 'expense')->where('paid', true)
                ->where('category_id', $cat->id)->sum('amount');
            return [
                'category_id' => $cat->id,
                'category' => $cat->name,
                'color' => $cat->color,
                'planned' => $budget ? $budget->amount / 100 : 0,
                'spent' => $spent,
            ];
        });

        return Inertia::render('Admin/Finance/Config', [
            'accounts' => FinancialAccount::orderBy('order')->get()->map(fn ($a) => [
                'id' => $a->id, 'name' => $a->name, 'type' => $a->type,
                'institution' => $a->institution, 'color' => $a->color,
                'archived' => $a->archived, 'order' => $a->order,
                'opening_balance' => $a->opening_balance / 100,
                'balance' => $a->current_balance,
            ]),
            'categories' => FinancialCategory::with('children')
                ->whereNull('parent_id')->orderBy('type')->orderBy('order')->get(),
            'flatCategories' => FinancialCategory::orderBy('name')->get(['id', 'name', 'type']),
            'recurring' => RecurringTransaction::with(['account', 'category'])
                ->orderByDesc('active')->orderBy('day_of_month')->get()
                ->map(fn ($r) => array_merge($r->toArray(), ['amount' => $r->amount / 100])),
            'recurringAccounts' => FinancialAccount::orderBy('order')->get(['id', 'name', 'color']),
            'recurringCategories' => FinancialCategory::orderBy('name')->get(['id', 'name', 'type', 'color']),
            'budgetRefDate' => $ref->startOfMonth()->toDateString(),
            'budgetRows' => $budgetRows,
            'goals' => FinancialGoal::with('account')->orderBy('achieved')->orderBy('id')->get()
                ->map(fn ($g) => [
                    'id' => $g->id,
                    'name' => $g->name,
                    'target_amount' => $g->target_amount / 100,
                    'current_amount' => $g->current_amount / 100,
                    'saved' => $g->saved,
                    'account_id' => $g->account_id,
                    'account_name' => $g->account?->name,
                    'target_date' => $g->target_date?->toDateString(),
                    'color' => $g->color,
                    'achieved' => $g->achieved,
                ]),
            'goalAccounts' => FinancialAccount::where('archived', false)->orderBy('order')->get(['id', 'name'])
                ->map(fn ($a) => ['id' => $a->id, 'name' => $a->name, 'balance' => $a->current_balance]),
        ]);
    }

    /* ===================== TRANSACTIONS ===================== */

    public function transactions(Request $request): Response
    {
        $query = FinancialTransaction::with(['account', 'category', 'transferAccount']);

        if ($request->filled('account_id')) {
            $query->where('account_id', $request->account_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('status')) {
            $query->where('paid', $request->status === 'paid');
        }
        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->to);
        }
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('Admin/Finance/Transactions', [
            'transactions' => $query->orderByDesc('date')->orderByDesc('id')->paginate(30)->withQueryString(),
            'accounts' => FinancialAccount::orderBy('order')->get(['id', 'name', 'color']),
            'categories' => FinancialCategory::orderBy('name')->get(['id', 'name', 'type', 'color']),
            'filters' => $request->only(['account_id', 'type', 'status', 'from', 'to', 'search']),
        ]);
    }

    public function storeTransaction(Request $request)
    {
        $data = $this->validateTransaction($request);
        $tx = FinancialTransaction::create($data);

        // Opcional: transformar em recorrência mensal
        if ($request->boolean('recurs') && $data['type'] !== 'transfer') {
            $rec = $request->validate([
                'recur_day' => 'required|integer|min:0|max:31',   // 0 = último dia do mês
                'recur_until' => 'nullable|date|after:date',
            ]);

            $recurring = RecurringTransaction::create([
                'account_id' => $data['account_id'],
                'category_id' => $data['category_id'] ?? null,
                'type' => $data['type'],
                'amount' => $data['amount'],
                'description' => $data['description'],
                'frequency' => 'monthly',
                'day_of_month' => $rec['recur_day'],
                'starts_on' => $data['date'],
                'ends_on' => $rec['recur_until'] ?? null,
                'last_generated_on' => $data['date'], // este lançamento já cobre o mês atual
                'active' => true,
            ]);

            $tx->update(['recurring_id' => $recurring->id]);
        }

        return back()->with('success', 'Lançamento registrado.');
    }

    public function updateTransaction(Request $request, FinancialTransaction $transaction)
    {
        $transaction->update($this->validateTransaction($request));

        return back()->with('success', 'Lançamento atualizado.');
    }

    public function destroyTransaction(FinancialTransaction $transaction)
    {
        $transaction->delete();

        return back()->with('success', 'Lançamento removido.');
    }

    public function togglePaid(FinancialTransaction $transaction)
    {
        $transaction->update(['paid' => ! $transaction->paid]);

        return back()->with('success', $transaction->paid ? 'Marcado como pago.' : 'Marcado como pendente.');
    }

    private function validateTransaction(Request $request): array
    {
        $data = $request->validate([
            'account_id' => 'required|exists:financial_accounts,id',
            'category_id' => 'nullable|exists:financial_categories,id',
            'transfer_account_id' => 'nullable|exists:financial_accounts,id|different:account_id',
            'type' => 'required|in:income,expense,transfer',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'notes' => 'nullable|string|max:2000',
            'date' => 'required|date',
            'paid' => 'boolean',
        ]);

        $data['amount'] = (int) round($data['amount'] * 100);

        if ($data['type'] === 'transfer') {
            $data['category_id'] = null;
        } else {
            $data['transfer_account_id'] = null;
        }

        return $data;
    }

    /* ===================== ACCOUNTS ===================== */

    public function accounts(): Response
    {
        return Inertia::render('Admin/Finance/Accounts', [
            'accounts' => FinancialAccount::orderBy('order')->get()->map(fn ($a) => [
                'id' => $a->id, 'name' => $a->name, 'type' => $a->type,
                'institution' => $a->institution, 'color' => $a->color,
                'archived' => $a->archived, 'order' => $a->order,
                'opening_balance' => $a->opening_balance / 100,
                'balance' => $a->current_balance,
            ]),
        ]);
    }

    public function storeAccount(Request $request)
    {
        $data = $this->validateAccount($request);
        FinancialAccount::create($data);

        return back()->with('success', 'Conta criada.');
    }

    public function updateAccount(Request $request, FinancialAccount $account)
    {
        $account->update($this->validateAccount($request));

        return back()->with('success', 'Conta atualizada.');
    }

    public function destroyAccount(FinancialAccount $account)
    {
        $account->delete();

        return back()->with('success', 'Conta removida.');
    }

    /**
     * Redefine o saldo atual da conta, absorvendo a diferença no saldo inicial.
     * Não cria lançamento, não afeta "total levantado" nem o resultado do mês —
     * é como se a conta tivesse começado com esse valor.
     */
    public function adjustBalance(Request $request, FinancialAccount $account)
    {
        $data = $request->validate([
            'target' => 'required|numeric',
        ]);

        $targetCents = (int) round($data['target'] * 100);
        $diff = $targetCents - $account->current_balance;

        if ($diff === 0) {
            return back()->with('success', 'O saldo já está correto.');
        }

        // opening_balance + movimentações = saldo atual → ajustamos a base.
        $account->update(['opening_balance' => $account->opening_balance + $diff]);

        return back()->with('success', 'Saldo da conta atualizado.');
    }

    private function validateAccount(Request $request): array
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'type' => 'required|in:checking,savings,cash,credit_card,investment',
            'institution' => 'nullable|string|max:120',
            'opening_balance' => 'required|numeric',
            'color' => 'required|string|max:20',
            'archived' => 'boolean',
            'order' => 'nullable|integer',
        ]);

        $data['opening_balance'] = (int) round($data['opening_balance'] * 100);

        return $data;
    }

    /* ===================== CATEGORIES ===================== */

    public function categories(): Response
    {
        return Inertia::render('Admin/Finance/Categories', [
            'categories' => FinancialCategory::with('children')
                ->whereNull('parent_id')
                ->orderBy('type')->orderBy('order')->get(),
            'flat' => FinancialCategory::orderBy('name')->get(['id', 'name', 'type']),
        ]);
    }

    public function storeCategory(Request $request)
    {
        FinancialCategory::create($this->validateCategory($request));

        return back()->with('success', 'Categoria criada.');
    }

    public function updateCategory(Request $request, FinancialCategory $category)
    {
        $category->update($this->validateCategory($request));

        return back()->with('success', 'Categoria atualizada.');
    }

    public function destroyCategory(FinancialCategory $category)
    {
        $category->delete();

        return back()->with('success', 'Categoria removida.');
    }

    private function validateCategory(Request $request): array
    {
        return $request->validate([
            'parent_id' => 'nullable|exists:financial_categories,id',
            'name' => 'required|string|max:120',
            'type' => 'required|in:income,expense',
            'color' => 'required|string|max:20',
            'icon' => 'nullable|string|max:40',
            'order' => 'nullable|integer',
        ]);
    }

    /* ===================== RECURRING ===================== */

    public function recurring(): Response
    {
        return Inertia::render('Admin/Finance/Recurring', [
            'recurring' => RecurringTransaction::with(['account', 'category'])
                ->orderByDesc('active')->orderBy('day_of_month')->get()
                ->map(fn ($r) => array_merge($r->toArray(), ['amount' => $r->amount / 100])),
            'accounts' => FinancialAccount::orderBy('order')->get(['id', 'name', 'color']),
            'categories' => FinancialCategory::orderBy('name')->get(['id', 'name', 'type', 'color']),
        ]);
    }

    public function storeRecurring(Request $request)
    {
        RecurringTransaction::create($this->validateRecurring($request));

        return back()->with('success', 'Recorrência criada.');
    }

    public function updateRecurring(Request $request, RecurringTransaction $recurring)
    {
        $recurring->update($this->validateRecurring($request));

        return back()->with('success', 'Recorrência atualizada.');
    }

    public function destroyRecurring(RecurringTransaction $recurring)
    {
        $recurring->delete();

        return back()->with('success', 'Recorrência removida.');
    }

    /** Gera os lançamentos pendentes de todas as recorrências ativas até hoje. */
    public function runRecurring()
    {
        $today = Carbon::today();
        $created = 0;

        foreach (RecurringTransaction::where('active', true)->get() as $rec) {
            $cursor = $rec->last_generated_on
                ? $rec->last_generated_on->copy()->addDay()
                : $rec->starts_on->copy();

            while ($cursor->lte($today) && (! $rec->ends_on || $cursor->lte($rec->ends_on))) {
                $due = $this->nextDueDate($rec, $cursor);
                if (! $due || $due->gt($today)) {
                    break;
                }

                FinancialTransaction::create([
                    'account_id' => $rec->account_id,
                    'category_id' => $rec->category_id,
                    'type' => $rec->type,
                    'amount' => $rec->amount,
                    'description' => $rec->description,
                    'date' => $due->toDateString(),
                    'paid' => false,
                    'recurring_id' => $rec->id,
                ]);
                $created++;

                $rec->update(['last_generated_on' => $due]);
                $cursor = $due->copy()->addDay();
            }
        }

        return back()->with('success', "$created lançamento(s) gerado(s) a partir das recorrências.");
    }

    private function nextDueDate(RecurringTransaction $rec, Carbon $from): ?Carbon
    {
        // day_of_month = 0 → último dia do mês
        $day = fn (Carbon $ref) => $rec->day_of_month === 0
            ? $ref->daysInMonth
            : min($rec->day_of_month, $ref->daysInMonth);

        return match ($rec->frequency) {
            'weekly' => $from->copy(),
            'yearly' => Carbon::create($from->year, $rec->starts_on->month, min($rec->day_of_month ?: 28, 28)),
            default => Carbon::create($from->year, $from->month, $day($from)),
        };
    }

    private function validateRecurring(Request $request): array
    {
        $data = $request->validate([
            'account_id' => 'required|exists:financial_accounts,id',
            'category_id' => 'nullable|exists:financial_categories,id',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'frequency' => 'required|in:weekly,monthly,yearly',
            'day_of_month' => 'required|integer|min:0|max:31', // 0 = último dia do mês
            'starts_on' => 'required|date',
            'ends_on' => 'nullable|date|after:starts_on',
            'active' => 'boolean',
        ]);

        $data['amount'] = (int) round($data['amount'] * 100);

        return $data;
    }

    /* ===================== BUDGETS ===================== */

    public function budgets(Request $request): Response
    {
        $ref = $request->date ? Carbon::parse($request->date) : Carbon::now();
        $year = $ref->year;
        $month = $ref->month;

        $rows = FinancialCategory::where('type', 'expense')->orderBy('name')->get()->map(function ($cat) use ($year, $month) {
            $budget = Budget::where('category_id', $cat->id)->where('year', $year)->where('month', $month)->first();
            $spent = (int) FinancialTransaction::inMonth($year, $month)
                ->where('type', 'expense')->where('paid', true)
                ->where('category_id', $cat->id)->sum('amount');

            return [
                'category_id' => $cat->id,
                'category' => $cat->name,
                'color' => $cat->color,
                'planned' => $budget ? $budget->amount / 100 : 0,
                'spent' => $spent,
            ];
        });

        return Inertia::render('Admin/Finance/Budgets', [
            'refDate' => $ref->startOfMonth()->toDateString(),
            'rows' => $rows,
        ]);
    }

    public function saveBudget(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:financial_categories,id',
            'year' => 'required|integer',
            'month' => 'required|integer|min:1|max:12',
            'amount' => 'required|numeric|min:0',
        ]);

        Budget::updateOrCreate(
            ['category_id' => $data['category_id'], 'year' => $data['year'], 'month' => $data['month']],
            ['amount' => (int) round($data['amount'] * 100)]
        );

        return back()->with('success', 'Orçamento salvo.');
    }

    /* ===================== GOALS ===================== */

    public function storeGoal(Request $request)
    {
        FinancialGoal::create($this->validateGoal($request));

        return back()->with('success', 'Meta criada.');
    }

    public function updateGoal(Request $request, FinancialGoal $goal)
    {
        $goal->update($this->validateGoal($request));

        return back()->with('success', 'Meta atualizada.');
    }

    public function destroyGoal(FinancialGoal $goal)
    {
        $goal->delete();

        return back()->with('success', 'Meta removida.');
    }

    private function validateGoal(Request $request): array
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'target_amount' => 'required|numeric|min:0.01',
            'current_amount' => 'nullable|numeric|min:0',
            'account_id' => 'nullable|exists:financial_accounts,id',
            'target_date' => 'nullable|date',
            'color' => 'required|string|max:20',
        ]);

        $data['target_amount'] = (int) round($data['target_amount'] * 100);
        // Vinculada a conta → o "guardado" vem do saldo; zera o manual.
        $data['current_amount'] = ! empty($data['account_id'])
            ? 0
            : (int) round(($data['current_amount'] ?? 0) * 100);

        return $data;
    }
}
