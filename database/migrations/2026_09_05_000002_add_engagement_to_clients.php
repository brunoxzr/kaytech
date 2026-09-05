<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->boolean('replied')->default(false)->after('qualification');       // já respondeu / deu retorno
            $table->string('temperature', 10)->default('cold')->after('replied');     // cold | warm | hot
        });
    }

    public function down(): void
    {
        Schema::table('clients', fn (Blueprint $t) => $t->dropColumn(['replied', 'temperature']));
    }
};
