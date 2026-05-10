<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\PengajuanUjian;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UjianController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return Inertia::render('Dosen/Ujian/Index', [
                'jadwalUjian' => [],
            ]);
        }

        // Get ujian where this dosen is penguji
        $jadwalUjian = PengajuanUjian::whereHas('penguji', function ($q) use ($dosen) {
            $q->where('dosen_id', $dosen->id);
        })
            ->with([
                'mahasiswa.user',
                'tahapan',
                'penguji.dosen.user',
                'jadwal.ruangan',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Dosen/Ujian/Index', [
            'jadwalUjian' => $jadwalUjian,
        ]);
    }
}