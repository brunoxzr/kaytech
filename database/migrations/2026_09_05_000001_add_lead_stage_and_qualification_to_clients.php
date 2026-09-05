<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->json('qualification')->nullable()->after('status');
        });

        // default vira 'lead' (nova primeira etapa do pipeline)
        DB::statement("ALTER TABLE clients ALTER COLUMN status SET DEFAULT 'lead'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE clients ALTER COLUMN status SET DEFAULT 'prospect'");
        Schema::table('clients', fn (Blueprint $t) => $t->dropColumn('qualification'));
    }
};
