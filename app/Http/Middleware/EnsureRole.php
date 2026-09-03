<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restringe rotas administrativas por papel.
 *   ->middleware('role:admin')    → só admin
 *   ->middleware('role:admin,finance') → admin OU finance
 * Usuário 'finance' que cai numa rota sem permissão é jogado no dashboard de finanças.
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('admin.login');
        }

        if (! in_array($user->role, $roles, true)) {
            if ($user->role === 'finance') {
                return redirect()->route('admin.finance.dashboard');
            }
            abort(403, 'Sem permissão para esta área.');
        }

        return $next($request);
    }
}
