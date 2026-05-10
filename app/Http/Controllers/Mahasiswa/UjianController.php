<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\PengajuanUjian;
use App\Models\TahapanConfig;
use App\Models\Bimbingan;
use App\Models\BimbinganAcc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UjianController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();

        // Get eligible tahapan (ujian type) based on completed bimbingan
        $tahapanUjian = TahapanConfig::where('tipe', 'ujian')
            ->where('is_active', true)
            ->orderBy('urutan')
            ->get();

        // Count ACC'd bimbingan bab
        $accBabCount = BimbinganAcc::whereHas('bimbingan', function ($q) use ($mahasiswa) {
            $q->where('mahasiswa_id', $mahasiswa->id);
        })->where('bimbingan_acc.status', 'approved')
          ->join('bimbingan', 'bimbingan_acc.bimbingan_id', '=', 'bimbingan.id')
          ->where('bimbingan.tipe', 'bimbingan')
          ->count();

        // Get submitted ujian
        $pengajuanUjian = PengajuanUjian::where('mahasiswa_id', $mahasiswa->id)
            ->with(['tahapan', 'penguji.dosen.user', 'jadwal.ruangan', 'penilaian.penguji.dosen.user', 'approvals'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Check eligibility for each tahapan
        $eligibility = [];
        foreach ($tahapanUjian as $tahapan) {
            $minBab = $tahapan->min_bab_acc ?? 0;
            $hasSubmitted = $pengajuanUjian->where('tahapan_id', $tahapan->id)->count() > 0;
            $hasApproved = $pengajuanUjian->where('tahapan_id', $tahapan->id)
                ->where('status', 'approved')->count() > 0;
            $hasPending = $pengajuanUjian->where('tahapan_id', $tahapan->id)
                ->whereIn('status', ['submitted', 'reviewed'])->count() > 0;

            $eligibility[$tahapan->id] = [
                'eligible' => $accBabCount >= $minBab && !$hasApproved && !$hasPending,
                'min_bab' => $minBab,
                'current_bab' => $accBabCount,
                'has_submitted' => $hasSubmitted,
                'has_approved' => $hasApproved,
                'has_pending' => $hasPending,
            ];
        }

        return Inertia::render('Mahasiswa/Ujian/Index', [
            'pengajuanUjian' => $pengajuanUjian,
            'tahapanUjian' => $tahapanUjian,
            'eligibility' => $eligibility,
            'accBabCount' => $accBabCount,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tahapan_id' => 'required|exists:tahapan_config,id',
            'keterangan' => 'nullable|string',
        ]);

        $user = Auth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();

        // Check if already submitted
        $exists = PengajuanUjian::where('mahasiswa_id', $mahasiswa->id)
            ->where('tahapan_id', $request->tahapan_id)
            ->whereIn('status', ['submitted', 'reviewed'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'Anda sudah mengajukan ujian ini dan masih diproses.');
        }

        PengajuanUjian::create([
            'mahasiswa_id' => $mahasiswa->id,
            'tahapan_id' => $request->tahapan_id,
            'status' => 'submitted',
            'keterangan' => $request->keterangan,
            'submitted_at' => now(),
        ]);

        return back()->with('success', 'Pengajuan ujian berhasil dikirim.');
    }
}