<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_application_redirects_root_to_default_locale(): void
    {
        $response = $this->get('/');
        $response->assertStatus(302);
        $response->assertRedirect('/pt-BR');
    }

    public function test_the_home_page_renders_successfully(): void
    {
        $this->seed();
        $response = $this->get('/pt-BR');
        $response->assertStatus(200);
    }

    public function test_contact_form_stores_lead(): void
    {
        $this->seed();
        $response = $this->post('/contato', [
            'name' => 'Cliente Teste',
            'email' => 'cliente@empresa.com.br',
            'phone' => '(43) 99999-9999',
            'project_type' => 'Sistema web',
            'budget_range' => 'R$ 5.000 a R$ 15.000',
            'message' => 'Preciso de um sistema web para controlar estoque e vendas.',
            'privacy' => true,
            'website' => '', // Honeypot empty
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('contact_leads', [
            'email' => 'cliente@empresa.com.br',
            'name' => 'Cliente Teste',
        ]);
    }

    public function test_admin_authentication_and_dashboard_access(): void
    {
        $this->seed();

        $loginResponse = $this->post('/admin/login', [
            'email' => 'admin@kaytech.com.br',
            'password' => 'password',
        ]);

        $loginResponse->assertRedirect('/admin');

        $dashboardResponse = $this->get('/admin');
        $dashboardResponse->assertStatus(200);
    }
}
