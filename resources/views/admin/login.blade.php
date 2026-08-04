<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Administrativo — KayTech Solutions</title>
    <link rel="icon" type="image/png" href="/images/logo-kaytech.png">
    @vite(['resources/css/app.css'])
    <!-- Alpine.js initialized exclusively for Blade views as requested -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-[#050505] text-white flex items-center justify-center min-h-screen p-4">
    <div x-data="{ showPassword: false, loading: false }" class="w-full max-w-md bg-[#0d0d12] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="text-center mb-8">
            <img src="/images/logo-kaytech.png" alt="KayTech Logo" class="h-12 mx-auto mb-4 object-contain">
            <h1 class="text-2xl font-bold text-white tracking-tight">Painel Administrativo</h1>
            <p class="text-sm text-gray-400 mt-1">Acesso restrito para gestão da KayTech Solutions</p>
        </div>

        @if(session('error'))
            <div class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                {{ session('error') }}
            </div>
        @endif

        <form action="{{ route('admin.login.post') }}" method="POST" @submit="loading = true" class="space-y-5">
            @csrf
            <div>
                <label for="email" class="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">E-mail corporativo</label>
                <input type="email" name="email" id="email" required placeholder="admin@kaytech.com.br"
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition">
            </div>

            <div>
                <label for="password" class="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Senha de acesso</label>
                <div class="relative">
                    <input :type="showPassword ? 'text' : 'password'" name="password" id="password" required placeholder="••••••••"
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition">
                    <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white transition">
                        <span x-text="showPassword ? 'Ocultar' : 'Mostrar'"></span>
                    </button>
                </div>
            </div>

            <button type="submit" :disabled="loading" class="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30">
                <span x-show="!loading">Entrar no Painel</span>
                <span x-show="loading" class="animate-pulse">Autenticando...</span>
            </button>
        </form>

        <div class="mt-8 text-center border-t border-white/5 pt-6">
            <a href="/" class="text-xs text-gray-500 hover:text-gray-300 transition">← Voltar ao site público</a>
        </div>
    </div>
</body>
</html>
