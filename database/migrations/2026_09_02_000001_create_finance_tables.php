<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Contas (banco, carteira, cartão, poupança…)
        Schema::create('financial_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->default('checking'); // checking | savings | cash | credit_card | investment
            $table->string('institution')->nullable();
            $table->bigInteger('opening_balance')->default(0); // centavos
            $table->string('color', 20)->default('#8B5CF6');
            $table->boolean('archived')->default(false);
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });

        // Categorias (hierárquicas, tipadas por fluxo)
        Schema::create('financial_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('financial_categories')->nullOnDelete();
            $table->string('name');
            $table->string('type'); // income | expense
            $table->string('color', 20)->default('#6B7280');
            $table->string('icon', 40)->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });

        // Recorrências / contas a pagar-receber
        Schema::create('recurring_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('financial_accounts')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('financial_categories')->nullOnDelete();
            $table->string('type'); // income | expense
            $table->bigInteger('amount');
            $table->string('description');
            $table->string('frequency')->default('monthly'); // weekly | monthly | yearly
            $table->unsignedTinyInteger('day_of_month')->default(1);
            $table->date('starts_on');
            $table->date('ends_on')->nullable();
            $table->date('last_generated_on')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // Lançamentos
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('financial_accounts')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('financial_categories')->nullOnDelete();
            $table->foreignId('transfer_account_id')->nullable()->constrained('financial_accounts')->nullOnDelete();
            $table->string('type'); // income | expense | transfer
            $table->bigInteger('amount'); // centavos, sempre positivo
            $table->string('description');
            $table->text('notes')->nullable();
            $table->date('date');
            $table->boolean('paid')->default(true); // false = a pagar/receber (previsto)
            $table->foreignId('recurring_id')->nullable()->constrained('recurring_transactions')->nullOnDelete();
            $table->timestamps();
            $table->index(['date', 'type']);
            $table->index(['paid', 'date']);
        });

        // Orçamentos mensais por categoria
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('financial_categories')->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month'); // 1-12
            $table->bigInteger('amount'); // limite planejado, centavos
            $table->timestamps();
            $table->unique(['category_id', 'year', 'month']);
        });

        // Metas de economia
        Schema::create('financial_goals', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->bigInteger('target_amount');
            $table->bigInteger('current_amount')->default(0);
            $table->date('target_date')->nullable();
            $table->string('color', 20)->default('#22C55E');
            $table->boolean('achieved')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_goals');
        Schema::dropIfExists('budgets');
        Schema::dropIfExists('recurring_transactions');
        Schema::dropIfExists('financial_transactions');
        Schema::dropIfExists('financial_categories');
        Schema::dropIfExists('financial_accounts');
    }
};
