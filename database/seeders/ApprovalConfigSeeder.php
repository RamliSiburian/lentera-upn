<?php

namespace Database\Seeders;

use App\Models\ApprovalConfig;
use Illuminate\Database\Seeder;

class ApprovalConfigSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = \App\Models\User::where('role', 'admin')->first();
        $adminId   = $adminUser ? $adminUser->id : null;

        $approvalConfigs = [
            // ─── Pengajuan Judul ──────────────────────────────────────
            [
                'module_key' => 'judul_pengajuan',
                'label'      => 'Approval Pengajuan Judul',
                'steps'      => [
                    [
                        'step'     => 'verified_admin',
                        'label'    => 'Verifikasi Admin',
                        'role'     => 'admin',
                        'required' => false,  // opsional: jika false, mahasiswa langsung ke kaprodi
                    ],
                    [
                        'step'     => 'kaprodi_approval',
                        'label'    => 'Persetujuan Kaprodi',
                        'role'     => 'k.prodi',  // ← harus k.prodi, bukan pimpinan
                        'required' => true,
                    ],
                ],
            ],

            // ─── Pembimbing ───────────────────────────────────────────
            [
                'module_key' => 'pembimbing',
                'label'      => 'Approval Pembimbing',
                'steps'      => [
                    [
                        'step'     => 'verified_admin',
                        'label'    => 'Verifikasi Admin',
                        'role'     => 'admin',
                        'required' => false,
                    ],
                    [
                        'step'     => 'kaprodi_approval',
                        'label'    => 'Persetujuan Kaprodi',
                        'role'     => 'k.prodi',
                        'required' => true,
                    ],
                    [
                        'step'     => 'dosen_approval',
                        'label'    => 'Konfirmasi Dosen',
                        'role'     => 'dosen',
                        'required' => true,
                    ],
                ],
            ],

            // ─── Bimbingan ────────────────────────────────────────────
            [
                'module_key' => 'bimbingan',
                'label'      => 'Approval Bimbingan',
                'steps'      => [
                    [
                        'step'     => 'pembimbing_review',
                        'label'    => 'Review Pembimbing',
                        'role'     => 'dosen',
                        'required' => true,
                    ],
                ],
            ],

            // ─── Ujian ────────────────────────────────────────────────
            [
                'module_key' => 'ujian',
                'label'      => 'Approval Ujian',
                'steps'      => [
                    [
                        'step'     => 'verified_admin',
                        'label'    => 'Verifikasi Admin',
                        'role'     => 'admin',
                        'required' => false,
                    ],
                    [
                        'step'     => 'kaprodi_approval',
                        'label'    => 'Persetujuan Kaprodi',
                        'role'     => 'k.prodi',
                        'required' => true,
                    ],
                ],
            ],

            // ─── Penilaian ────────────────────────────────────────────
            [
                'module_key' => 'penilaian',
                'label'      => 'Approval Penilaian',
                'steps'      => [
                    [
                        'step'     => 'penguji_input',
                        'label'    => 'Input Nilai Penguji',
                        'role'     => 'dosen',
                        'required' => true,
                    ],
                    [
                        'step'     => 'kaprodi_approval',
                        'label'    => 'Persetujuan Kaprodi',
                        'role'     => 'k.prodi',
                        'required' => true,
                    ],
                ],
            ],
        ];

        foreach ($approvalConfigs as $config) {
            ApprovalConfig::updateOrCreate(
                ['module_key' => $config['module_key']],
                [
                    'label'      => $config['label'],
                    'steps'      => $config['steps'],
                    'is_active'  => true,
                    'updated_by' => $adminId,
                ]
            );
        }
    }
}