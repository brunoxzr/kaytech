<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('link_page_settings', function (Blueprint $table) {
            $table->string('role_tagline')->nullable()->after('display_name');
            $table->string('hero_title')->nullable()->after('role_tagline');
            $table->text('hero_description')->nullable()->after('hero_title');
            $table->string('stat_1_value')->nullable()->after('bio');
            $table->string('stat_1_label')->nullable()->after('stat_1_value');
            $table->string('stat_2_value')->nullable()->after('stat_1_label');
            $table->string('stat_2_label')->nullable()->after('stat_2_value');
            $table->string('stat_3_value')->nullable()->after('stat_2_label');
            $table->string('stat_3_label')->nullable()->after('stat_3_value');
            $table->string('whatsapp_url')->nullable()->after('stat_3_label');
            $table->string('contact_email')->nullable()->after('whatsapp_url');
        });
    }

    public function down(): void
    {
        Schema::table('link_page_settings', function (Blueprint $table) {
            $table->dropColumn([
                'role_tagline',
                'hero_title',
                'hero_description',
                'stat_1_value',
                'stat_1_label',
                'stat_2_value',
                'stat_2_label',
                'stat_3_value',
                'stat_3_label',
                'whatsapp_url',
                'contact_email',
            ]);
        });
    }
};
