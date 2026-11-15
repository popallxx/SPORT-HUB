<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CourtRequest;
use App\Models\Court;
use Illuminate\Http\JsonResponse;

class CourtController extends Controller
{
    public function index(): JsonResponse
    {
        $courts = Court::withCount('bookings')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar lapangan (admin)',
            'data' => $courts,
        ]);
    }

    public function store(CourtRequest $request): JsonResponse
    {
        $court = Court::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Lapangan berhasil ditambahkan',
            'data' => $court,
        ], 201);
    }

    public function update(CourtRequest $request, Court $court): JsonResponse
    {
        $court->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Lapangan berhasil diperbarui',
            'data' => $court,
        ]);
    }

    public function destroy(Court $court): JsonResponse
    {
        $bookingCount = $court->bookings()->count();

        if ($bookingCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Lapangan tidak dapat dihapus karena sudah memiliki {$bookingCount} booking. Nonaktifkan lapangan ini sebagai gantinya.",
                'data' => null,
            ], 422);
        }

        $court->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lapangan berhasil dihapus',
            'data' => null,
        ]);
    }
}
