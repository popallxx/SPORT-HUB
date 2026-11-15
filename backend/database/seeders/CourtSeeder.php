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
        $courts = [
            [
                'name' => 'Lapangan 1',
                'type' => 'Badminton',
                'price' => 50000,
                'description' => 'Lapangan badminton standar dengan lantai vinyl anti licin, jaring berkualitas, dan pencahayaan terang.',
                'image' => 'https://placehold.co/800x500/1e88e5/ffffff?text=Badminton',
                'status' => 'active',
            ],
            [
                'name' => 'Lapangan 2',
                'type' => 'Futsal',
                'price' => 100000,
                'description' => 'Lapangan futsal dengan rumput sintetis, gawang lengkap, dan jaring pengaman di sekelilingnya.',
                'image' => 'https://placehold.co/800x500/2e7d32/ffffff?text=Futsal',
                'status' => 'active',
            ],
            [
                'name' => 'Lapangan 3',
                'type' => 'Basket',
                'price' => 120000,
                'description' => 'Lapangan basket outdoor dengan papan ring besi, garis standar FIBA, dan lantai semen halus.',
                'image' => 'https://placehold.co/800x500/f57c00/ffffff?text=Basket',
                'status' => 'active',
            ],
            [
                'name' => 'Lapangan 4',
                'type' => 'Tenis Meja',
                'price' => 30000,
                'description' => 'Meja tenis meja standar internasional lengkap dengan net dan bet.',
                'image' => 'https://placehold.co/800x500/00838f/ffffff?text=Tenis+Meja',
                'status' => 'active',
            ],
            [
                'name' => 'Lapangan 5',
                'type' => 'Voli',
                'price' => 80000,
                'description' => 'Lapangan voli dengan pasir dan net standar, cocok untuk voli pantai.',
                'image' => 'https://placehold.co/800x500/d84315/ffffff?text=Voli',
                'status' => 'active',
            ],
            [
                'name' => 'Lapangan 6',
                'type' => 'Mini Soccer',
                'price' => 150000,
                'description' => 'Lapangan mini soccer berukuran 20x40 meter dengan rumput sintetis premium.',
                'image' => 'https://placehold.co/800x500/6a1b9a/ffffff?text=Mini+Soccer',
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
