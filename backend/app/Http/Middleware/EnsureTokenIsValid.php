<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class EnsureTokenIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthorized: Token not provided'], 401);
        }

        try {
            $payload = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));

            $user = User::find($payload->user_id);

            if (!$user) {
                return response()->json(['message' => 'Unauthorized: User not found'], 401);
            }

            Auth::login($user);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Unauthorized: Invalid token'], 401);
        }

        return $next($request);
    }
}
