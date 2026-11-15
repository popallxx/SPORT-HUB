<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminUserUpdateRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::withCount('bookings')
            ->when($request->query('role'), function ($query, $role) {
                return $query->where('role', $role);
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar user (admin)',
            'data' => $users,
        ]);
    }

    public function update(AdminUserUpdateRequest $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat mengubah role akun sendiri',
                'data' => null,
            ], 422);
        }

        $user->update(['role' => $request->role]);

        return response()->json([
            'success' => true,
            'message' => 'Role user diperbarui',
            'data' => $user,
        ]);
    }
}
