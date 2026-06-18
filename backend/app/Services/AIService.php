<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    private $openRouterApiKey;
    private $geminiApiKey;
    private $groqApiKey;
    private $primaryModel = 'google/gemini-1.5-flash';
    private $fallbackModel = 'llama-3.3-70b-versatile';

    public function __construct()
    {
        $this->openRouterApiKey = env('OPENROUTER_API_KEY');
        $this->geminiApiKey = env('GEMINI_API_KEY');
        $this->groqApiKey = env('GROQ_API_KEY');
    }

    public function analyzeDaily(string $catatanHarian)
    {
        $systemPrompt = <<<EOT
Kamu adalah asisten AI untuk aplikasi InternLog — aplikasi catatan harian magang mahasiswa. Tugasmu adalah menganalisis catatan harian aktivitas magang yang ditulis mahasiswa dalam bahasa Indonesia, lalu mengekstrak informasi terstruktur.

Aturan:
1. Selalu balas dalam format JSON yang valid, tanpa backtick, tanpa markdown, tanpa penjelasan tambahan.
2. Identifikasi skill yang berkembang dari aktivitas yang diceritakan, bukan dari apa yang mahasiswa "ingin" pelajari.
3. Bedakan antara soft skill (komunikasi, kerja tim, manajemen waktu, problem solving, adaptasi, kepemimpinan, dll) dan hard skill (skill teknis spesifik seperti coding, desain, analisis data, dll).
4. Jika catatan terlalu singkat atau tidak jelas, tetap berikan analisis sebaik mungkin berdasarkan informasi yang ada.
5. Gunakan bahasa Indonesia untuk semua output.
EOT;

        $userPrompt = <<<EOT
Analisis catatan harian magang berikut dan ekstrak informasi terstruktur.

CATATAN HARIAN:
---
{$catatanHarian}
---

Balas HANYA dalam format JSON berikut:
{
  "tanggal_analisis": "YYYY-MM-DD",
  "kategori_aktivitas": "string (pilih satu: Administratif, Teknis, Kreatif, Riset, Komunikasi, Manajerial, Pembelajaran)",
  "ringkasan_aktivitas": "string (1-2 kalimat rangkuman inti aktivitas hari ini)",
  "soft_skills": [
    {
      "nama_skill": "string",
      "bukti": "string (kutip bagian catatan yang menunjukkan skill ini)"
    }
  ],
  "hard_skills": [
    {
      "nama_skill": "string",
      "bukti": "string (kutip bagian catatan yang menunjukkan skill ini)"
    }
  ],
  "pembelajaran_utama": [
    "string (poin pembelajaran yang diperoleh hari ini)"
  ],
  "tantangan": "string (tantangan yang dihadapi, atau 'Tidak disebutkan' jika tidak ada)",
  "skor_produktivitas": 1 (skala 1-5 berdasarkan performa/beban kerja)
}
EOT;

        return $this->callAI($systemPrompt, $userPrompt);
    }

    public function generateWeeklySummary(array $timelineData)
    {
        $systemPrompt = <<<EOT
Kamu adalah asisten AI untuk aplikasi InternLog. Tugasmu merangkum catatan harian magang selama seminggu ke dalam sebuah ringkasan komprehensif berformat JSON.

Aturan:
1. Selalu balas dalam format JSON yang valid, tanpa backtick, tanpa markdown, tanpa penjelasan tambahan.
2. Analisis sentimen keseluruhan, skill dominan, dan area yang perlu ditingkatkan berdasarkan kumpulan catatan harian yang diberikan.
EOT;

        $timelineJson = json_encode($timelineData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        $userPrompt = <<<EOT
Berikut adalah kumpulan catatan harian magang selama 1 minggu beserta hasil analisis skill-nya. Buatkan ringkasan mingguan.

DATA MINGGU INI:
---
{$timelineJson}
---

Balas HANYA dalam format JSON berikut:
{
  "periode": "string (contoh: Minggu ke-3, 1-5 April 2026)",
  "ringkasan_minggu": "string (3-5 kalimat rangkuman keseluruhan minggu ini)",
  "highlight_aktivitas": [
    "string (aktivitas paling menonjol/penting minggu ini)"
  ],
  "soft_skills_dominan": [
    {
      "nama_skill": "string",
      "frekuensi": 0,
      "tren": "string (Meningkat / Stabil / Baru Muncul)"
    }
  ],
  "hard_skills_dominan": [
    {
      "nama_skill": "string",
      "frekuensi": 0,
      "tren": "string (Meningkat / Stabil / Baru Muncul)"
    }
  ],
  "perkembangan_utama": "string (hal terpenting yang berkembang pada mahasiswa minggu ini)",
  "area_perbaikan": "string (area yang masih perlu ditingkatkan berdasarkan catatan)",
  "skor_produktivitas_rata_rata": 0
}
EOT;

        return $this->callAI($systemPrompt, $userPrompt);
    }

    public function generateFinalReport(array $timelineData, array $magangInfo)
    {
        $systemPrompt = <<<EOT
Kamu adalah asisten AI untuk aplikasi InternLog. Tugasmu merangkum seluruh catatan harian magang selama periode magang ke dalam sebuah laporan akhir komprehensif berformat JSON.

Aturan:
1. Selalu balas dalam format JSON yang valid, tanpa backtick, tanpa markdown, tanpa penjelasan tambahan.
2. Analisis seluruh data yang diberikan untuk menghasilkan narasi yang profesional.
EOT;

        $timelineJson = json_encode($timelineData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        $userPrompt = <<<EOT
Berikut adalah seluruh data ringkasan bulanan selama periode magang mahasiswa. Buatkan narasi laporan akhir magang yang terstruktur.

DATA SELURUH PERIODE MAGANG:
---
{$timelineJson}
---

INFORMASI TAMBAHAN:
- Nama mahasiswa: {$magangInfo['nama']}
- Tempat magang: {$magangInfo['tempat_magang']}
- Periode: {$magangInfo['tanggal_mulai']} s/d {$magangInfo['tanggal_selesai']}
- Total hari tercatat: {$magangInfo['total_hari']}

Balas HANYA dalam format JSON berikut:
{
  "judul_laporan": "string",
  "ringkasan_eksekutif": "string (paragraf 5-7 kalimat merangkum seluruh pengalaman magang)",
  "perjalanan_magang": [
    {
      "periode": "string (bulan/tahap)",
      "narasi": "string (2-3 kalimat tentang perkembangan di periode tersebut)"
    }
  ],
  "total_soft_skills": [
    {
      "nama_skill": "string",
      "level_akhir": "string (Pemula / Berkembang / Kompeten / Mahir)",
      "deskripsi_perkembangan": "string (1 kalimat)"
    }
  ],
  "total_hard_skills": [
    {
      "nama_skill": "string",
      "level_akhir": "string (Pemula / Berkembang / Kompeten / Mahir)",
      "deskripsi_perkembangan": "string (1 kalimat)"
    }
  ],
  "pencapaian_terbaik": ["string"],
  "tantangan_terbesar": ["string"],
  "refleksi_keseluruhan": "string (paragraf 3-5 kalimat refleksi akhir tentang dampak magang)",
  "rekomendasi_karir": "string (saran arah karir berdasarkan pola skill yang berkembang)"
}
EOT;

        $heavyModel = 'google/gemini-2.0-flash-001';
        
        return $this->callAI($systemPrompt, $userPrompt, [$heavyModel, $this->fallbackModel]);
    }

    private function callAI(string $systemPrompt, string $userPrompt, ?array $openRouterModelsToTry = null)
    {
        // 1. Try OpenRouter (Utama)
        if ($this->openRouterApiKey) {
            $modelsToTry = $openRouterModelsToTry ?? [$this->primaryModel, $this->fallbackModel];

            foreach ($modelsToTry as $model) {
                try {
                    $response = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $this->openRouterApiKey,
                        'Content-Type' => 'application/json',
                        'HTTP-Referer' => config('app.url'),
                        'X-Title' => config('app.name'),
                    ])->timeout(30)->post('https://openrouter.ai/api/v1/chat/completions', [
                        'model' => $model,
                        'messages' => [
                            ['role' => 'system', 'content' => $systemPrompt],
                            ['role' => 'user', 'content' => $userPrompt],
                        ]
                    ]);

                    if ($response->successful()) {
                        $content = $response->json('choices.0.message.content');
                        return $this->cleanJsonOutput($content);
                    }
                    
                    Log::warning("OpenRouter API request failed for model {$model}: " . $response->body());
                } catch (\Exception $e) {
                    Log::error("Exception when calling OpenRouter with model {$model}: " . $e->getMessage());
                }
            }
        } else {
            Log::warning("OPENROUTER_API_KEY is not configured, skipping OpenRouter.");
        }

        // 2. Try Gemini Direct API (Fallback 1)
        if ($this->geminiApiKey) {
            try {
                Log::info("Attempting Gemini Direct API as Fallback 1");
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->timeout(30)->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . $this->geminiApiKey, [
                    'system_instruction' => [
                        'parts' => [
                            ['text' => $systemPrompt]
                        ]
                    ],
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $userPrompt]
                            ]
                        ]
                    ]
                ]);

                if ($response->successful()) {
                    $content = $response->json('candidates.0.content.parts.0.text');
                    return $this->cleanJsonOutput($content);
                }
                
                Log::warning("Gemini Direct API request failed: " . $response->body());
            } catch (\Exception $e) {
                Log::error("Exception when calling Gemini Direct API: " . $e->getMessage());
            }
        } else {
            Log::warning("GEMINI_API_KEY is not configured, skipping Gemini Direct API.");
        }

        // 3. Try Groq Direct API (Fallback 2)
        if ($this->groqApiKey) {
            try {
                Log::info("Attempting Groq Direct API as Fallback 2");
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->groqApiKey,
                    'Content-Type' => 'application/json',
                ])->timeout(30)->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.3-70b-versatile',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt],
                    ]
                ]);

                if ($response->successful()) {
                    $content = $response->json('choices.0.message.content');
                    return $this->cleanJsonOutput($content);
                }
                
                Log::warning("Groq Direct API request failed: " . $response->body());
            } catch (\Exception $e) {
                Log::error("Exception when calling Groq Direct API: " . $e->getMessage());
            }
        } else {
            Log::warning("GROQ_API_KEY is not configured, skipping Groq Direct API.");
        }

        throw new \Exception("All AI models and fallback providers failed to generate a response.");
    }

    private function cleanJsonOutput(?string $content): array
    {
        if (!$content) {
            throw new \Exception("Empty response from AI");
        }

        // Hapus format markdown jika AI membalas dengan markdown
        $content = preg_replace('/^```json/m', '', $content);
        $content = preg_replace('/^```/m', '', $content);
        $content = trim($content);

        $json = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error("Failed to parse AI JSON response: " . json_last_error_msg() . " | Raw content: " . $content);
            throw new \Exception("Invalid JSON format from AI");
        }

        return $json;
    }
}
