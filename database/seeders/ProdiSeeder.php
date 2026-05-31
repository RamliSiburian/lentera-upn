<?php

namespace Database\Seeders;

use App\Models\ProgramStudi;
use Illuminate\Database\Seeder;

class ProdiSeeder extends Seeder
{
    public function run(): void
    {
        $prodis = [
            [
                'kode'    => 'SI',
                'nama'    => 'Sistem Informasi',
                'jenjang' => 'S1',
                'deskripsi' => 'Program Studi Sistem Informasi berfokus pada pengelolaan informasi dan teknologi informasi untuk mendukung proses bisnis organisasi.',
                'is_active' => true,
            ],
            [
                'kode'    => 'IF',
                'nama'    => 'Informatika',
                'jenjang' => 'S1',
                'deskripsi' => 'Program Studi Informatika berfokus pada ilmu komputer, algoritma, dan pengembangan perangkat lunak.',
                'is_active' => true,
            ],
            [
                'kode'    => 'SD',
                'nama'    => 'Sains Data',
                'jenjang' => 'S1',
                'deskripsi' => 'Program Studi Sains Data berfokus pada analisis data besar, kecerdasan buatan, dan machine learning.',
                'is_active' => true,
            ],
            [
                'kode'    => 'D3SI',
                'nama'    => 'Sistem Informasi',
                'jenjang' => 'D3',
                'deskripsi' => 'Program Diploma 3 Sistem Informasi berfokus pada keahlian praktis di bidang teknologi informasi.',
                'is_active' => true,
            ],
        ];

        foreach ($prodis as $prodi) {
            ProgramStudi::create($prodi);
        }
    }
}
