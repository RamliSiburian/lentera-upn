<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Mahasiswa;
use App\Models\Dosen;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin User
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@lentera.ac.id',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Kaprodi User (role = dosen, is_kaprodi = true)
        $pimpinan = User::create([
            'name' => 'Ketua Program Studi',
            'email' => 'kaprodi@lentera.ac.id',
            'password' => bcrypt('password'),
            'role' => 'dosen',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create Dosen profile for Kaprodi
        Dosen::create([
            'user_id' => $pimpinan->id,
            'nidn' => '12345678901',
            'bidang_keahlian' => 'Sistem Informasi',
            'kuota_bimbingan' => 10,
            'is_kaprodi' => true,
            'kategori' => 'lektor kepala',
        ]);

        // Dosen Users
        $dosenData = [
            [
                'name' => 'Dr. Ahmad Fauzi',
                'email' => 'ahmad.fauzi@lentera.ac.id',
                'nidn' => '12345678902',
                'bidang_keahlian' => 'Sistem Pakar',
                'kuota_bimbingan' => 10,
                'is_kaprodi' => false,
                'kategori' => 'profesor',
            ],
            [
                'name' => 'Dr. Siti Aminah',
                'email' => 'siti.aminah@lentera.ac.id',
                'nidn' => '12345678903',
                'bidang_keahlian' => 'Machine Learning',
                'kuota_bimbingan' => 10,
                'is_kaprodi' => false,
                'kategori' => 'lektor kepala',
            ],
            [
                'name' => 'Dr. Budi Santoso',
                'email' => 'budi.santoso@lentera.ac.id',
                'nidn' => '12345678904',
                'bidang_keahlian' => 'Jaringan Komputer',
                'kuota_bimbingan' => 10,
                'is_kaprodi' => false,
                'kategori' => 'lektor',
            ],
            [
                'name' => 'Dr. Rina Wijaya',
                'email' => 'rina.wijaya@lentera.ac.id',
                'nidn' => '12345678905',
                'bidang_keahlian' => 'Data Mining',
                'kuota_bimbingan' => 10,
                'is_kaprodi' => false,
                'kategori' => 'asisten ahli',
            ],
        ];

        foreach ($dosenData as $dosenInfo) {
            $user = User::create([
                'name' => $dosenInfo['name'],
                'email' => $dosenInfo['email'],
                'password' => bcrypt('password'),
                'role' => 'dosen',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            Dosen::create([
                'user_id' => $user->id,
                'nidn' => $dosenInfo['nidn'],
                'bidang_keahlian' => $dosenInfo['bidang_keahlian'],
                'kuota_bimbingan' => $dosenInfo['kuota_bimbingan'],
                'is_kaprodi' => $dosenInfo['is_kaprodi'],
                'kategori' => $dosenInfo['kategori'],
            ]);
        }

        // Mahasiswa Users
        $mahasiswaData = [
            [
                'name' => 'Andi Pratama',
                'email' => 'andi.pratama@student.lentera.ac.id',
                'nim' => '2024001',
                'program_studi' => 'Teknik Informatika',
                'angkatan' => 2024,
                'status' => 'aktif',
            ],
            [
                'name' => 'Bella Kusumawardani',
                'email' => 'bella.kusumawardani@student.lentera.ac.id',
                'nim' => '2024002',
                'program_studi' => 'Teknik Informatika',
                'angkatan' => 2024,
                'status' => 'aktif',
            ],
            [
                'name' => 'Citra Dewi',
                'email' => 'citra.dewi@student.lentera.ac.id',
                'nim' => '2024003',
                'program_studi' => 'Teknik Informatika',
                'angkatan' => 2024,
                'status' => 'aktif',
            ],
            [
                'name' => 'Doni Setiawan',
                'email' => 'doni.setiawan@student.lentera.ac.id',
                'nim' => '2024004',
                'program_studi' => 'Teknik Informatika',
                'angkatan' => 2024,
                'status' => 'aktif',
            ],
            [
                'name' => 'Eka Putri',
                'email' => 'eka.putri@student.lentera.ac.id',
                'nim' => '2024005',
                'program_studi' => 'Teknik Informatika',
                'angkatan' => 2024,
                'status' => 'aktif',
            ],
        ];

        foreach ($mahasiswaData as $mhsInfo) {
            $user = User::create([
                'name' => $mhsInfo['name'],
                'email' => $mhsInfo['email'],
                'password' => bcrypt('password'),
                'role' => 'mahasiswa',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            Mahasiswa::create([
                'user_id' => $user->id,
                'nim' => $mhsInfo['nim'],
                'program_studi' => $mhsInfo['program_studi'],
                'angkatan' => $mhsInfo['angkatan'],
                'status' => $mhsInfo['status'],
            ]);
        }
    }
}