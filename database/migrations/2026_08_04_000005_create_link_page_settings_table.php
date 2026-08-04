<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('link_page_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('group', ['kaytech', 'brunokay'])->unique();
            $table->string('background_color')->nullable();
            $table->string('background_image')->nullable();
            $table->string('profile_image')->nullable();
            $table->string('display_name')->nullable();
            $table->text('bio')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('link_page_settings');
    }
};
