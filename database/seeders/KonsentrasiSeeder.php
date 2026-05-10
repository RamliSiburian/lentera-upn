<?php

namespace Database\Seeders;

use App\Models\Konsentrasi;
use App\Models\Dosen;
use Illuminate\Database\Seeder;

class KonsentrasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = \App\Models\User::where('role', 'admin')->first();
        $adminId = $adminUser ? $adminUser->id : null;

        $konsentrasiData = [
            [
                'nama' => 'Sistem Pakar',
                'kode' => 'SP',
                'deskripsi' => 'Fokus pada pengembangan sistem cerdas yang meniru kemampuan manusia dalam mengambil keputusan.',
            ],
            [
                'nama' => 'Machine Learning',
                'kode' => 'ML',
                'deskripsi' => 'Fokus pada pengembangan algoritma yang memungkinkan komputer belajar dari data.',
            ],
            [
                'nama' => 'Jaringan Komputer',
                'kode' => 'JK',
                'deskripsi' => 'Fokus pada desain, implementasi, dan keamanan infrastruktur jaringan.',
            ],
            [
                'nama' => 'Data Mining',
                'kode' => 'DM',
                'deskripsi' => 'Fokus pada ekstraksi pola dan pengetahuan dari data dalam jumlah besar.',
            ],
            [
                'nama' => 'Rekayasa Perangkat Lunak',
                'kode' => 'RPL',
                'deskripsi' => 'Fokus pada metodologi pengembangan perangkat lunak yang sistematis.',
            ],
            [
                'nama' => 'Sistem Informasi',
                'kode' => 'SI',
                'deskripsi' => 'Fokus pada integrasi teknologi informasi dengan proses bisnis.',
            ],
        ];

        foreach ($konsentrasiData as $konsentrasiInfo) {
            $konsentrasi = Konsentrasi::create([
                'nama' => $konsentrasiInfo['nama'],
                'kode' => $konsentrasiInfo['kode'],
                'deskripsi' => $konsentrasiInfo['deskripsi'],
                'is_active' => true,
                'created_by' => $adminId,
            ]);

            // Assign dosen to konsentrasi based on their expertise
            $this->assignDosenToKonsentrasi($konsentrasi);
        }
    }

    private function assignDosenToKonsentrasi($konsentrasi)
    {
        // Explicit mapping: dosen bidang_keahlian => konsentrasi names they belong to
        $mapping = [
            'Sistem Pakar'         => ['Sistem Pakar', 'Sistem Informasi'],
            'Machine Learning'     => ['Machine Learning', 'Data Mining'],
            'Jaringan Komputer'    => ['Jaringan Komputer'],
            'Data Mining'          => ['Data Mining', 'Machine Learning'],
            'Sistem Informasi'     => ['Sistem Informasi', 'Rekayasa Perangkat Lunak', 'Sistem Pakar'],
        ];

        $dosenList = Dosen::all();

        foreach ($dosenList as $dosen) {
            $bidang = $dosen->bidang_keahlian;

            if (isset($mapping[$bidang]) && in_array($konsentrasi->nama, $mapping[$bidang])) {
                $dosen->konsentrasi()->syncWithoutDetaching([$konsentrasi->id]);
            }
        }
    }
}