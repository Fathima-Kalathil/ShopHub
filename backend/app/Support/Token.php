<?php

namespace App\Support;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Token
{
    public static function issue(User $user): string
    {
        $now = time();
        return JWT::encode([
            'sub' => $user->id,
            'role' => $user->role,
            'iat' => $now,
            'exp' => $now + config('jwt.ttl'),
        ], config('jwt.secret'), 'HS256');
    }

    public static function decode(string $token): object
    {
        return JWT::decode($token, new Key(config('jwt.secret'), 'HS256'));
    }
}
