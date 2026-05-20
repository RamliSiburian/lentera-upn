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

        $totalMahasiswa = \App\Models\Mahasiswa::where('status', '!=', 'keluar')->count();
        $totalLulus = \App\Models\Mahasiswa::where('status', 'lulus')->count();
        $totalAktif = \App\Models\Mahasiswa::where('status', 'aktif')->count();
        
        $mhsBimbingan = \App\Models\Mahasiswa::where('status', 'aktif')
            ->whereHas('judulPengajuan', function($q) {
                $q->where('status', 'approved');
            })
            ->with(['bimbingan' => function($q) {
                $q->latest()->limit(1)->with('tahapanConfig');
            }])
            ->get();
            
        $totalBimbingan = $mhsBimbingan->count();
        
        $tahapanCounts = [];
        foreach ($mhsBimbingan as $mhs) {
            $latestBimbingan = $mhs->bimbingan->first();
            if ($latestBimbingan && $latestBimbingan->tahapanConfig) {
                $tahapanName = $latestBimbingan->tahapanConfig->nama_tahapan;
                if (!isset($tahapanCounts[$tahapanName])) {
                    $tahapanCounts[$tahapanName] = 0;
                }
                $tahapanCounts[$tahapanName]++;
            }
        }
        arsort($tahapanCounts);
        $topTahapan = array_slice($tahapanCounts, 0, 3, true);
        $tahapanData = [];
        foreach ($topTahapan as $name => $count) {
            $tahapanData[] = ['nama' => $name, 'total' => $count];
        }

        $adminData = [
            'total_mahasiswa' => $totalMahasiswa,
            'total_lulus' => $totalLulus,
            'total_bimbingan' => $totalBimbingan,
            'lulus_percentage' => $totalMahasiswa > 0 ? round(($totalLulus / $totalMahasiswa) * 100, 1) : 0,
            'bimbingan_percentage' => $totalMahasiswa > 0 ? round(($totalBimbingan / $totalMahasiswa) * 100, 1) : 0,
            'top_tahapan' => $tahapanData,
            'total_dosen' => \App\Models\Dosen::count(),
            'total_judul_pending' => \App\Models\JudulPengajuan::whereNotIn('status', ['approved', 'rejected'])->count(),
        ];

        $stats = match($user->effective_role) {
            'admin' => $adminData,
            'pimpinan' => $adminData,
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