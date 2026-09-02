<!DOCTYPE html>
<html lang="pt-BR" data-admin-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login — Painel KayTech</title>
    <link rel="icon" type="image/png" href="/images/logo-kaytech.png">
    @vite(['resources/css/app.css'])
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="ui-root ui-canvas antialiased">
    <div class="min-h-screen w-full lg:grid lg:grid-cols-2">

        {{-- ESQUERDA — marca (desktop) --}}
        <div class="relative hidden flex-col justify-between p-12 ui-subtle lg:flex">
            <div class="flex items-center gap-3">
                <img src="/images/logo-kaytech.png" alt="KayTech" class="h-8 w-auto object-contain">
                <span class="text-[13px] font-semibold ui-t">KayTech · admin</span>
            </div>
            <div class="max-w-sm">
                <h2 class="text-2xl font-semibold leading-snug tracking-tight ui-t">
                    Um só lugar para gerir o site e as finanças da operação.
                </h2>
                <p class="mt-3 text-[13px] leading-relaxed ui-t-faint">
                    Projetos, conteúdo e o financeiro completo — no mesmo painel.
                </p>
            </div>
            <span class="text-[12px] ui-t-faint">&copy; {{ date('Y') }} KayTech Solutions</span>
        </div>

        {{-- DIREITA — formulário (centralizado no mobile) --}}
        <div class="flex min-h-screen items-center justify-center p-6 sm:p-10">
            <div x-data="{ showPassword: false, loading: false }" class="w-full max-w-sm">

                <div class="mb-10 text-center lg:hidden">
                    <img src="/images/logo-kaytech.png" alt="KayTech" class="mx-auto h-10 object-contain">
                </div>

                <div class="mb-8">
                    <h1 class="text-xl font-semibold tracking-tight ui-t">Entrar no painel</h1>
                    <p class="mt-1 text-[13px] ui-t-faint">Acesso restrito à gestão da KayTech.</p>
                </div>

                @if(session('error'))
                    <div class="mb-6 rounded-lg border ui-b-strong ui-subtle px-4 py-3 text-[13px] ui-neg">
                        {{ session('error') }}
                    </div>
                @endif

                <form action="{{ route('admin.login.post') }}" method="POST" @submit="loading = true" class="space-y-4">
                    @csrf
                    <div>
                        <label for="email" class="mb-1.5 block text-[11px] font-medium uppercase tracking-wide ui-t-faint">E-mail</label>
                        <input type="email" name="email" id="email" required autofocus placeholder="voce@kaytech.com.br" class="ui-input">
                    </div>
                    <div>
                        <label for="password" class="mb-1.5 block text-[11px] font-medium uppercase tracking-wide ui-t-faint">Senha</label>
                        <div class="relative">
                            <input :type="showPassword ? 'text' : 'password'" name="password" id="password" required placeholder="••••••••" class="ui-input pr-16">
                            <button type="button" @click="showPassword = !showPassword"
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] ui-t-faint transition hover:ui-t">
                                <span x-text="showPassword ? 'Ocultar' : 'Mostrar'"></span>
                            </button>
                        </div>
                    </div>
                    <button type="submit" :disabled="loading" class="ui-btn ui-btn-primary w-full justify-center py-2.5">
                        <span x-show="!loading">Entrar</span>
                        <span x-show="loading" class="animate-pulse">Autenticando…</span>
                    </button>
                </form>

                <div class="mt-8 border-t ui-b pt-6">
                    <a href="/" class="text-[12px] ui-t-faint transition hover:ui-t">← Voltar ao site público</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
