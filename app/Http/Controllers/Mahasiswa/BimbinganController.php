<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Bimbingan;
use App\Models\BimbinganAcc;
use App\Models\Komentar;
use App\Models\Mahasiswa;
use App\Models\Pembimbing;
use App\Models\PengajuanUjian;
use App\Models\PenilaianApproval;
use App\Models\TahapanConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BimbinganController extends Controller
{
    private function getMahasiswa()
    {
        return Mahasiswa::where('user_id', Auth::id())->firstOrFail();
    }

    /**
     * Cek apakah ada pengajuan ujian yang masih pending / nilai belum di-acc kaprodi.
     * Jika ada, mahasiswa tidak bisa lanjut ke tahapan berikutnya.
     */
    private function hasBlockingUjian($mahasiswaId): bool
    {
        // Cek ujian yang statusnya submitted / reviewed / menunggu_penguji / approved (tapi nilai belum di-acc)
        return PengajuanUjian::where('mahasiswa_id', $mahasiswaId)
            ->where(function ($q) {
                // Masih dalam proses (belum selesai) ATAU sudah approved tapi nilai belum di-acc Kaprodi
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
        $mahasiswa = $this->getMahasiswa();

        $judul = \App\Models\JudulPengajuan::where('mahasiswa_id', $mahasiswa->id)
            ->whereNotIn('status', ['rejected'])
            ->with(['pembimbing' => function ($q) {
                $q->where('status', 'approved')->with('dosen.user');
            }])
            ->first();

        $bimbingans = Bimbingan::where('mahasiswa_id', $mahasiswa->id)
            ->with(['tahapanConfig', 'approvals.pembimbing.dosen.user', 'komentar.user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'tipe' => $b->tipe,
                    'status' => $b->status,
                    'catatan_mhs' => $b->catatan_mhs,
                    'versi' => $b->bimbingan_ke,
                    'created_at' => $b->created_at,
                    'tahapan_config' => $b->tahapanConfig ? ['id' => $b->tahapanConfig->id, 'nama' => $b->tahapanConfig->nama_tahapan, 'nama_tahapan' => $b->tahapanConfig->nama_tahapan, 'urutan' => $b->tahapanConfig->urutan] : null,
                    'files' => $b->file_path ? [['id' => '1', 'nama_file' => $b->judul_laporan, 'path_file' => $b->file_path]] : [],
                    'approvals' => $b->approvals->map(function ($a) {
                        return [
                            'id' => $a->id,
                            'status' => $a->status,
                            'catatan' => $a->catatan,
                            'file_revisi' => $a->file_revisi ? asset('storage/' . $a->file_revisi) : null,
                            'pembimbing' => $a->pembimbing ? [
                                'urutan' => $a->pembimbing->urutan === 'pembimbing_utama' ? 1 : 2,
                                'dosen' => ['nama' => $a->pembimbing->dosen?->user?->name ?? '-'],
                            ] : null,
                        ];
                    }),
                    'komentar' => $b->komentar->map(function ($k) {
                        return [
                            'id' => $k->id,
                            'komentar' => $k->isi,
                            'created_at' => $k->created_at,
                            'user' => ['name' => $k->user->name, 'role' => $k->user->role],
                        ];
                    }),
                ];
            });

        // Only show bimbingan-type tahapan
        $tahapanList = TahapanConfig::where('is_active', true)
            ->where('tipe', 'bimbingan')
            ->orderBy('urutan')
            ->get();

        // Tahapan yang sudah pernah di-ACC
        $approvedTahapanIds = Bimbingan::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', 'approved')
            ->whereNotNull('tahapan_id')
            ->pluck('tahapan_id')
            ->unique()
            ->values()
            ->toArray();

        // Cek apakah ada ujian yang memblokir
        $hasBlocking = $this->hasBlockingUjian($mahasiswa->id);

        // Determine canCreate — hanya bisa buat bimbingan BARU jika:
        // 1. Tidak sedang proses ujian yang pending / nilai belum di-acc
        // 2. Bimbingan terakhir sudah approved (atau belum ada sama sekali)
        // 3. Judul tidak sedang dalam proses revisi
        $canCreate = false;
        $blockReason = null;
        if ($mahasiswa->status !== 'lulus' && $judul && $judul->pembimbing->count() > 0) {
            if ($judul->revision_status === 'revision_pending') {
                $blockReason = 'Pengajuan bimbingan ditangguhkan. Judul Anda sedang dalam proses revisi, tunggu persetujuan Kaprodi.';
            } elseif ($judul->revision_status === 'revision_rejected') {
                $blockReason = 'Pengajuan bimbingan ditangguhkan. Revisi judul Anda ditolak Kaprodi, silakan ajukan revisi ulang.';
            } elseif ($hasBlocking) {
                $blockReason = 'Ada pengajuan ujian atau nilai ujian yang belum disetujui oleh Kaprodi.';
            } else {
                $lastBimbingan = Bimbingan::where('mahasiswa_id', $mahasiswa->id)
                    ->orderBy('created_at', 'desc')
                    ->first();

                if (!$lastBimbingan || $lastBimbingan->status === 'approved') {
                    // Belum ada bimbingan atau bimbingan terakhir sudah approved → bisa buat baru
                    $canCreate = true;
                }
                // Jika status submitted / in_review / rejected → tidak bisa buat baru
                // (revisi dilakukan di bimbingan yang sama via submitRevisi())
            }
        }

        return Inertia::render('Mahasiswa/Bimbingan/Index', [
            'bimbingans'         => $bimbingans,
            'judul'              => $judul ? [
                'id'         => $judul->id,
                'judul'      => $judul->judul,
                'pembimbing' => $judul->pembimbing->map(fn($p) => [
                    'id'    => $p->id,
                    'urutan' => $p->urutan === 'pembimbing_utama' ? 1 : 2,
                    'dosen' => ['id' => $p->dosen->id, 'nama' => $p->dosen->user->name, 'nidn' => $p->dosen->nidn],
                ]),
            ] : null,
            'tahapanList'        => $tahapanList,
            'approvedTahapanIds' => $approvedTahapanIds,
            'canCreateBimbingan' => $canCreate,
            'blockReason'        => $blockReason,
            'mahasiswaStatus'    => $mahasiswa->status,
        ]);
    }

    /**
     * Buat bimbingan BARU (hanya jika bimbingan sebelumnya sudah approved atau belum ada).
     */
    public function store(Request $request)
    {
        $mahasiswa = $this->getMahasiswa();

        if ($mahasiswa->status === 'lulus') {
            return back()->with('error', 'Anda sudah lulus dan tidak dapat membuat bimbingan baru.');
        }

        // Blokir jika sedang dalam proses revisi judul
        $judul = \App\Models\JudulPengajuan::where('mahasiswa_id', $mahasiswa->id)
            ->whereNotIn('status', ['rejected'])
            ->first();

        if ($judul && in_array($judul->revision_status, ['revision_pending', 'revision_rejected'])) {
            return back()->with('error', 'Pengajuan bimbingan ditangguhkan. Judul Anda sedang dalam proses revisi, tunggu persetujuan Kaprodi.');
        }

        // Blokir jika ada ujian pending / nilai belum di-acc
        if ($this->hasBlockingUjian($mahasiswa->id)) {
            return back()->with('error', 'Tidak dapat mengajukan bimbingan baru. Ada pengajuan ujian atau nilai ujian yang belum disetujui oleh Kaprodi.');
        }

        // Pastikan bimbingan terakhir sudah approved (atau belum ada)
        $lastBimbingan = Bimbingan::where('mahasiswa_id', $mahasiswa->id)
            ->orderBy('created_at', 'desc')
            ->first();

        if ($lastBimbingan && $lastBimbingan->status !== 'approved') {
            return back()->with('error', 'Tidak dapat membuat bimbingan baru. Bimbingan sebelumnya belum disetujui atau masih dalam proses revisi. Gunakan tombol "Upload Revisi" untuk bimbingan yang ditolak.');
        }

        $validated = $request->validate([
            'tahapan_config_id' => 'required|uuid|exists:tahapan_config,id',
            'catatan_mhs' => 'nullable|string',
        ]);

        // Handle file upload
        $file = $request->file('file');
        if (!$file) {
            return back()->withErrors(['file' => 'File wajib diupload']);
        }

        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('bimbingan/' . $mahasiswa->id, $fileName, 'public');

        $lastBimbinganKe = Bimbingan::where('mahasiswa_id', $mahasiswa->id)->max('bimbingan_ke') ?? 0;

        $bimbingan = Bimbingan::create([
            'mahasiswa_id' => $mahasiswa->id,
            'tahapan_id' => $validated['tahapan_config_id'],
            'judul_laporan' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'tipe' => 'bimbingan',
            'status' => 'submitted',
            'bimbingan_ke' => $lastBimbinganKe + 1,
            'catatan_mhs' => $validated['catatan_mhs'] ?? null,
            'submitted_at' => now(),
        ]);

        // Buat approval record untuk setiap pembimbing yang sudah approved
        $pembimbings = Pembimbing::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', 'approved')
            ->get();

        foreach ($pembimbings as $p) {
            BimbinganAcc::create([
                'bimbingan_id' => $bimbingan->id,
                'pembimbing_id' => $p->id,
                'status' => 'pending',
                'catatan' => null,
                'reviewed_at' => null,
            ]);

            \App\Services\NotifikasiService::send(
                $p->dosen->user_id,
                'Bimbingan Baru',
                'Mahasiswa ' . $mahasiswa->user->name . ' mengajukan bimbingan baru.',
                'bimbingan',
                $bimbingan->id
            );
        }

        return redirect()->route('mahasiswa.bimbingan')->with('success', 'Bimbingan berhasil diupload.');
    }

    /**
     * Upload revisi pada bimbingan yang sudah ada (status rejected).
     * Hanya reset approval dari pembimbing yang me-reject, yang sudah approve tidak perlu ulang.
     */
    public function submitRevisi(Request $request, $bimbinganId)
    {
        $mahasiswa = $this->getMahasiswa();

        $bimbingan = Bimbingan::where('mahasiswa_id', $mahasiswa->id)
            ->where('id', $bimbinganId)
            ->where('status', 'rejected')
            ->firstOrFail();

        $request->validate([
            'catatan_mhs' => 'nullable|string',
            'file' => 'required|file|mimes:pdf|max:20480',
        ]);

        // Update file dan catatan di bimbingan yang sama
        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('bimbingan/' . $mahasiswa->id, $fileName, 'public');

        $bimbingan->update([
            'judul_laporan' => $file->getClientOriginalName(),
            'file_path'     => $filePath,
            'catatan_mhs'   => $request->catatan_mhs ?? $bimbingan->catatan_mhs,
            'status'        => 'submitted',
            'submitted_at'  => now(),
        ]);

        // Reset HANYA approval yang berstatus 'rejected' kembali ke 'pending'
        // Approval yang sudah 'approved' TIDAK diubah
        $rejectedPembimbings = BimbinganAcc::where('bimbingan_id', $bimbinganId)
            ->where('status', 'rejected')
            ->with('pembimbing.dosen')
            ->get();

        foreach ($rejectedPembimbings as $ra) {
            \App\Services\NotifikasiService::send(
                $ra->pembimbing->dosen->user_id,
                'Revisi Bimbingan',
                'Mahasiswa ' . $mahasiswa->user->name . ' mengunggah revisi bimbingan.',
                'bimbingan',
                $bimbingan->id
            );
        }

        BimbinganAcc::where('bimbingan_id', $bimbinganId)
            ->where('status', 'rejected')
            ->update([
                'status'      => 'pending',
                'catatan'     => null,
                'file_revisi' => null,
                'reviewed_at' => null,
            ]);

        // Setelah reset, cek apakah semua sudah approved (edge case: semua reject di-reset)
        $allApproved = BimbinganAcc::where('bimbingan_id', $bimbinganId)
            ->where('status', '!=', 'approved')
            ->count() === 0;

        if ($allApproved) {
            $bimbingan->update(['status' => 'approved']);
        }

        return redirect()->route('mahasiswa.bimbingan')->with('success', 'Revisi berhasil diupload. Menunggu persetujuan dari pembimbing yang merevisi.');
    }

    public function komentar(Request $request, $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $bimbingan = Bimbingan::where('mahasiswa_id', $mahasiswa->id)->findOrFail($id);

        $validated = $request->validate([
            'komentar' => 'required|string',
        ]);

        Komentar::create([
            'bimbingan_id' => $bimbingan->id,
            'user_id' => Auth::id(),
            'isi' => $validated['komentar'],
        ]);

        return redirect()->route('mahasiswa.bimbingan')->with('success', 'Komentar ditambahkan.');
    }
}