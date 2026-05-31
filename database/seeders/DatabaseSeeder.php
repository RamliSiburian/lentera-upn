<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ProdiSeeder::class,       // harus pertama karena UserSeeder butuh prodi
            UserSeeder::class,
            KonsentrasiSeeder::class,
            RuanganSeeder::class,
            TahapanSeeder::class,
            ApprovalConfigSeeder::class,
        ]);
    }
}