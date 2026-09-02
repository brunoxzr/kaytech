<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\TranslationController;
use App\Http\Controllers\LinkPageController;
use App\Http\Controllers\BrunoContactController;
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
use App\Http\Controllers\Admin\CareerMilestoneAdminController;
use App\Http\Controllers\Admin\AchievementAdminController;
use App\Http\Controllers\Admin\TestimonialAdminController;
use App\Http\Controllers\Admin\FinanceController;
use App\Http\Controllers\Admin\ClientController;

Route::domain('brunokay.kaytech.com.br')->group(function () {
    Route::get('/', [LinkPageController::class, 'brunokay'])->name('brunokay.home');
    Route::post('/contato', [BrunoContactController::class, 'store'])->name('brunokay.domain.contact.store');
});

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
Route::post('/brunokay/contato', [BrunoContactController::class, 'store'])->name('brunokay.contact.store');

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

        // Career Milestones (Bruno's personal timeline) Admin CRUD
        Route::get('/carreira', [CareerMilestoneAdminController::class, 'index'])->name('admin.career.index');
        Route::post('/carreira', [CareerMilestoneAdminController::class, 'store'])->name('admin.career.store');
        Route::put('/carreira/{careerMilestone}', [CareerMilestoneAdminController::class, 'update'])->name('admin.career.update');
        Route::delete('/carreira/{careerMilestone}', [CareerMilestoneAdminController::class, 'destroy'])->name('admin.career.destroy');

        // Achievements (Bruno's certifications/recognitions) Admin CRUD
        Route::get('/conquistas', [AchievementAdminController::class, 'index'])->name('admin.achievements.index');
        Route::post('/conquistas', [AchievementAdminController::class, 'store'])->name('admin.achievements.store');
        Route::put('/conquistas/{achievement}', [AchievementAdminController::class, 'update'])->name('admin.achievements.update');
        Route::delete('/conquistas/{achievement}', [AchievementAdminController::class, 'destroy'])->name('admin.achievements.destroy');

        // Testimonials (Bruno's client quotes) Admin CRUD
        Route::get('/depoimentos', [TestimonialAdminController::class, 'index'])->name('admin.testimonials.index');
        Route::post('/depoimentos', [TestimonialAdminController::class, 'store'])->name('admin.testimonials.store');
        Route::put('/depoimentos/{testimonial}', [TestimonialAdminController::class, 'update'])->name('admin.testimonials.update');
        Route::delete('/depoimentos/{testimonial}', [TestimonialAdminController::class, 'destroy'])->name('admin.testimonials.destroy');

        // ===================== Clientes (CRM) =====================
        Route::get('/clientes', [ClientController::class, 'index'])->name('admin.clients.index');
        Route::post('/clientes', [ClientController::class, 'store'])->name('admin.clients.store');
        Route::put('/clientes/{client}', [ClientController::class, 'update'])->name('admin.clients.update');
        Route::patch('/clientes/{client}/mover', [ClientController::class, 'move'])->name('admin.clients.move');
        Route::delete('/clientes/{client}', [ClientController::class, 'destroy'])->name('admin.clients.destroy');
        Route::post('/clientes/{client}/notas', [ClientController::class, 'addNote'])->name('admin.clients.notes.store');
        Route::delete('/clientes/{client}/notas/{note}', [ClientController::class, 'destroyNote'])->name('admin.clients.notes.destroy');

        // ===================== Finanças =====================
        Route::prefix('financas')->name('admin.finance.')->group(function () {
            Route::get('/', [FinanceController::class, 'dashboard'])->name('dashboard');

            Route::get('/lancamentos', [FinanceController::class, 'transactions'])->name('transactions');
            Route::post('/lancamentos', [FinanceController::class, 'storeTransaction'])->name('transactions.store');
            Route::put('/lancamentos/{transaction}', [FinanceController::class, 'updateTransaction'])->name('transactions.update');
            Route::delete('/lancamentos/{transaction}', [FinanceController::class, 'destroyTransaction'])->name('transactions.destroy');
            Route::patch('/lancamentos/{transaction}/pago', [FinanceController::class, 'togglePaid'])->name('transactions.toggle');

            Route::get('/contas', [FinanceController::class, 'accounts'])->name('accounts');
            Route::post('/contas', [FinanceController::class, 'storeAccount'])->name('accounts.store');
            Route::put('/contas/{account}', [FinanceController::class, 'updateAccount'])->name('accounts.update');
            Route::delete('/contas/{account}', [FinanceController::class, 'destroyAccount'])->name('accounts.destroy');

            Route::get('/categorias', [FinanceController::class, 'categories'])->name('categories');
            Route::post('/categorias', [FinanceController::class, 'storeCategory'])->name('categories.store');
            Route::put('/categorias/{category}', [FinanceController::class, 'updateCategory'])->name('categories.update');
            Route::delete('/categorias/{category}', [FinanceController::class, 'destroyCategory'])->name('categories.destroy');

            Route::get('/recorrencias', [FinanceController::class, 'recurring'])->name('recurring');
            Route::post('/recorrencias', [FinanceController::class, 'storeRecurring'])->name('recurring.store');
            Route::put('/recorrencias/{recurring}', [FinanceController::class, 'updateRecurring'])->name('recurring.update');
            Route::delete('/recorrencias/{recurring}', [FinanceController::class, 'destroyRecurring'])->name('recurring.destroy');
            Route::post('/recorrencias/gerar', [FinanceController::class, 'runRecurring'])->name('recurring.run');

            Route::get('/orcamentos', [FinanceController::class, 'budgets'])->name('budgets');
            Route::post('/orcamentos', [FinanceController::class, 'saveBudget'])->name('budgets.save');

            Route::post('/metas', [FinanceController::class, 'storeGoal'])->name('goals.store');
            Route::put('/metas/{goal}', [FinanceController::class, 'updateGoal'])->name('goals.update');
            Route::delete('/metas/{goal}', [FinanceController::class, 'destroyGoal'])->name('goals.destroy');
        });
    });
});
