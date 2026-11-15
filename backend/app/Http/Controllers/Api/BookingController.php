<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookingRequest;
use App\Models\Booking;
use App\Models\Court;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Booking::completePastBookings();

        $bookings = Booking::with(['court', 'payment'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Riwayat booking',
            'data' => $bookings,
        ]);
    }

    public function store(BookingRequest $request): JsonResponse
    {
        $data = $request->validated();

        $court = Court::findOrFail($data['court_id']);

        if ($court->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Lapangan tidak tersedia',
                'data' => null,
            ], 422);
        }

        if ($data['booking_date'] === now()->toDateString()
            && $data['start_time'] <= now()->format('H:i')) {
            return response()->json([
                'success' => false,
                'message' => 'Waktu mulai sudah lewat',
                'data' => null,
            ], 422);
        }

        $start = Carbon::createFromFormat('Y-m-d H:i', $data['booking_date'] . ' ' . $data['start_time']);
        $end = Carbon::createFromFormat('Y-m-d H:i', $data['booking_date'] . ' ' . $data['end_time']);
        $minutes = $start->diffInMinutes($end);
        $totalPrice = round(($court->price / 60) * $minutes, 2);

        $booking = DB::transaction(function () use ($request, $data, $start, $end, $totalPrice) {
            Court::query()->whereKey($data['court_id'])->lockForUpdate()->first();

            $conflict = Booking::where('court_id', $data['court_id'])
                ->where('booking_date', $data['booking_date'])
                ->where('status', '!=', 'cancelled')
                ->where('start_time', '<', $end->format('H:i:s'))
                ->where('end_time', '>', $start->format('H:i:s'))
                ->exists();

            if ($conflict) {
                return null;
            }

            return Booking::create([
                'user_id' => $request->user()->id,
                'court_id' => $data['court_id'],
                'booking_date' => $data['booking_date'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'total_price' => $totalPrice,
                'status' => 'pending',
            ]);
        });

        if (! $booking) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal sudah dibooking untuk lapangan ini',
                'data' => null,
            ], 422);
        }

        $booking->load(['court', 'payment']);

        return response()->json([
            'success' => true,
            'message' => 'Booking berhasil dibuat',
            'data' => $booking,
        ], 201);
    }

    public function show(Request $request, Booking $booking): JsonResponse
    {
        Booking::completePastBookings();
        $booking->refresh();

        if ($booking->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
                'data' => null,
            ], 403);
        }

        $booking->load(['user', 'court', 'payment']);

        return response()->json([
            'success' => true,
            'message' => 'Detail booking',
            'data' => $booking,
        ]);
    }

    public function destroy(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
                'data' => null,
            ], 403);
        }

        if (! in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak dapat dibatalkan',
                'data' => null,
            ], 422);
        }

        $startsAt = Carbon::parse(
            $booking->booking_date->toDateString() . ' ' . $booking->start_time
        );

        if ($startsAt->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Booking yang sudah dimulai tidak dapat dibatalkan.',
                'data' => null,
            ], 422);
        }

        $refunded = false;

        DB::transaction(function () use ($booking, &$refunded) {
            if ($booking->payment && $booking->payment->payment_status === 'paid') {
                $booking->payment->refund();
                $refunded = true;
            }

            $booking->update(['status' => 'cancelled']);
        });

        $booking->load('payment');

        return response()->json([
            'success' => true,
            'message' => $refunded
                ? 'Booking dibatalkan. Pembayaran ditandai refund dan diproses manual oleh admin.'
                : 'Booking dibatalkan',
            'data' => $booking,
        ]);
    }
}
