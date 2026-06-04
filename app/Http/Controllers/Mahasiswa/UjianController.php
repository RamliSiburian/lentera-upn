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

        // Get all approved bimbingan stages' urutan
        $approvedBimbinganUrutan = Bimbingan::where('mahasiswa_id', $mahasiswa->id)
            ->where('bimbingan.status', 'approved')
            ->join('tahapan_config', 'bimbingan.tahapan_id', '=', 'tahapan_config.id')
            ->where('tahapan_config.tipe', 'bimbingan')
            ->pluck('tahapan_config.urutan')
            ->toArray();

        $accBabCount = count($approvedBimbinganUrutan);

        // Get all active bimbingan stages mapped by urutan
        $bimbinganStages = TahapanConfig::where('tipe', 'bimbingan')
            ->where('is_active', true)
            ->get()
            ->keyBy('urutan');

        // Get submitted ujian
        $pengajuanUjian = PengajuanUjian::where('mahasiswa_id', $mahasiswa->id)
            ->with(['tahapan', 'penguji.dosen.user', 'jadwal.ruangan', 'penilaian.penguji.dosen.user', 'approvals'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Check eligibility for each tahapan
        $eligibility = [];
        foreach ($tahapanUjian as $tahapan) {
            $minBab = $tahapan->min_bab_acc;
            $prereqStage = $minBab ? ($bimbinganStages[$minBab] ?? null) : null;
            $prereqName = $prereqStage ? $prereqStage->nama_tahapan : null;

            $isPrereqApproved = !$minBab || in_array($minBab, $approvedBimbinganUrutan);

            $hasSubmitted = $pengajuanUjian->where('tahapan_id', $tahapan->id)->count() > 0;
            $hasApproved = $pengajuanUjian->where('tahapan_id', $tahapan->id)
                ->where('status', 'approved')->count() > 0;
            $hasPending = $pengajuanUjian->where('tahapan_id', $tahapan->id)
                ->whereIn('status', ['submitted', 'reviewed'])->count() > 0;

            $isLulus = $mahasiswa->status === 'lulus';

            $eligibility[$tahapan->id] = [
                'eligible' => !$isLulus && $isPrereqApproved && !$hasApproved && !$hasPending,
                'min_bab' => $minBab,
                'prereq_name' => $prereqName,
                'is_prereq_approved' => $isPrereqApproved,
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
            'mahasiswaStatus' => $mahasiswa->status,
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

        if ($mahasiswa->status === 'lulus') {
            return back()->with('error', 'Anda sudah lulus dan tidak dapat mengajukan ujian baru.');
        }

        // Check if already submitted
        $exists = PengajuanUjian::where('mahasiswa_id', $mahasiswa->id)
            ->where('tahapan_id', $request->tahapan_id)
            ->whereIn('status', ['submitted', 'reviewed'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'Anda sudah mengajukan ujian ini dan masih diproses.');
        }

        $tahapan = TahapanConfig::findOrFail($request->tahapan_id);
        if ($tahapan->tipe !== 'ujian') {
            return back()->with('error', 'Tahapan ini bukan tahapan ujian.');
        }

        $minBab = $tahapan->min_bab_acc;
        if ($minBab) {
            $isPrereqApproved = Bimbingan::where('mahasiswa_id', $mahasiswa->id)
                ->where('bimbingan.status', 'approved')
                ->whereHas('tahapanConfig', function ($q) use ($minBab) {
                    $q->where('tipe', 'bimbingan')->where('urutan', $minBab);
                })
                ->exists();

            if (!$isPrereqApproved) {
                $prereqTahapan = TahapanConfig::where('tipe', 'bimbingan')
                    ->where('urutan', $minBab)
                    ->first();
                $prereqName = $prereqTahapan ? $prereqTahapan->nama_tahapan : "Bab {$minBab}";
                return back()->with('error', "Anda harus menyelesaikan {$prereqName} terlebih dahulu.");
            }
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