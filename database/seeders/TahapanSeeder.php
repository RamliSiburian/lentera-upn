<?php

namespace Database\Seeders;

use App\Models\TahapanConfig;
use Illuminate\Database\Seeder;

class TahapanSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = \App\Models\User::where('role', 'admin')->first();
        $adminId = $adminUser ? $adminUser->id : null;

        $tahapanData = [
            ['nama_tahapan' => 'Bimbingan Bab 1', 'kode' => 'BAB1', 'urutan' => 1, 'tipe' => 'bimbingan', 'min_bab_acc' => null, 'deskripsi' => 'Pendahuluan'],
            ['nama_tahapan' => 'Bimbingan Bab 2', 'kode' => 'BAB2', 'urutan' => 2, 'tipe' => 'bimbingan', 'min_bab_acc' => null, 'deskripsi' => 'Tinjauan Pustaka'],
            ['nama_tahapan' => 'Bimbingan Bab 3', 'kode' => 'BAB3', 'urutan' => 3, 'tipe' => 'bimbingan', 'min_bab_acc' => null, 'deskripsi' => 'Metodologi Penelitian'],
            ['nama_tahapan' => 'Bimbingan Bab 4', 'kode' => 'BAB4', 'urutan' => 4, 'tipe' => 'bimbingan', 'min_bab_acc' => null, 'deskripsi' => 'Hasil dan Pembahasan'],
            ['nama_tahapan' => 'Bimbingan Bab 5', 'kode' => 'BAB5', 'urutan' => 5, 'tipe' => 'bimbingan', 'min_bab_acc' => null, 'deskripsi' => 'Penutup'],
            ['nama_tahapan' => 'Seminar Proposal', 'kode' => 'SEMPRO', 'urutan' => 6, 'tipe' => 'ujian', 'min_bab_acc' => 3, 'deskripsi' => 'Presentasi proposal penelitian'],
            ['nama_tahapan' => 'Seminar Hasil', 'kode' => 'SEMHAS', 'urutan' => 7, 'tipe' => 'ujian', 'min_bab_acc' => 5, 'deskripsi' => 'Presentasi hasil penelitian'],
            ['nama_tahapan' => 'Sidang Tugas Akhir', 'kode' => 'SIDANG', 'urutan' => 8, 'tipe' => 'ujian', 'min_bab_acc' => 5, 'deskripsi' => 'Ujian akhir tugas akhir'],
        ];

        foreach ($tahapanData as $tahapanInfo) {
            TahapanConfig::create([
                ...$tahapanInfo,
                'is_active' => true,
                'created_by' => $adminId,
            ]);
        }
    }
}