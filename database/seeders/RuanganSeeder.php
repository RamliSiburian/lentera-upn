<?php

namespace Database\Seeders;

use App\Models\Ruangan;
use Illuminate\Database\Seeder;

class RuanganSeeder extends Seeder
{
    public function run(): void
    {
        $ruanganData = [
            ['nama_ruangan' => 'Ruang Sidang 1', 'kode_ruangan' => 'RS-01', 'kapasitas' => 30, 'gedung' => 'Gedung A', 'lantai' => 2, 'fasilitas' => 'Proyektor, AC, Whiteboard'],
            ['nama_ruangan' => 'Ruang Sidang 2', 'kode_ruangan' => 'RS-02', 'kapasitas' => 25, 'gedung' => 'Gedung A', 'lantai' => 2, 'fasilitas' => 'Proyektor, AC, Whiteboard'],
            ['nama_ruangan' => 'Ruang Seminar A', 'kode_ruangan' => 'RSE-A', 'kapasitas' => 50, 'gedung' => 'Gedung B', 'lantai' => 3, 'fasilitas' => 'Proyektor, AC, Sound System, Whiteboard'],
            ['nama_ruangan' => 'Ruang Seminar B', 'kode_ruangan' => 'RSE-B', 'kapasitas' => 40, 'gedung' => 'Gedung B', 'lantai' => 3, 'fasilitas' => 'Proyektor, AC, Sound System'],
            ['nama_ruangan' => 'Ruang Rapat 1', 'kode_ruangan' => 'RR-01', 'kapasitas' => 15, 'gedung' => 'Gedung C', 'lantai' => 1, 'fasilitas' => 'AC, Whiteboard, TV'],
            ['nama_ruangan' => 'Aula Besar', 'kode_ruangan' => 'AULA', 'kapasitas' => 100, 'gedung' => 'Gedung Utama', 'lantai' => 1, 'fasilitas' => 'Proyektor, AC, Sound System, Stage'],
        ];

        foreach ($ruanganData as $ruanganInfo) {
            Ruangan::create($ruanganInfo);
        }
    }
}