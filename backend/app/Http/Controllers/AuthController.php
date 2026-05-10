<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;
use Firebase\JWT\JWT;

class AuthController extends Controller
{
    public function googleLogin(Request $request)
    {
        $request->validate([
            'access_token' => 'required|string',
        ]);

        try {
            $socialUser = Socialite::driver('google')->userFromToken($request->access_token);

            $user = User::firstOrCreate(
                ['email' => $socialUser->getEmail()],
                [
                    'name' => $socialUser->getName(),
                    'google_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                    'password' => bcrypt(str()->random(16))
                ]
            );

            $payload = [
                'user_id' => $user->id,
                'exp' => time() + (5 * 60 * 60) // 5 hours
            ];

            $token = JWT::encode($payload, env('JWT_SECRET'), 'HS256');

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'access_token' => $token
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Google login error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Invalid credentials or token'], 401);
        }
    }

    public function me()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => auth()->user()
            ]
        ]);
    }
}