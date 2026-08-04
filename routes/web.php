<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\TranslationController;
use App\Http\Controllers\LinkPageController;
use App\Http\Controllers\ShortLinkController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProjectAdminController;
use App\Http\Controllers\Admin\CompanyAdminController;
use App\Http\Controllers\Admin\LeadAdminController;
use App\Http\Controllers\Admin\SettingAdminController;
use App\Http\Controllers\Admin\LinkAdminController;
use App\Http\Controllers\Admin\LinkPageSettingAdminController;
use App\Http\Controllers\Admin\ProductAdminController;
use App\Http\Controllers\Admin\ShortLinkAdminController;
use App\Http\Controllers\Admin\MediaUploadController;

// Public Root Redirect
Route::get('/', function () {
    $locale = cookie('kaytech_locale') ?? session('locale', 'pt-BR');
    if (!in_array($locale, ['pt-BR', 'en', 'es'])) {
        $locale = 'pt-BR';
    }
    return redirect("/{$locale}");
});

// Localized Public Routes
Route::prefix('{locale}')->where(['locale' => 'pt-BR|en|es'])->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::get('/projetos/{slug}', [ProjectController::class, 'show'])->name('projects.show');
    Route::get('/projects/{slug}', [ProjectController::class, 'show']);
    Route::get('/proyectos/{slug}', [ProjectController::class, 'show']);
});

// Direct Project Slug Fallback
Route::get('/projetos/{slug}', function ($slug) {
    $locale = app()->getLocale();
    return redirect("/{$locale}/projetos/{slug}");
});

// Standalone Bio-link Pages (no locale prefix)
Route::get('/links', [LinkPageController::class, 'index'])->name('links');
Route::get('/brunokay', [LinkPageController::class, 'brunokay'])->name('brunokay');

// KayTech Products (own products/sub-brands, e.g. KayVision) — standalone, no locale prefix
Route::get('/produtos/{slug}', [ProductController::class, 'show'])->name('products.show');

// Short Link Redirector (KayTech's own bit.ly-style shortener)
Route::get('/go/{slug}', [ShortLinkController::class, 'redirect'])->name('shortlink.redirect');

// Contact Form Store
Route::post('/contato', [ContactController::class, 'store'])->name('contact.store');

// API Translation Endpoint
Route::post('/api/translate', [TranslationController::class, 'translate'])->middleware('throttle:30,1')->name('api.translate');

// Admin Auth Routes (Blade views)
Route::prefix('admin')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('admin.login');
    Route::post('/login', [AuthController::class, 'login'])->name('admin.login.post');
    Route::post('/logout', [AuthController::class, 'logout'])->name('admin.logout');

    // Protected Admin Routes
    Route::middleware('auth')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('admin.dashboard');

        // Generic media upload (used by all admin image fields)
        Route::post('/upload', [MediaUploadController::class, 'store'])->name('admin.upload');

        // Projects Admin CRUD
        Route::get('/projetos', [ProjectAdminController::class, 'index'])->name('admin.projects.index');
        Route::post('/projetos', [ProjectAdminController::class, 'store'])->name('admin.projects.store');
        Route::put('/projetos/{project}', [ProjectAdminController::class, 'update'])->name('admin.projects.update');
        Route::delete('/projetos/{project}', [ProjectAdminController::class, 'destroy'])->name('admin.projects.destroy');

        // Companies Admin CRUD
        Route::get('/empresas', [CompanyAdminController::class, 'index'])->name('admin.companies.index');
        Route::post('/empresas', [CompanyAdminController::class, 'store'])->name('admin.companies.store');
        Route::put('/empresas/{company}', [CompanyAdminController::class, 'update'])->name('admin.companies.update');
        Route::delete('/empresas/{company}', [CompanyAdminController::class, 'destroy'])->name('admin.companies.destroy');

        // Leads Admin
        Route::get('/contatos', [LeadAdminController::class, 'index'])->name('admin.leads.index');
        Route::patch('/contatos/{lead}/status', [LeadAdminController::class, 'updateStatus'])->name('admin.leads.update-status');

        // Settings Admin
        Route::get('/configuracoes', [SettingAdminController::class, 'index'])->name('admin.settings.index');
        Route::post('/configuracoes', [SettingAdminController::class, 'update'])->name('admin.settings.update');

        // Links (Linktree) Admin CRUD
        Route::get('/links', [LinkAdminController::class, 'index'])->name('admin.links.index');
        Route::post('/links', [LinkAdminController::class, 'store'])->name('admin.links.store');
        Route::put('/links/settings/{group}', [LinkPageSettingAdminController::class, 'update'])->name('admin.links.settings.update');
        Route::put('/links/{link}', [LinkAdminController::class, 'update'])->name('admin.links.update');
        Route::delete('/links/{link}', [LinkAdminController::class, 'destroy'])->name('admin.links.destroy');

        // KayTech Products (sub-brands) Admin CRUD
        Route::get('/produtos', [ProductAdminController::class, 'index'])->name('admin.products.index');
        Route::post('/produtos', [ProductAdminController::class, 'store'])->name('admin.products.store');
        Route::put('/produtos/{product}', [ProductAdminController::class, 'update'])->name('admin.products.update');
        Route::delete('/produtos/{product}', [ProductAdminController::class, 'destroy'])->name('admin.products.destroy');

        // Short Links Admin CRUD
        Route::get('/encurtador', [ShortLinkAdminController::class, 'index'])->name('admin.shortlinks.index');
        Route::post('/encurtador', [ShortLinkAdminController::class, 'store'])->name('admin.shortlinks.store');
        Route::put('/encurtador/{shortLink}', [ShortLinkAdminController::class, 'update'])->name('admin.shortlinks.update');
        Route::delete('/encurtador/{shortLink}', [ShortLinkAdminController::class, 'destroy'])->name('admin.shortlinks.destroy');
    });
});
