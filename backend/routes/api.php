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

    // Timeline & AI routes
    Route::get('/magang/{magang_id}/timeline', [\App\Http\Controllers\TimelineController::class, 'index']);
    Route::get('/timeline/{id}', [\App\Http\Controllers\TimelineController::class, 'show']);
    Route::put('/timeline/{id}', [\App\Http\Controllers\TimelineController::class, 'update']);
    Route::delete('/timeline/{id}', [\App\Http\Controllers\TimelineController::class, 'destroy']);
    
    Route::get('/magang/{magang_id}/day/{day_number}', [\App\Http\Controllers\TimelineController::class, 'getByDay']);
    Route::post('/magang/{magang_id}/day/{day_number}', [\App\Http\Controllers\TimelineController::class, 'storeByDay']);
    Route::post('/magang/{magang_id}/weekly-summary', [\App\Http\Controllers\TimelineController::class, 'generateWeeklySummary']);
    Route::post('/magang/{magang_id}/final-report', [\App\Http\Controllers\TimelineController::class, 'generateFinalReport']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
