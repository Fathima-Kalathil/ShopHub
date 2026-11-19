<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Token;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create($data); // password is hashed by the model cast

        return response()->json(['token' => Token::issue($user), 'user' => $user->toApi()], 201);
    }

    public function login(Request $request)
    {
        $email = strtolower(trim((string) $request->input('email')));
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check((string) $request->input('password'), $user->password)) {
            return response()->json(['message' => 'Email or password is incorrect'], 401);
        }

        return response()->json(['token' => Token::issue($user), 'user' => $user->toApi()]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->toApi());
    }
}
