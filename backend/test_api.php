<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Http;

try {
    $user = User::firstOrCreate(
        ['email' => 'test_api@example.com'],
        ['name' => 'API Tester', 'password' => bcrypt('password')]
    );

    $payload = [
        'user_id' => $user->id,
        'exp' => time() + 3600
    ];
    $token = JWT::encode($payload, env('JWT_SECRET'), 'HS256');

    echo "--- 1. TOKEN GENERATED ---\n\n";

    $headers = [
        'Authorization' => 'Bearer ' . $token,
        'Accept' => 'application/json'
    ];

    echo "--- 2. CREATING MAGANG ---\n";
    $res = Http::withHeaders($headers)->post('http://127.0.0.1:8000/api/magang', [
        'nama' => 'Magang Test',
        'tempat_magang' => 'PT Test',
        'tanggal_mulai' => '2024-01-01',
        'tanggal_selesai' => '2024-02-01'
    ]);
    echo $res->body() . "\n\n";
    $magangId = $res->json('id') ?? 1;

    echo "--- 3. CREATING TIMELINE DAY 1 ---\n";
    $res = Http::withHeaders($headers)->post('http://127.0.0.1:8000/api/magang/' . $magangId . '/day/1', [
        'title' => 'Hari 1',
        'description' => 'Hari ini saya belajar Laravel.'
    ]);
    echo $res->body() . "\n\n";

    echo "--- 4. WAITING 10 SECONDS FOR AI JOB TO FINISH ---\n";
    sleep(10);

    echo "--- 5. CHECKING TIMELINE DAY 1 (AI STATUS) ---\n";
    $res = Http::withHeaders($headers)->get('http://127.0.0.1:8000/api/magang/' . $magangId . '/day/1');
    echo $res->body() . "\n\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
