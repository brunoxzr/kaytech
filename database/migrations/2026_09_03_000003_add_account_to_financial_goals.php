<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('financial_goals', function (Blueprint $table) {
            // Se preenchido, o "guardado" da meta acompanha o saldo atual desta conta.
            $table->foreignId('account_id')->nullable()->after('current_amount')
                ->constrained('financial_accounts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('financial_goals', fn (Blueprint $t) => $t->dropConstrainedForeignId('account_id'));
    }
};
