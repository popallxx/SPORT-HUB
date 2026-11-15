<?php

namespace Database\Seeders;

use App\Models\Court;
use Illuminate\Database\Seeder;

class CourtSeeder extends Seeder
{
    /**
     * Seed the application's court data.
     */
    public function run(): void
    {
        // Hanya untuk instalasi baru. Jangan sentuh data lapangan yang
        // sudah dikelola admin kalau database sudah berisi data.
        if (Court::query()->exists()) {
            return;
        }

        $courts = [
            [
                'name' => 'Lapangan 1',
                'type' => 'Badminton',
                'price' => 50000,
                'description' => 'Lapangan badminton standar dengan lantai vinyl anti licin, jaring berkualitas, dan pencahayaan terang.',
                'image' => '/courts/badminton.svg',
                'status' => 'active',
            ],
            [
                'name' => 'Lapangan 2',
                'type' => 'Futsal',
                'price' => 100000,
                'description' => 'Lapangan futsal dengan rumput sintetis, gawang lengkap, dan jaring pengaman di sekelilingnya.',
                'image' => '/courts/futsal.svg',
                'status' => 'active',
            ],
            [
                'name' => 'Lapangan 3',
                'type' => 'Basket',
                'price' => 120000,
                'description' => 'Lapangan basket outdoor dengan papan ring besi, garis standar FIBA, dan lantai semen halus.',
                'image' => '/courts/basket.svg',
                'status' => 'active',
            ],
            [
                'name' => 'Lapangan 4',
                'type' => 'Tenis Meja',
                'price' => 30000,
                'description' => 'Meja tenis meja standar internasional lengkap dengan net dan bet.',
                'image' => '/courts/table-tennis.svg',
                'status' => 'active',
            ],
            [
                'name' => 'Lapangan 5',
                'type' => 'Voli',
                'price' => 80000,
                'description' => 'Lapangan voli dengan pasir dan net standar, cocok untuk voli pantai.',
                'image' => '/courts/volleyball.svg',
                'status' => 'active',
            ],
            [
                'name' => 'Lapangan 6',
                'type' => 'Mini Soccer',
                'price' => 150000,
                'description' => 'Lapangan mini soccer berukuran 20x40 meter dengan rumput sintetis premium.',
                'image' => '/courts/mini-soccer.svg',
                'status' => 'active',
            ],
        ];

        foreach ($courts as $court) {
            Court::updateOrCreate(
                ['name' => $court['name']],
                $court,
            );
        }
    }
}
