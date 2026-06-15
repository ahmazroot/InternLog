<?php

namespace App\Jobs;

use App\Models\Timeline;
use App\Services\AIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AnalyzeDailyActivityJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeline;
    public $tries = 5;

    public function backoff(): array
    {
        return [5, 15, 45, 135];
    }

    /**
     * Create a new job instance.
     */
    public function __construct(Timeline $timeline)
    {
        $this->timeline = $timeline;
    }

    /**
     * Execute the job.
     */
    public function handle(AIService $aiService): void
    {
        if (empty($this->timeline->description)) {
            $this->timeline->update(['ai_status' => 'skipped']);
            return;
        }

        try {
            $this->timeline->update(['ai_status' => 'processing']);

            $plainTextDescription = $this->extractPlainText($this->timeline->description);

            $feedback = $aiService->analyzeDaily($plainTextDescription);

            $this->timeline->update([
                'ai_feedback' => $feedback,
                'ai_status' => 'done',
                'ai_analyzed_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to analyze timeline ID {$this->timeline->id}: " . $e->getMessage());
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        $this->timeline->update(['ai_status' => 'failed']);
    }

    private function extractPlainText(string $description): string
    {
        $data = json_decode($description, true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
            return $description;
        }

        $text = '';
        foreach ($data as $block) {
            if (isset($block['content']) && is_array($block['content'])) {
                foreach ($block['content'] as $contentItem) {
                    if (isset($contentItem['text'])) {
                        $text .= $contentItem['text'];
                    }
                }
            }
            $text .= "\n";
        }
        return trim($text);
    }
}
