<?php

namespace App\Http\Controllers\Kaprodi;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\PengajuanUjian;
use App\Models\PenilaianApproval;
use App\Models\ProgramStudi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NilaiController extends Controller
{
    /**
     * Dapatkan daftar prodi yang dikepalai oleh kaprodi yang login
     */
    private function getKaprodiProdiIds(): array
    {
        $user = Auth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return [];
        }

        return ProgramStudi::where('kaprodi_id', $dosen->id)
            ->pluck('id')
            ->toArray();
    }

    /**
     * Halaman Persetujuan Nilai — hanya ujian dari mahasiswa prodi kaprodi ini
     * dan sudah ada semua nilai dari penguji (siap untuk di-approve)
     */
    public function index()
    {
        $prodiIds = $this->getKaprodiProdiIds();

        // Ambil pengajuan ujian yang:
        // 1. Mahasiswanya di prodi kaprodi ini
        // 2. Sudah ada nilai dari semua penguji (allNilaiSubmitted)
        // 3. Belum di-approve nilai (status bukan 'selesai')
        $pengajuanUjian = PengajuanUjian::with([
            'mahasiswa.user',
            'mahasiswa.prodi',
            'tahapan',
            'penguji.dosen.user',
            'jadwal.ruangan',
            'penilaian.penguji.dosen.user',
            'approvals',
        ])
        ->whereHas('mahasiswa', function ($q) use ($prodiIds) {
            if (!empty($prodiIds)) {
                $q->whereIn('prodi_id', $prodiIds);
            }
        })
        // Hanya yang sudah selesai ujian (reviewed = sudah ada penguji)
        ->whereIn('status', ['reviewed', 'approved', 'selesai'])
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($u) {
            $pengujiCount = $u->penguji->count();
            $nilaiCount   = $u->penilaian->count();

            return [
                'id'                  => $u->id,
                'status'              => $u->status,
                'keterangan'          => $u->keterangan,
                'submitted_at'        => $u->submitted_at,
                'all_nilai_submitted' => $pengujiCount > 0 && $nilaiCount >= $pengujiCount,
                'has_approval'        => $u->approvals->count() > 0,
                'mahasiswa'           => [
                    'id'   => $u->mahasiswa->id,
                    'nim'  => $u->mahasiswa->nim,
                    'nama' => $u->mahasiswa->user?->name ?? '-',
                    'prodi' => $u->mahasiswa->prodi?->nama ?? '-',
                ],
                'tahapan'  => $u->tahapan ? ['id' => $u->tahapan->id, 'nama_tahapan' => $u->tahapan->nama_tahapan] : null,
                'penguji'  => $u->penguji->map(fn($p) => [
                    'id'     => $p->id,
                    'urutan' => $p->urutan,
                    'dosen'  => ['id' => $p->dosen?->id, 'nama' => $p->dosen?->user?->name ?? '-'],
                ])->values(),
                'jadwal'   => $u->jadwal ? [
                    'tanggal'    => $u->jadwal->tanggal,
                    'jam_mulai'  => $u->jadwal->jam_mulai,
                    'jam_selesai' => $u->jadwal->jam_selesai,
                    'ruangan'    => $u->jadwal->ruangan ? ['nama' => $u->jadwal->ruangan->nama] : null,
                ] : null,
                'penilaian' => $u->penilaian->map(fn($n) => [
                    'id'           => $n->id,
                    'nilai'        => $n->nilai,
                    'status_hasil' => $n->status_hasil,
                    'catatan'      => $n->catatan,
                    'dinilai_at'   => $n->dinilai_at,
                    'penguji'      => $n->penguji ? [
                        'urutan' => $n->penguji->urutan,
                        'dosen'  => ['nama' => $n->penguji->dosen?->user?->name ?? '-'],
                    ] : null,
                ])->values(),
                'approvals' => $u->approvals->map(fn($a) => [
                    'id'          => $a->id,
                    'status'      => $a->status,
                    'catatan'     => $a->catatan,
                    'approved_at' => $a->approved_at,
                ])->values(),
                // Rata-rata nilai
                'rata_nilai' => $u->penilaian->count() > 0
                    ? round($u->penilaian->avg('nilai'), 2)
                    : null,
            ];
        });

        return Inertia::render('Kaprodi/Nilai/Index', [
            'pengajuanUjian' => $pengajuanUjian,
        ]);
    }

    /**
     * Approve atau tolak penilaian ujian
     */
    public function approve(Request $request, $id)
    {
        $request->validate([
            'status'  => 'required|in:approved,rejected',
            'catatan' => 'nullable|string',
        ]);

        $pengajuan = PengajuanUjian::findOrFail($id);

        // Pastikan semua penguji sudah mengisi nilai
        $pengujiCount = $pengajuan->penguji()->count();
        $nilaiCount   = $pengajuan->penilaian()->count();

        if ($nilaiCount < $pengujiCount) {
            return back()->with('error', 'Belum semua penguji mengisi nilai. Tidak bisa disetujui.');
        }

        $user = Auth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        PenilaianApproval::updateOrCreate(
            ['pengajuan_ujian_id' => $id],
            [
                'kaprodi_id'  => $user->id,
                'status'      => $request->status,
                'catatan'     => $request->catatan,
                'approved_at' => now(),
            ]
        );

        // Update status pengajuan
        if ($request->status === 'approved') {
            $pengajuan->update(['status' => 'selesai']);
        }

        $msg = $request->status === 'approved'
            ? 'Penilaian berhasil disetujui. Ujian dinyatakan selesai.'
            : 'Penilaian ditolak.';

        return back()->with('success', $msg);
    }
}
