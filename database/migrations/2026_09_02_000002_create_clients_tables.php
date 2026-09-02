<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('company')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('status')->default('prospect'); // prospect|contacted|proposal|won|lost
            $table->bigInteger('deal_value')->default(0);   // centavos
            $table->string('source')->nullable();           // indicação|site|linkedin|evento|outro
            $table->json('tags')->nullable();
            $table->string('next_action')->nullable();
            $table->date('next_action_at')->nullable();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained('contact_leads')->nullOnDelete();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
            $table->index(['status', 'order']);
            $table->index('next_action_at');
        });

        Schema::create('client_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->text('body');
            $table->string('kind')->default('note'); // note|call|meeting|email|status_change
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_notes');
        Schema::dropIfExists('clients');
    }
};
