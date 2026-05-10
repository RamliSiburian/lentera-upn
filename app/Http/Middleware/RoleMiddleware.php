<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();

        foreach ($roles as $role) {
            if ($user->role === $role) {
                return $next($request);
            }
            // Special case: k.prodi access via is_kaprodi flag on dosen
            if ($role === 'k.prodi' && $user->role === 'dosen' && $user->dosen && $user->dosen->is_kaprodi) {
                return $next($request);
            }
        }

        abort(403, 'Anda tidak memiliki akses ke halaman ini');
    }
}