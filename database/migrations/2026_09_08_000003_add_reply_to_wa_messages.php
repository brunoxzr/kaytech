<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wa_messages', function (Blueprint $table) {
            $table->string('reply_to_wamid')->nullable()->after('wamid');
            $table->string('reply_to_preview', 160)->nullable()->after('reply_to_wamid');
        });
    }

    public function down(): void
    {
        Schema::table('wa_messages', function (Blueprint $table) {
            $table->dropColumn(['reply_to_wamid', 'reply_to_preview']);
        });
    }
};
