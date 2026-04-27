<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function googleLogin(Request $request)
    {
        return response()->json([
            "message" => "Google login endpoint ready",
            "data" => $request->all()
        ]);
    }
}