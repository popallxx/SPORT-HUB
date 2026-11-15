<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminBookingStatusRequest;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::with(['user', 'court', 'payment'])
            ->when($request->query('status'), function ($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Semua booking (admin)',
            'data' => $bookings,
        ]);
    }

    public function show(Booking $booking): JsonResponse
    {
        $booking->load(['user', 'court', 'payment']);

        return response()->json([
            'success' => true,
            'message' => 'Detail booking (admin)',
            'data' => $booking,
        ]);
    }

    public function update(AdminBookingStatusRequest $request, Booking $booking): JsonResponse
    {
        if (in_array($booking->status, ['completed', 'cancelled'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Booking yang sudah selesai atau dibatalkan tidak dapat diubah lagi.',
                'data' => null,
            ], 422);
        }

        $refunded = false;

        DB::transaction(function () use ($request, $booking, &$refunded) {
            if ($request->status === 'cancelled'
                && $booking->payment
                && $booking->payment->payment_status === 'paid') {
                $booking->payment->refund();
                $refunded = true;
            }

            $booking->update(['status' => $request->status]);
        });

        $booking->load(['user', 'court', 'payment']);

        return response()->json([
            'success' => true,
            'message' => $refunded
                ? 'Booking dibatalkan dan pembayaran ditandai refund'
                : 'Status booking diperbarui',
            'data' => $booking,
        ]);
    }
}
