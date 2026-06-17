<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\PengajuanUjian;
use App\Models\PenilaianApproval;
use App\Models\TahapanConfig;
use App\Models\Bimbingan;
use App\Models\BimbinganAcc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UjianController extends Controller
{
    /**
     * Cek apakah ada pengajuan ujian yang nilai/statusnya belum di-acc Kaprodi.
     */
    private function hasBlockingUjian($mahasiswaId): bool
    {
        return PengajuanUjian::where('mahasiswa_id', $mahasiswaId)
            ->where(function ($q) {
                $q->whereIn('status', ['submitted', 'reviewed', 'menunggu_penguji'])
                  ->orWhere(function ($q2) {
                      $q2->where('status', 'approved')
                         ->whereDoesntHave('approvals', fn($q3) => $q3->where('status', 'approved'));
                  });
            })
            ->exists();
    }

    public function index()
    {
        $user = Auth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();

        // Get eligible tahapan (ujian type)
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

        // Cek apakah ada ujian yang memblokir pengajuan baru
        $hasBlocking = $this->hasBlockingUjian($mahasiswa->id);
        $blockingUjian = null;
        if ($hasBlocking) {
            $blockingUjian = PengajuanUjian::where('mahasiswa_id', $mahasiswa->id)
                ->with('tahapan')
                ->whereIn('status', ['submitted', 'reviewed', 'menunggu_penguji'])
                ->orWhere(function ($q) use ($mahasiswa) {
                    $q->where('mahasiswa_id', $mahasiswa->id)
                      ->where('status', 'approved')
                      ->whereDoesntHave('approvals', fn($q2) => $q2->where('status', 'approved'));
                })
                ->first();
        }

        // Check eligibility for each tahapan
        $eligibility = [];
        foreach ($tahapanUjian as $tahapan) {
            $minBab = $tahapan->min_bab_acc;
            $prereqStage = $minBab ? ($bimbinganStages[$minBab] ?? null) : null;
            $prereqName = $prereqStage ? $prereqStage->nama_tahapan : null;

            $isPrereqApproved = !$minBab || in_array($minBab, $approvedBimbinganUrutan);

            $hasSubmitted = $pengajuanUjian->where('tahapan_id', $tahapan->id)->count() > 0;
            $hasApproved = $pengajuanUjian->where('tahapan_id', $tahapan->id)
                ->whereIn('status', ['approved', 'selesai'])->count() > 0;
            $hasPending = $pengajuanUjian->where('tahapan_id', $tahapan->id)
                ->whereIn('status', ['submitted', 'reviewed', 'menunggu_penguji'])->count() > 0;

            $isLulus = $mahasiswa->status === 'lulus';

            // Cek apakah ada ujian sebelumnya (tahapan lain) yang belum di-acc kaprodi
            $isBlockedByPrevUjian = $hasBlocking && !$hasPending; // jika ujian ini sendiri yang pending, tidak diblokir oleh ini

            $eligibility[$tahapan->id] = [
                'eligible' => !$isLulus && $isPrereqApproved && !$hasApproved && !$hasPending && !$isBlockedByPrevUjian,
                'min_bab' => $minBab,
                'prereq_name' => $prereqName,
                'is_prereq_approved' => $isPrereqApproved,
                'current_bab' => $accBabCount,
                'has_submitted' => $hasSubmitted,
                'has_approved' => $hasApproved,
                'has_pending' => $hasPending,
                'blocked_by_ujian' => $isBlockedByPrevUjian,
            ];
        }

        return Inertia::render('Mahasiswa/Ujian/Index', [
            'pengajuanUjian'   => $pengajuanUjian,
            'tahapanUjian'     => $tahapanUjian,
            'eligibility'      => $eligibility,
            'accBabCount'      => $accBabCount,
            'mahasiswaStatus'  => $mahasiswa->status,
            'hasBlockingUjian' => $hasBlocking,
            'blockingUjianInfo' => $blockingUjian ? [
                'tahapan' => $blockingUjian->tahapan?->nama_tahapan ?? 'Ujian',
                'status'  => $blockingUjian->status,
            ] : null,
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

        // Blokir jika ada ujian lain yang masih pending / nilai belum di-acc
        if ($this->hasBlockingUjian($mahasiswa->id)) {
            // Cek apakah yang blocking bukan ujian yang sama dengan yang diajukan
            $currentTahapanBlocking = PengajuanUjian::where('mahasiswa_id', $mahasiswa->id)
                ->where('tahapan_id', $request->tahapan_id)
                ->whereIn('status', ['submitted', 'reviewed', 'menunggu_penguji'])
                ->exists();

            if (!$currentTahapanBlocking) {
                return back()->with('error', 'Tidak dapat mengajukan ujian baru. Ada pengajuan ujian atau nilai ujian yang belum disetujui oleh Kaprodi.');
            }
        }

        // Check if already submitted
        $exists = PengajuanUjian::where('mahasiswa_id', $mahasiswa->id)
            ->where('tahapan_id', $request->tahapan_id)
            ->whereIn('status', ['submitted', 'reviewed', 'menunggu_penguji'])
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

        $ujian = PengajuanUjian::create([
            'mahasiswa_id' => $mahasiswa->id,
            'tahapan_id'   => $request->tahapan_id,
            'status'       => 'submitted',
            'keterangan'   => $request->keterangan,
            'submitted_at' => now(),
        ]);

        // Salin penguji dari ujian sebelumnya secara otomatis (jika ada)
        $prevUjian = PengajuanUjian::where('mahasiswa_id', $mahasiswa->id)
            ->where('id', '!=', $ujian->id)
            ->whereHas('penguji')
            ->latest()
            ->first();

        if ($prevUjian) {
            $adminId = \App\Models\User::where('role', 'admin')->first()?->id ?? $user->id;
            
            $prevPengujis = \App\Models\PengujiUjian::where('pengajuan_ujian_id', $prevUjian->id)
                ->orderBy('urutan')
                ->get();

            foreach ($prevPengujis as $p) {
                \App\Models\PengujiUjian::create([
                    'pengajuan_ujian_id' => $ujian->id,
                    'dosen_id'           => $p->dosen_id,
                    'urutan'             => $p->urutan,
                    'assigned_by'        => $adminId,
                    'assigned_at'        => now(),
                    'penguji_acc'        => 'pending',
                ]);

                // Kirim notifikasi ke dosen penguji
                $dosenObj = \App\Models\Dosen::find($p->dosen_id);
                if ($dosenObj && $dosenObj->user_id) {
                    \App\Services\NotifikasiService::send(
                        $dosenObj->user_id,
                        'Penugasan Penguji Ujian',
                        'Anda ditugaskan secara otomatis sebagai Penguji ' . $p->urutan . ' untuk ujian ' . ($tahapan->nama_tahapan ?? 'Ujian') . ' mahasiswa ' . ($user->name ?? '-') . '.',
                        'ujian',
                        $ujian->id
                    );
                }
            }

            // Status menjadi 'menunggu_penguji' — menunggu semua dosen penguji konfirmasi
            $ujian->update(['status' => 'menunggu_penguji']);
        }

        $adminUserIds = \App\Models\User::where('role', 'admin')->pluck('id')->toArray();
        \App\Services\NotifikasiService::sendBulk(
            $adminUserIds,
            'Pengajuan Ujian Baru',
            'Mahasiswa ' . $user->name . ' mengajukan ujian ' . ($tahapan->nama_tahapan ?? 'Ujian') . '.',
            'ujian',
            $ujian->id
        );

        return back()->with('success', 'Pengajuan ujian berhasil dikirim.');
    }
}