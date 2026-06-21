<?php

namespace App\Http\Controllers;

use App\Models\Magang;
use App\Models\Timeline;
use App\Jobs\AnalyzeDailyActivityJob;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TimelineController extends Controller
{
    public function index($magang_id)
    {
        $magang = Magang::where('id', $magang_id)->where('user_id', Auth::id())->first();
        if (!$magang) {
            return response()->json(['message' => 'Magang not found'], 404);
        }

        $timelines = Timeline::where('magang_id', $magang_id)->orderBy('day_number', 'asc')->get();
        return response()->json($timelines);
    }

    public function show($id)
    {
        $timeline = Timeline::where('id', $id)->first();
        if (!$timeline) {
            return response()->json(['message' => 'Timeline not found'], 404);
        }

        $magang = Magang::where('id', $timeline->magang_id)->where('user_id', Auth::id())->first();
        if (!$magang) {
            return response()->json(['message' => 'Timeline not found'], 404);
        }

        return response()->json($timeline);
    }

    public function update(Request $request, $id)
    {
        $timeline = Timeline::where('id', $id)->first();
        if (!$timeline) {
            return response()->json(['message' => 'Timeline not found'], 404);
        }

        $magang = Magang::where('id', $timeline->magang_id)->where('user_id', Auth::id())->first();
        if (!$magang) {
            return response()->json(['message' => 'Timeline not found'], 404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $timeline->update([
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return response()->json($timeline);
    }

    public function destroy($id)
    {
        $timeline = Timeline::where('id', $id)->first();
        if (!$timeline) {
            return response()->json(['message' => 'Timeline not found'], 404);
        }

        $magang = Magang::where('id', $timeline->magang_id)->where('user_id', Auth::id())->first();
        if (!$magang) {
            return response()->json(['message' => 'Timeline not found'], 404);
        }

        $timeline->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function getByDay($magang_id, $day_number)
    {
        $magang = Magang::where('id', $magang_id)->where('user_id', Auth::id())->first();
        if (!$magang) {
            return response()->json(['message' => 'Magang not found'], 404);
        }

        $timeline = Timeline::where('magang_id', $magang_id)->where('day_number', $day_number)->first();
        
        if (!$timeline) {
            // Return skeleton based on specs
            return response()->json([
                'magang_id' => (int) $magang_id,
                'day_number' => (int) $day_number,
                'description' => '',
                'ai_status' => 'pending'
            ]);
        }

        return response()->json($timeline);
    }

    public function storeByDay(Request $request, $magang_id, $day_number)
    {
        $magang = Magang::where('id', $magang_id)->where('user_id', Auth::id())->first();
        if (!$magang) {
            return response()->json(['message' => 'Magang not found'], 404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $timeline = Timeline::where('magang_id', $magang_id)->where('day_number', $day_number)->first();

        $isDescriptionChanged = false;

        if ($timeline) {
            if ($timeline->description !== $request->description && !empty($request->description)) {
                $isDescriptionChanged = true;
            }
            $timeline->update([
                'title' => $request->title,
                'description' => $request->description,
                'ai_status' => $isDescriptionChanged ? 'pending' : $timeline->ai_status,
            ]);
        } else {
            $timeline = Timeline::create([
                'magang_id' => $magang_id,
                'day_number' => $day_number,
                'title' => $request->title,
                'description' => $request->description,
                'ai_status' => 'pending',
            ]);
            if (!empty($request->description)) {
                $isDescriptionChanged = true;
            }
        }

        if ($isDescriptionChanged) {
            AnalyzeDailyActivityJob::dispatch($timeline);
        }

        return response()->json($timeline, 200);
    }

    public function generateWeeklySummary(Request $request, $magang_id, AIService $aiService)
    {
        $magang = Magang::where('id', $magang_id)->where('user_id', Auth::id())->first();
        if (!$magang) {
            return response()->json(['message' => 'Magang not found'], 404);
        }

        $request->validate([
            'week_number' => 'required|integer|min:1',
        ]);

        $weekNumber = $request->week_number;
        $startDay = ($weekNumber - 1) * 7 + 1;
        $endDay = $weekNumber * 7;

        $timelines = Timeline::where('magang_id', $magang_id)
            ->whereBetween('day_number', [$startDay, $endDay])
            ->get();

        $hasAnalyzedData = $timelines->where('ai_status', 'done')->isNotEmpty();

        if (!$hasAnalyzedData) {
            return response()->json([
                'message' => 'Belum ada catatan harian yang dianalisis oleh AI untuk minggu ini.'
            ], 422);
        }

        // Prepare data for AI
        $timelineData = $timelines->map(function ($t) {
            return [
                'day_number' => $t->day_number,
                'title' => $t->title,
                'description' => $t->description,
                'ai_feedback' => $t->ai_feedback,
            ];
        })->toArray();

        try {
            $summary = $aiService->generateWeeklySummary($timelineData);
            return response()->json($summary);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to generate weekly summary: ' . $e->getMessage()], 500);
        }
    }

    public function generateFinalReport(Request $request, $magang_id, AIService $aiService)
    {
        $magang = Magang::where('id', $magang_id)->where('user_id', Auth::id())->first();
        if (!$magang) {
            return response()->json(['message' => 'Magang not found'], 404);
        }

        $timelines = Timeline::where('magang_id', $magang_id)
            ->where('ai_status', 'done')
            ->get();

        if ($timelines->isEmpty()) {
            return response()->json([
                'message' => 'Belum ada catatan harian yang selesai dianalisis oleh AI untuk magang ini.'
            ], 422);
        }

        $timelineData = $timelines->map(function ($t) {
            return [
                'day_number' => $t->day_number,
                'title' => $t->title,
                'description' => $t->description,
                'ai_feedback' => $t->ai_feedback,
            ];
        })->toArray();

        $magangInfo = [
            'nama' => Auth::user()->name,
            'tempat_magang' => $magang->tempat_magang ?? 'Tidak diketahui',
            'tanggal_mulai' => $magang->tanggal_mulai ?? 'Tidak diketahui',
            'tanggal_selesai' => $magang->tanggal_selesai ?? 'Tidak diketahui',
            'total_hari' => $timelines->count(),
        ];

        try {
            $report = $aiService->generateFinalReport($timelineData, $magangInfo);
            
            return response()->json([
                'magang_id' => $magang->id,
                'magang_info' => $magangInfo,
                'total_analyzed_days' => $timelines->count(),
                'report' => $report,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to generate final report: ' . $e->getMessage()], 500);
        }
    }
}
