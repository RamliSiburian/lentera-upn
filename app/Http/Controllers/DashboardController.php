<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $kaprodiStats = [
            'total_mahasiswa' => \App\Models\Mahasiswa::count(),
            'total_dosen' => \App\Models\Dosen::count(),
            'total_judul_pending' => 0,
            'total_bimbingan_aktif' => 0,
        ];

        $stats = match($user->role) {
            'admin' => [
                'total_mahasiswa' => \App\Models\Mahasiswa::count(),
                'total_dosen' => \App\Models\Dosen::count(),
                'total_judul_pending' => 0,
                'total_bimbingan_aktif' => 0,
            ],
            'pimpinan' => [
                'total_mahasiswa' => \App\Models\Mahasiswa::count(),
                'total_dosen' => \App\Models\Dosen::count(),
                'total_judul_pending' => 0,
                'total_bimbingan_aktif' => 0,
            ],
            'dosen' => $user->isKaprodi() ? $kaprodiStats : [
                'total_bimbingan' => 0,
                'total_mahasiswa_bimbingan' => 0,
            ],
            'mahasiswa' => [
                'status_bimbingan' => 'belum_mulai',
                'judul_disetujui' => false,
            ],
            default => [],
        };

        return Inertia::render('Dashboard', [
            'stats' => $stats,
        ]);
    }
}