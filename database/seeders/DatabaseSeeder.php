<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\TrustedCompany;
use App\Models\Project;
use App\Models\ProjectTranslation;
use App\Models\Service;
use App\Models\ServiceTranslation;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin User
        User::updateOrCreate(
            ['email' => 'kaybruno177@gmail.com'],
            [
                'name' => 'Bruno Kay (Admin)',
                'password' => Hash::make('senha123'),
            ]
        );

        // 2. Trusted Companies (CEEP, Espaço Assahi, Minoru, Billy Bob)
        $companies = [
            ['name' => 'CEEP', 'logo' => '/images/companies/logoCeep.png', 'order' => 1],
            ['name' => 'Espaço Assahi', 'logo' => '/images/companies/assahi.png', 'order' => 2],
            ['name' => 'Minoru', 'logo' => '/images/companies/minoru.png', 'order' => 3],
            ['name' => 'Billy Bob', 'logo' => '/images/companies/billybob.png', 'order' => 4],
        ];

        foreach ($companies as $c) {
            TrustedCompany::updateOrCreate(['name' => $c['name']], $c);
        }

        // 3. Projects (Espaço Assahi, CEEP App, Minoru Bentô)
        $projectsData = [
            [
                'technologies' => ['Dashboard', 'Laravel', 'Operação'],
                'cover' => '/images/projects/dashboardassahi.png',
                'gallery' => ['/images/projects/assahi.png', '/images/projects/dashboardassahi.png'],
                'project_url' => 'https://espacoassahi.com.br',
                'featured' => true,
                'order' => 1,
                'translations' => [
                    'pt-BR' => [
                        'slug' => 'espaco-assahi',
                        'title' => 'Espaço Assahi',
                        'category' => 'Turismo e experiências',
                        'summary' => 'Dashboard administrativo, presença digital e estrutura para gestão de fluxo e dados do espaço.',
                        'challenge' => 'O Espaço Assahi precisava de uma gestão unificada para controlar o fluxo de clientes e otimizar reservas e operações diárias.',
                        'solution' => 'Desenvolvemos um dashboard completo em Laravel integrado a uma presença digital responsiva, permitindo acompanhar indicadores em tempo real.',
                    ],
                    'en' => [
                        'slug' => 'espaco-assahi',
                        'title' => 'Espaço Assahi',
                        'category' => 'Tourism & Experiences',
                        'summary' => 'Administrative dashboard, digital presence, and operational data management platform.',
                        'challenge' => 'Espaço Assahi required a unified solution to manage visitor flow and optimize reservations.',
                        'solution' => 'We built a complete Laravel dashboard coupled with a responsive portal for real-time analytics.',
                    ],
                    'es' => [
                        'slug' => 'espaco-assahi',
                        'title' => 'Espaço Assahi',
                        'category' => 'Turismo y experiencias',
                        'summary' => 'Dashboard administrativo, presencia digital y estructura para gestión de flujo y datos del espacio.',
                        'challenge' => 'Espaço Assahi necesitaba una gestión unificada para controlar el flujo de clientes.',
                        'solution' => 'Desarrollamos un dashboard completo en Laravel integrado con presencia digital responsiva.',
                    ],
                ]
            ],
            [
                'technologies' => ['Laravel', 'PostgreSQL', 'Responsivo'],
                'cover' => '/images/projects/ceep.png',
                'gallery' => ['/images/projects/ceepassai.png', '/images/projects/ceep.png'],
                'project_url' => 'https://ceep.com.br',
                'featured' => true,
                'order' => 2,
                'translations' => [
                    'pt-BR' => [
                        'slug' => 'ceep-app',
                        'title' => 'CEEP App',
                        'category' => 'Educação',
                        'summary' => 'Sistema institucional para comunicação, organização escolar e digitalização de processos internos.',
                        'challenge' => 'Digitalizar a rotina de comunicação e cadastros da instituição de ensino com confiabilidade.',
                        'solution' => 'Plataforma robusta em Laravel e PostgreSQL focada em UX rápida e organização de dados acadêmicos.',
                    ],
                    'en' => [
                        'slug' => 'ceep-app',
                        'title' => 'CEEP App',
                        'category' => 'Education',
                        'summary' => 'Institutional system for communication, school organization, and digitization of internal processes.',
                        'challenge' => 'Digitize school communication and record keeping reliably.',
                        'solution' => 'Robust Laravel & PostgreSQL platform focused on fast UX and academic data organization.',
                    ],
                    'es' => [
                        'slug' => 'ceep-app',
                        'title' => 'CEEP App',
                        'category' => 'Educación',
                        'summary' => 'Sistema institucional para comunicación, organización escolar y digitalización de procesos internos.',
                        'challenge' => 'Digitalizar la rutina de comunicación y registros de la institución educativa.',
                        'solution' => 'Plataforma robusta en Laravel y PostgreSQL centrada en rápida experiencia de usuario.',
                    ],
                ]
            ],
            [
                'technologies' => ['Landing Page', 'Responsivo'],
                'cover' => '/images/projects/minoru.png',
                'gallery' => ['/images/projects/minorulp.png', '/images/projects/minoru.png'],
                'project_url' => 'https://minorubento.com.br',
                'featured' => true,
                'order' => 3,
                'translations' => [
                    'pt-BR' => [
                        'slug' => 'minoru-bento',
                        'title' => 'Minoru Bentô',
                        'category' => 'Restaurante',
                        'summary' => 'Landing page institucional para apresentar cardápio, delivery e informações do restaurante.',
                        'challenge' => 'Apresentar a gastronomia oriental com experiência visual premium e conversão direta para pedidos.',
                        'solution' => 'Landing page ultrarápida com carregamento otimizado de imagens e botões de chamada rápida.',
                    ],
                    'en' => [
                        'slug' => 'minoru-bento',
                        'title' => 'Minoru Bentô',
                        'category' => 'Restaurant',
                        'summary' => 'Institutional landing page presenting menu, delivery options, and restaurant details.',
                        'challenge' => 'Present Asian gastronomy with a premium visual experience and direct order conversion.',
                        'solution' => 'Ultra-fast landing page with optimized image loading and direct contact triggers.',
                    ],
                    'es' => [
                        'slug' => 'minoru-bento',
                        'title' => 'Minoru Bentô',
                        'category' => 'Restaurante',
                        'summary' => 'Landing page institucional para presentar menú, delivery e información del restaurante.',
                        'challenge' => 'Presentar la gastronomía oriental con experiencia visual premium.',
                        'solution' => 'Landing page ultrarrápida con optimización de carga de imágenes.',
                    ],
                ]
            ],
        ];

        foreach ($projectsData as $pData) {
            $translations = $pData['translations'];
            unset($pData['translations']);

            $project = Project::create($pData);

            foreach ($translations as $loc => $transData) {
                ProjectTranslation::create([
                    'project_id' => $project->id,
                    'locale' => $loc,
                    'title' => $transData['title'],
                    'category' => $transData['category'],
                    'summary' => $transData['summary'],
                    'challenge' => $transData['challenge'],
                    'solution' => $transData['solution'],
                    'slug' => $transData['slug'],
                    'translation_status' => 'published',
                ]);
            }
        }

        // 4. Services (8 Services)
        $servicesData = [
            [
                'number' => '01', 'icon' => 'Cpu', 'order' => 1,
                'pt-BR' => ['title' => 'Sistemas Web Completos', 'description' => 'Plataformas robustas e escaláveis sob medida.'],
                'en' => ['title' => 'Full Web Systems', 'description' => 'Robust, custom scalable platforms.'],
                'es' => ['title' => 'Sistemas Web Completos', 'description' => 'Plataformas robustas y escalables a medida.'],
            ],
            [
                'number' => '02', 'icon' => 'Globe', 'order' => 2,
                'pt-BR' => ['title' => 'Sites Institucionais', 'description' => 'Presença digital profissional e moderna.'],
                'en' => ['title' => 'Institutional Websites', 'description' => 'Professional and modern digital presence.'],
                'es' => ['title' => 'Sitios Institucionales', 'description' => 'Presencia digital profesional y moderna.'],
            ],
            [
                'number' => '03', 'icon' => 'Zap', 'order' => 3,
                'pt-BR' => ['title' => 'Landing Pages', 'description' => 'Páginas de alta conversão e performance.'],
                'en' => ['title' => 'Landing Pages', 'description' => 'High conversion and performance pages.'],
                'es' => ['title' => 'Landing Pages', 'description' => 'Páginas de alta conversión y rendimiento.'],
            ],
            [
                'number' => '04', 'icon' => 'Users', 'order' => 4,
                'pt-BR' => ['title' => 'CRM Personalizado', 'description' => 'Gestão de clientes sob medida.'],
                'en' => ['title' => 'Custom CRM', 'description' => 'Tailored customer management.'],
                'es' => ['title' => 'CRM Personalizado', 'description' => 'Gestión de clientes a medida.'],
            ],
            [
                'number' => '05', 'icon' => 'LayoutDashboard', 'order' => 5,
                'pt-BR' => ['title' => 'Dashboards', 'description' => 'Painéis inteligentes e analytics.'],
                'en' => ['title' => 'Dashboards', 'description' => 'Smart analytics & monitoring panels.'],
                'es' => ['title' => 'Dashboards', 'description' => 'Paneles inteligentes y analítica.'],
            ],
            [
                'number' => '06', 'icon' => 'Workflow', 'order' => 6,
                'pt-BR' => ['title' => 'Automação de Processos', 'description' => 'Fluxos automáticos que economizam tempo.'],
                'en' => ['title' => 'Process Automation', 'description' => 'Automated workflows saving time.'],
                'es' => ['title' => 'Automatización de Procesos', 'description' => 'Flujos automáticos que ahorran tiempo.'],
            ],
            [
                'number' => '07', 'icon' => 'Network', 'order' => 7,
                'pt-BR' => ['title' => 'Integrações API', 'description' => 'Conexões entre sistemas e plataformas.'],
                'en' => ['title' => 'API Integrations', 'description' => 'Seamless connections between systems.'],
                'es' => ['title' => 'Integraciones API', 'description' => 'Conexiones entre sistemas y plataformas.'],
            ],
            [
                'number' => '08', 'icon' => 'ShieldCheck', 'order' => 8,
                'pt-BR' => ['title' => 'Consultoria Tech', 'description' => 'Estratégia digital para seu negócio.'],
                'en' => ['title' => 'Tech Consulting', 'description' => 'Digital strategy for your business.'],
                'es' => ['title' => 'Consultoría Tech', 'description' => 'Estrategia digital para tu negocio.'],
            ],
        ];

        foreach ($servicesData as $sData) {
            $service = Service::create([
                'number' => $sData['number'],
                'icon_name' => $sData['icon'],
                'order' => $sData['order'],
            ]);

            foreach (['pt-BR', 'en', 'es'] as $loc) {
                ServiceTranslation::create([
                    'service_id' => $service->id,
                    'locale' => $loc,
                    'title' => $sData[$loc]['title'],
                    'description' => $sData[$loc]['description'],
                ]);
            }
        }

        // 5. Site Settings
        SiteSetting::updateOrCreate(['key' => 'whatsapp_url'], ['value' => 'https://wa.me/5543999999999']);
        SiteSetting::updateOrCreate(['key' => 'contact_email'], ['value' => 'bruno.kay2304@gmail.com']);
    }
}
