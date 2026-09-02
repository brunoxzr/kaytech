<?php

namespace Database\Seeders;

use App\Models\FinancialAccount;
use App\Models\FinancialCategory;
use App\Models\FinancialTransaction;
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

        if (FinancialCategory::count() === 0) {
            foreach ($expenses as $i => [$name, $color]) {
                FinancialCategory::create(['name' => $name, 'type' => 'expense', 'color' => $color, 'order' => $i]);
            }
            foreach ($incomes as $i => [$name, $color]) {
                FinancialCategory::create(['name' => $name, 'type' => 'income', 'color' => $color, 'order' => $i]);
            }
        }

        $account = FinancialAccount::where('name', 'Conta Corrente')->firstOrFail();
        $salaryCategory = FinancialCategory::where('name', 'Salário')->where('type', 'income')->firstOrFail();
        $freelanceCategory = FinancialCategory::where('name', 'Freelance / Projetos')->where('type', 'income')->firstOrFail();

        $transactions = [];
        for ($month = 5; $month <= 11; $month++) {
            $transactions[] = [
                'date' => sprintf('2025-%02d-01', $month),
                'amount' => 70000,
                'description' => 'Salário Prefeitura - Estágio',
                'category_id' => $salaryCategory->id,
            ];
        }

        $transactions = array_merge($transactions, [
            ['date' => '2025-12-01', 'amount' => 400000, 'description' => 'Freelance', 'category_id' => $freelanceCategory->id],
            ['date' => '2026-03-01', 'amount' => 350000, 'description' => 'Assahi Engine', 'category_id' => $freelanceCategory->id],
            ['date' => '2026-06-10', 'amount' => 200000, 'description' => 'EASY CONSULTERS - Freelance', 'category_id' => $freelanceCategory->id],
            ['date' => '2026-07-10', 'amount' => 200000, 'description' => 'EASY CONSULTERS - Freelance', 'category_id' => $freelanceCategory->id],
            ['date' => '2026-08-10', 'amount' => 200000, 'description' => 'EASY CONSULTERS - Freelance', 'category_id' => $freelanceCategory->id],
            ['date' => '2026-07-25', 'amount' => 200000, 'description' => 'PHA CONEXÕES - Freelance', 'category_id' => $freelanceCategory->id],
            ['date' => '2026-08-25', 'amount' => 200000, 'description' => 'PHA CONEXÕES - Freelance', 'category_id' => $freelanceCategory->id],
        ]);

        for ($month = 3; $month <= 8; $month++) {
            $monthDate = \Carbon\Carbon::create(2026, $month, 1);

            $transactions[] = [
                'date' => sprintf('2026-%02d-10', $month),
                'amount' => 35000,
                'description' => 'Assahi Engine',
                'category_id' => $freelanceCategory->id,
            ];
            $transactions[] = [
                'date' => $monthDate->endOfMonth()->toDateString(),
                'amount' => 20000,
                'description' => 'CEEP Assahi',
                'category_id' => $freelanceCategory->id,
            ];
        }

        $transactions[] = [
            'date' => '2026-08-01',
            'amount' => 49000,
            'description' => 'Prefeitura - Hackathon',
            'category_id' => $salaryCategory->id,
        ];

        foreach ($transactions as $transaction) {
            FinancialTransaction::firstOrCreate(
                [
                    'account_id' => $account->id,
                    'category_id' => $transaction['category_id'],
                    'type' => 'income',
                    'amount' => $transaction['amount'],
                    'description' => $transaction['description'],
                    'date' => $transaction['date'],
                ],
                ['paid' => true]
            );
        }
    }
}
