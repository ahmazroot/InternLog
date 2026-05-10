<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$secret = env('JWT_SECRET');
echo "Secret: " . var_export($secret, true) . "\n";
echo "Length: " . strlen($secret ?? '') . "\n";

$payload = [
    'user_id' => 1,
    'exp' => time() + 3600
];

try {
    $token = JWT::encode($payload, $secret, 'HS256');
    echo "Token generated successfully.\n";
    $decoded = JWT::decode($token, new Key($secret, 'HS256'));
    echo "Decoded user_id: " . $decoded->user_id . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
