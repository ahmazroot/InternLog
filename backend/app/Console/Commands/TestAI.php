<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AIService;

class TestAI extends Command
{
    protected $signature = 'test:ai';
    protected $description = 'Test the AIService';

    public function handle(AIService $aiService)
    {
        $this->info("=== Testing AIService Daily Analysis ===");
        try {
            $result = $aiService->analyzeDaily("Hari ini saya belajar framework Laravel. Sempat kesulitan saat setup database, tapi saya membaca dokumentasi dan akhirnya berhasil. Saya merasa kemampuan problem solving saya meningkat.");
            $this->info("Response dari AI:");
            $this->line(json_encode($result, JSON_PRETTY_PRINT));
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
        }
    }
}
