<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourtController extends Controller
{
    public function index(): JsonResponse
    {
        $courts = Court::where('status', 'active')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar lapangan',
            'data' => $courts,
        ]);
    }

    public function show(Court $court): JsonResponse
    {
        if ($court->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Lapangan tidak ditemukan',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail lapangan',
            'data' => $court,
        ]);
    }

    public function slots(Court $court, Request $request): JsonResponse
    {
        $date = $request->query('date', now()->toDateString());

        if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return response()->json([
                'success' => false,
                'message' => 'Format tanggal tidak valid',
                'data' => null,
            ], 422);
        }

        $booked = Booking::where('court_id', $court->id)
            ->where('booking_date', $date)
            ->where('status', '!=', 'cancelled')
            ->get(['start_time', 'end_time']);

        $openingHour = 7;
        $closingHour = 22;
        $today = now()->toDateString();
        $nowTime = now()->format('H:i');

        $slots = [];
        for ($hour = $openingHour; $hour < $closingHour; $hour++) {
            $start = sprintf('%02d:00', $hour);
            $end = sprintf('%02d:00', $hour + 1);

            $available = true;
            foreach ($booked as $b) {
                if ($start < $b->end_time && $end > $b->start_time) {
                    $available = false;
                    break;
                }
            }

            $isPast = $date === $today && $start <= $nowTime;

            $slots[] = [
                'start_time' => $start,
                'end_time' => $end,
                'available' => $available,
                'past' => $isPast,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Slot ketersediaan lapangan',
            'data' => [
                'court' => $court,
                'date' => $date,
                'slots' => $slots,
            ],
        ]);
    }
}
