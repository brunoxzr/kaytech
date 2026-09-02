<?php

namespace Database\Seeders;

use App\Models\FinancialAccount;
use App\Models\FinancialCategory;
use Illuminate\Database\Seeder;

class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        if (FinancialAccount::count() === 0) {
            FinancialAccount::insert([
                ['name' => 'Conta Corrente', 'type' => 'checking', 'institution' => null, 'opening_balance' => 0, 'color' => '#8B5CF6', 'archived' => false, 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Carteira', 'type' => 'cash', 'institution' => null, 'opening_balance' => 0, 'color' => '#22C55E', 'archived' => false, 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Poupança', 'type' => 'savings', 'institution' => null, 'opening_balance' => 0, 'color' => '#3B82F6', 'archived' => false, 'order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if (FinancialCategory::count() > 0) {
            return;
        }

        $expenses = [
            ['Moradia', '#F59E0B'], ['Alimentação', '#EF4444'], ['Transporte', '#3B82F6'],
            ['Saúde', '#10B981'], ['Educação', '#8B5CF6'], ['Lazer', '#EC4899'],
            ['Assinaturas', '#6366F1'], ['Impostos e Taxas', '#64748B'], ['Investimentos', '#14B8A6'],
            ['Outros', '#6B7280'],
        ];
        $incomes = [
            ['Salário', '#22C55E'], ['Freelance / Projetos', '#10B981'],
            ['Rendimentos', '#3B82F6'], ['Reembolsos', '#A3E635'], ['Outros', '#6B7280'],
        ];

        foreach ($expenses as $i => [$name, $color]) {
            FinancialCategory::create(['name' => $name, 'type' => 'expense', 'color' => $color, 'order' => $i]);
        }
        foreach ($incomes as $i => [$name, $color]) {
            FinancialCategory::create(['name' => $name, 'type' => 'income', 'color' => $color, 'order' => $i]);
        }
    }
}
