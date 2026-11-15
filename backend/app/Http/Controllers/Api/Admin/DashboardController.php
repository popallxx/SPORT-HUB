<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $data = [
            'total_users' => User::count(),
            'total_courts' => Court::count(),
            'total_bookings' => Booking::count(),
            'bookings_pending' => Booking::where('status', 'pending')->count(),
            'bookings_confirmed' => Booking::where('status', 'confirmed')->count(),
            'bookings_completed' => Booking::where('status', 'completed')->count(),
            'bookings_cancelled' => Booking::where('status', 'cancelled')->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Statistik dashboard',
            'data' => $data,
        ]);
    }
}
