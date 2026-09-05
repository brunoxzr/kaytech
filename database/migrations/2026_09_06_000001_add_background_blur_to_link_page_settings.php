<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('link_page_settings', function (Blueprint $table) {
            $table->unsignedTinyInteger('background_blur')->default(28)->after('background_image');
            $table->unsignedTinyInteger('background_dim')->default(70)->after('background_blur');
        });
    }

    public function down(): void
    {
        Schema::table('link_page_settings', function (Blueprint $table) {
            $table->dropColumn(['background_blur', 'background_dim']);
        });
    }
};
