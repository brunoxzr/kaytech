<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Trusted Companies
        Schema::create('trusted_companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo');
            $table->string('url')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Main Projects
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->json('technologies')->nullable();
            $table->string('cover');
            $table->json('gallery')->nullable();
            $table->string('project_url')->nullable();
            $table->boolean('featured')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Project Translations
        Schema::create('project_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('locale', 10);
            $table->string('title');
            $table->string('category');
            $table->text('summary');
            $table->longText('challenge')->nullable();
            $table->longText('solution')->nullable();
            $table->string('slug');
            $table->string('translation_status')->default('draft');
            $table->timestamps();

            $table->unique(['project_id', 'locale']);
            $table->unique(['locale', 'slug']);
        });

        // Services
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('number', 10);
            $table->string('icon_name')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Service Translations
        Schema::create('service_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->string('locale', 10);
            $table->string('title');
            $table->text('description');
            $table->timestamps();

            $table->unique(['service_id', 'locale']);
        });

        // Contact Leads
        Schema::create('contact_leads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('company')->nullable();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('project_type');
            $table->string('budget_range')->nullable();
            $table->text('message');
            $table->enum('status', ['new', 'contacted', 'qualified', 'closed', 'archived'])->default('new');
            $table->timestamps();
        });

        // Site Settings
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Site Setting Translations
        Schema::create('site_setting_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_setting_id')->constrained('site_settings')->cascadeOnDelete();
            $table->string('locale', 10);
            $table->text('value');
            $table->timestamps();

            $table->unique(['site_setting_id', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_setting_translations');
        Schema::dropIfExists('site_settings');
        Schema::dropIfExists('contact_leads');
        Schema::dropIfExists('service_translations');
        Schema::dropIfExists('services');
        Schema::dropIfExists('project_translations');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('trusted_companies');
    }
};
