<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\TrustedCompany;
use App\Models\ContactLead;
use App\Http\Controllers\Admin\ClientController;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Index', [
            'stats' => [
                'total_projects' => Project::count(),
                'total_companies' => TrustedCompany::count(),
                'total_leads' => ContactLead::count(),
                'new_leads' => ContactLead::where('status', 'new')->count(),
            ],
            'recent_leads' => ContactLead::latest()->take(5)->get(),
            'crm' => ClientController::overviewSummary(),
        ]);
    }
}
