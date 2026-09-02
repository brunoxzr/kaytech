<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\TrustedCompany;
use App\Models\ContactLead;
use App\Models\FinancialCategory;
use App\Models\FinancialTransaction;
use App\Http\Controllers\Admin\ClientController;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Index', [
            'stats' => [
                'total_projects' => Project::count(),
                'total_companies' => TrustedCompany::count(),
                'total_leads' => ContactLead::count(),
                'new_leads' => ContactLead::where('status', 'new')->count(),
            ],
            'recent_leads' => ContactLead::latest()->take(5)->get(),
            'crm' => ClientController::overviewSummary(),
            'finance' => $this->financeSummary(),
        ]);
    }

    private function financeSummary(): array
    {
        $adjustCatId = FinancialCategory::where('name', 'Ajuste de saldo')->pluck('id');

        $totalRaised = (int) FinancialTransaction::where('type', 'income')->where('paid', true)
            ->whereNotIn('category_id', $adjustCatId)
            ->sum('amount');

        // Últimos 6 meses de entradas x saídas (pagas)
        $months = [];
        $ref = Carbon::now()->startOfMonth();
        for ($i = 5; $i >= 0; $i--) {
            $m = $ref->copy()->subMonths($i);
            $rows = FinancialTransaction::whereYear('date', $m->year)
                ->whereMonth('date', $m->month)
                ->where('paid', true)
                ->get();
            $months[] = [
                'label' => $m->translatedFormat('M'),
                'income' => (int) $rows->where('type', 'income')->sum('amount'),
                'expense' => (int) $rows->where('type', 'expense')->sum('amount'),
            ];
        }

        $thisMonth = end($months) ?: ['income' => 0, 'expense' => 0];

        return [
            'totalRaised' => $totalRaised,
            'monthIncome' => (int) $thisMonth['income'],
            'monthExpense' => (int) $thisMonth['expense'],
            'monthNet' => (int) ($thisMonth['income'] - $thisMonth['expense']),
            'series' => $months,
        ];
    }
}
