<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin SportHub',
            'email' => 'admin@sporthub.test',
            'password' => 'password',
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'User Demo',
            'email' => 'user@sporthub.test',
            'password' => 'password',
            'role' => 'user',
        ]);

        $this->call(CourtSeeder::class);
    }
}
