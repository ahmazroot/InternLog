<?php

namespace App\Http\Controllers;

use App\Models\Magang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MagangController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $magangs = Magang::where('user_id', Auth::id())->get();
        return response()->json($magangs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string',
            'timeline' => 'integer',
            'tempat_magang' => 'nullable|string',
            'tanggal_mulai' => 'nullable|date_format:Y-m-d',
            'tanggal_selesai' => 'nullable|date_format:Y-m-d',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $data = $validator->validated();
        $data['user_id'] = Auth::id();

        if (!isset($data['timeline'])) {
            $data['timeline'] = 0;
        }

        $magang = Magang::create($data);

        return response()->json($magang, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $magang = Magang::find($id);

        if (!$magang || $magang->user_id !== Auth::id()) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        return response()->json($magang);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $magang = Magang::find($id);

        if (!$magang || $magang->user_id !== Auth::id()) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama' => 'required|string',
            'timeline' => 'integer',
            'tempat_magang' => 'nullable|string',
            'tanggal_mulai' => 'nullable|date_format:Y-m-d',
            'tanggal_selesai' => 'nullable|date_format:Y-m-d',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $magang->update($validator->validated());

        return response()->json($magang);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $magang = Magang::find($id);

        if (!$magang || $magang->user_id !== Auth::id()) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $magang->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
