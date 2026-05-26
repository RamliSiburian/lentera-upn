<?php

namespace Database\Seeders;

use App\Models\ApprovalConfig;
use Illuminate\Database\Seeder;

class ApprovalConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = \App\Models\User::where('role', 'admin')->first();
        $adminId = $adminUser ? $adminUser->id : null;

        $approvalConfigs = [
            [
                'module_key' => 'judul_pengajuan',
                'label' => 'Approval Pengajuan Judul',
                'steps' => [
                    [
                        'step' => 'verified_admin',
                        'label' => 'Verifikasi Admin',
                        'role' => 'admin',
                        'required' => true,
                    ],
                    [
                        'step' => 'kaprodi_approval',
                        'label' => 'Persetujuan Kaprodi',
                        'role' => 'pimpinan',
                        'required' => true,
                    ],
                ],
            ],
            [
                'module_key' => 'pembimbing',
                'label' => 'Approval Pembimbing',
                'steps' => [
                    [
                        'step' => 'verified_admin',
                        'label' => 'Verifikasi Admin',
                        'role' => 'admin',
                        'required' => true,
                    ],
                    [
                        'step' => 'kaprodi_approval',
                        'label' => 'Persetujuan Kaprodi',
                        'role' => 'pimpinan',
                        'required' => true,
                    ],
                    [
                        'step' => 'dosen_approval',
                        'label' => 'Persetujuan Dosen',
                        'role' => 'dosen',
                        'required' => true,
                    ],
                ],
            ],
            [
                'module_key' => 'bimbingan',
                'label' => 'Approval Bimbingan',
                'steps' => [
                    [
                        'step' => 'pembimbing_review',
                        'label' => 'Review Pembimbing',
                        'role' => 'dosen',
                        'required' => true,
                    ],
                ],
            ],
            [
                'module_key' => 'ujian',
                'label' => 'Approval Ujian',
                'steps' => [
                    [
                        'step' => 'verified_admin',
                        'label' => 'Verifikasi Admin',
                        'role' => 'admin',
                        'required' => true,
                    ],
                    [
                        'step' => 'kaprodi_approval',
                        'label' => 'Persetujuan Kaprodi',
                        'role' => 'pimpinan',
                        'required' => true,
                    ],
                ],
            ],
            [
                'module_key' => 'penilaian',
                'label' => 'Approval Penilaian',
                'steps' => [
                    [
                        'step' => 'penguji_input',
                        'label' => 'Input Nilai Penguji',
                        'role' => 'dosen',
                        'required' => true,
                    ],
                    [
                        'step' => 'kaprodi_approval',
                        'label' => 'Persetujuan Kaprodi',
                        'role' => 'pimpinan',
                        'required' => true,
                    ],
                ],
            ],
        ];

        foreach ($approvalConfigs as $config) {
            ApprovalConfig::updateOrCreate(
                ['module_key' => $config['module_key']],
                [
                    'label' => $config['label'],
                    'steps' => $config['steps'],
                    'is_active' => true,
                    'updated_by' => $adminId,
                ]
            );
        }
    }
}