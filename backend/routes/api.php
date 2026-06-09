<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MagangController;

Route::post('/auth/google', [AuthController::class, 'googleLogin']);

Route::middleware(['auth.manual'])->group(function () {
    Route::get('/user/me', [AuthController::class, 'me']);
    
    // Magang routes
    Route::get('/magang', [MagangController::class, 'index']);
    Route::post('/magang', [MagangController::class, 'store']);
    Route::get('/magang/{id}', [MagangController::class, 'show']);
    Route::put('/magang/{id}', [MagangController::class, 'update']);
    Route::delete('/magang/{id}', [MagangController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
