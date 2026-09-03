<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = [
        'financial_accounts',
        'financial_categories',
        'financial_transactions',
        'recurring_transactions',
        'budgets',
        'financial_goals',
    ];

    public function up(): void
    {
        // Dono padrão: o primeiro admin (Bruno). Tudo que já existe fica com ele.
        $ownerId = User::where('role', 'admin')->orderBy('id')->value('id') ?? User::orderBy('id')->value('id');

        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->foreignId('owner_id')->nullable()->after('id')->constrained('users')->cascadeOnDelete();
                $t->index('owner_id');
            });

            if ($ownerId) {
                DB::table($table)->update(['owner_id' => $ownerId]);
            }
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropConstrainedForeignId('owner_id');
            });
        }
    }
};
