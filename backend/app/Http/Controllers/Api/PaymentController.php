<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentRequest;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function store(PaymentRequest $request, Booking $booking): JsonResponse
    {
        if ($booking->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
                'data' => null,
            ], 403);
        }

        if ($booking->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Booking sudah tidak berstatus pending',
                'data' => null,
            ], 422);
        }

        if ($booking->payment && $booking->payment->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Booking ini sudah dibayar',
                'data' => null,
            ], 422);
        }

        $payment = DB::transaction(function () use ($request, $booking) {
            $booking->load('court');

            $payment = $booking->payment()->create([
                'amount' => $booking->total_price,
                'payment_method' => $request->payment_method,
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);

            $booking->update(['status' => 'confirmed']);

            return $payment;
        });

        $booking->load('payment');

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil, booking dikonfirmasi',
            'data' => $booking,
        ], 201);
    }
}
