<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\Token;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $deny = fn () => response()->json(['message' => 'Please log in to continue'], 401);

        $token = $request->bearerToken();
        if (!$token) {
            return $deny();
        }

        try {
            $payload = Token::decode($token);
        } catch (\Throwable $e) {
            return $deny();
        }

        $user = User::find($payload->sub);
        if (!$user) {
            return $deny();
        }

        $request->setUserResolver(fn () => $user);
        return $next($request);
    }
}
