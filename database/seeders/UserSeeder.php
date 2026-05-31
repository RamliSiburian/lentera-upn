<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Mahasiswa;
use App\Models\Dosen;
use App\Models\ProgramStudi;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Admin ────────────────────────────────────────────
        User::create([
            'name'              => 'Administrator',
            'email'             => 'admin@lentera.ac.id',
            'password'          => bcrypt('password'),
            'role'              => 'admin',
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);

        // ─── Ambil prodi yang sudah di-seed ───────────────────
        $si   = ProgramStudi::where('kode', 'SI')->first();
        $if   = ProgramStudi::where('kode', 'IF')->first();
        $sd   = ProgramStudi::where('kode', 'SD')->first();
        $d3si = ProgramStudi::where('kode', 'D3SI')->first();

        // ─── Pimpinan Fakultas ────────────────────────────────
        $pimpinanData = [
            [
                'name'     => 'Prof. Dr. Ir. Supriyanto, ST., M.Sc., IPM',
                'email'    => 'supriyanto@lentera.ac.id',
                'nidn'     => '0001016101',
                'jabatan'  => 'Dekan',
                'kategori' => 'profesor',
            ],
            [
                'name'     => 'Erly Krisnanik, S.Kom.,MM',
                'email'    => 'erly.krisnanik@lentera.ac.id',
                'nidn'     => '0307047401',
                'jabatan'  => 'Wakil Dekan 1',
                'kategori' => 'lektor kepala',
            ],
            [
                'name'     => 'Dr. Bambang Saras Yulistiawan, S.T., M.Kom',
                'email'    => 'bambang.saras@lentera.ac.id',
                'nidn'     => '0321076901',
                'jabatan'  => 'Wakil Dekan 2',
                'kategori' => 'lektor kepala',
            ],
            [
                'name'     => 'Ati Zaidiah, S.Kom, MTI',
                'email'    => 'ati.zaidiah@lentera.ac.id',
                'nidn'     => '0315017101',
                'jabatan'  => 'Wakil Dekan 3',
                'kategori' => 'lektor kepala',
            ],
            [
                'name'     => 'Dr. Widya Cholil, M.I.T',
                'email'    => 'widya.cholil@lentera.ac.id',
                'nidn'     => '0322056801',
                'jabatan'  => 'Ka. Jurusan',
                'kategori' => 'lektor kepala',
            ],
        ];

        foreach ($pimpinanData as $p) {
            $user = User::create([
                'name'              => $p['name'],
                'email'             => $p['email'],
                'password'          => bcrypt('password'),
                'role'              => 'dosen',
                'is_active'         => true,
                'email_verified_at' => now(),
            ]);
            Dosen::create([
                'user_id'         => $user->id,
                'nidn'            => $p['nidn'],
                'bidang_keahlian' => $p['jabatan'],
                'kuota_bimbingan' => 10,
                'is_kaprodi'      => false,
                'is_pimpinan'     => true,
                'kategori'        => $p['kategori'],
            ]);
        }

        // ─── Kaprodi per Program Studi ────────────────────────
        // Dibuat sebagai dosen biasa dulu; is_kaprodi & role akan diupdate
        // saat ProdiSeeder assign kaprodi_id ke tabel program_studi
        $kaprodiData = [
            [
                'name'     => 'Anita Muliawati, S.Kom. M.TI',
                'email'    => 'anita.muliawati@lentera.ac.id',
                'nidn'     => '0312078001',
                'kategori' => 'lektor kepala',
                'prodi_key'=> 'SI',
            ],
            [
                'name'     => "Dr. Ridwan Raafi'udin, S.Kom.,M.Kom",
                'email'    => 'ridwan.raafiudin@lentera.ac.id',
                'nidn'     => '0318097501',
                'kategori' => 'lektor kepala',
                'prodi_key'=> 'IF',
            ],
            [
                'name'     => 'Novi Trisman Hadi, S.Pd., M.Kom.',
                'email'    => 'novi.trisman@lentera.ac.id',
                'nidn'     => '0323118001',
                'kategori' => 'lektor',
                'prodi_key'=> 'SD',
            ],
            [
                'name'     => 'Andhika Octa Indarso, M. MSI',
                'email'    => 'andhika.octa@lentera.ac.id',
                'nidn'     => '0315098501',
                'kategori' => 'lektor',
                'prodi_key'=> 'D3SI',
            ],
        ];

        $prodiMap = [
            'SI' => $si, 'IF' => $if, 'SD' => $sd, 'D3SI' => $d3si,
        ];

        foreach ($kaprodiData as $k) {
            $user = User::create([
                'name'              => $k['name'],
                'email'             => $k['email'],
                'password'          => bcrypt('password'),
                'role'              => 'k.prodi',  // kaprodi mendapat role k.prodi
                'is_active'         => true,
                'email_verified_at' => now(),
            ]);

            $dosen = Dosen::create([
                'user_id'         => $user->id,
                'nidn'            => $k['nidn'],
                'bidang_keahlian' => $prodiMap[$k['prodi_key']]?->nama ?? '',
                'kuota_bimbingan' => 10,
                'is_kaprodi'      => true,
                'is_pimpinan'     => false,
                'kategori'        => $k['kategori'],
            ]);

            // Assign sebagai kaprodi di tabel program_studi
            $prodiMap[$k['prodi_key']]?->update(['kaprodi_id' => $dosen->id]);
        }

        // ─── Dosen Biasa ──────────────────────────────────────
        $dosenData = [
            ['name' => 'Dr. Ahmad Fauzi, M.Kom',         'email' => 'ahmad.fauzi@lentera.ac.id',    'nidn' => '0312079001', 'bidang' => 'Sistem Pakar',               'kuota' => 10, 'kategori' => 'profesor'],
            ['name' => 'Dr. Siti Aminah, M.T',            'email' => 'siti.aminah@lentera.ac.id',    'nidn' => '0319078501', 'bidang' => 'Machine Learning',            'kuota' => 10, 'kategori' => 'lektor kepala'],
            ['name' => 'Dr. Budi Santoso, S.Kom., M.T',  'email' => 'budi.santoso@lentera.ac.id',   'nidn' => '0321079201', 'bidang' => 'Jaringan Komputer',           'kuota' => 10, 'kategori' => 'lektor'],
            ['name' => 'Rina Wijaya, S.Kom., M.T',        'email' => 'rina.wijaya@lentera.ac.id',    'nidn' => '0315089301', 'bidang' => 'Data Mining',                 'kuota' => 8,  'kategori' => 'asisten ahli'],
            ['name' => 'Hendra Kusuma, S.T., M.Kom',      'email' => 'hendra.kusuma@lentera.ac.id',  'nidn' => '0309089401', 'bidang' => 'Rekayasa Perangkat Lunak',    'kuota' => 10, 'kategori' => 'lektor'],
        ];

        foreach ($dosenData as $d) {
            $user = User::create([
                'name'              => $d['name'],
                'email'             => $d['email'],
                'password'          => bcrypt('password'),
                'role'              => 'dosen',
                'is_active'         => true,
                'email_verified_at' => now(),
            ]);
            Dosen::create([
                'user_id'         => $user->id,
                'nidn'            => $d['nidn'],
                'bidang_keahlian' => $d['bidang'],
                'kuota_bimbingan' => $d['kuota'],
                'is_kaprodi'      => false,
                'is_pimpinan'     => false,
                'kategori'        => $d['kategori'],
            ]);
        }

        // ─── Mahasiswa ────────────────────────────────────────
        $mahasiswaData = [
            ['name' => 'Andi Pratama',            'email' => 'andi.pratama@student.lentera.ac.id',         'nim' => '20240001', 'prodi' => $si,   'angkatan' => 2024],
            ['name' => 'Bella Kusumawardani',      'email' => 'bella.kusumawardani@student.lentera.ac.id',  'nim' => '20240002', 'prodi' => $si,   'angkatan' => 2024],
            ['name' => 'Citra Dewi Rahayu',        'email' => 'citra.dewi@student.lentera.ac.id',           'nim' => '20240003', 'prodi' => $if,   'angkatan' => 2024],
            ['name' => 'Doni Setiawan',            'email' => 'doni.setiawan@student.lentera.ac.id',        'nim' => '20240004', 'prodi' => $if,   'angkatan' => 2024],
            ['name' => 'Eka Putri Lestari',        'email' => 'eka.putri@student.lentera.ac.id',            'nim' => '20240005', 'prodi' => $sd,   'angkatan' => 2024],
            ['name' => 'Fajar Nugroho',            'email' => 'fajar.nugroho@student.lentera.ac.id',        'nim' => '20240006', 'prodi' => $d3si, 'angkatan' => 2024],
            ['name' => 'Jhon Doe',                 'email' => 'jhon.doe@student.lentera.ac.id',             'nim' => '20264345302', 'prodi' => $si, 'angkatan' => 2026],
        ];

        foreach ($mahasiswaData as $m) {
            $user = User::create([
                'name'              => $m['name'],
                'email'             => $m['email'],
                'password'          => bcrypt('password'),
                'role'              => 'mahasiswa',
                'is_active'         => true,
                'email_verified_at' => now(),
            ]);
            Mahasiswa::create([
                'user_id'  => $user->id,
                'nim'      => $m['nim'],
                'prodi_id' => $m['prodi']?->id,
                'angkatan' => $m['angkatan'],
                'status'   => 'aktif',
            ]);
        }
    }
}