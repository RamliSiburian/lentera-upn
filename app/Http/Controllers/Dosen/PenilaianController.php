<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\PengujiUjian;
use App\Models\PenilaianApproval;
use App\Models\PenilaianUjian;
use App\Models\PengajuanUjian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PenilaianController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $dosen = Dosen::where('user_id', $user->id)->firstOrFail();

        // Get ujian where this dosen is penguji
        $pengujiAssignments = PengujiUjian::where('dosen_id', $dosen->id)
            ->with([
                'pengajuanUjian.mahasiswa.user',
                'pengajuanUjian.tahapan',
                'pengajuanUjian.jadwal.ruangan',
                'pengajuanUjian.penguji.dosen.user',
                'penilaian'
            ])
            ->orderBy('assigned_at', 'desc')
            ->get()
            ->map(function ($pa) {
                $ujian = $pa->pengajuanUjian;
                return [
                    'id' => $pa->id,
                    'pengajuanUjian' => $ujian ? [
                        'id' => $ujian->id,
                        'status' => $ujian->status,
                        'keterangan' => $ujian->keterangan,
                        'tahapan' => $ujian->tahapan ? [
                            'id' => $ujian->tahapan->id,
                            'nama_tahapan' => $ujian->tahapan->nama_tahapan,
                            'tipe' => $ujian->tahapan->tipe,
                        ] : null,
                        'jadwal' => $ujian->jadwal ? [
                            'id' => $ujian->jadwal->id,
                            'tanggal' => $ujian->jadwal->tanggal,
                            'jam_mulai' => $ujian->jadwal->jam_mulai,
                            'jam_selesai' => $ujian->jadwal->jam_selesai,
                            'ruangan' => $ujian->jadwal->ruangan ? ['id' => $ujian->jadwal->ruangan->id, 'nama' => $ujian->jadwal->ruangan->nama] : null,
                        ] : null,
                        'mahasiswa' => $ujian->mahasiswa ? [
                            'id' => $ujian->mahasiswa->id,
                            'nim' => $ujian->mahasiswa->nim,
                            'nama' => $ujian->mahasiswa->user?->name ?? '-',
                        ] : null,
                        'penguji' => $ujian->penguji->map(function ($px) {
                            return [
                                'id' => $px->id,
                                'urutan' => $px->urutan,
                                'dosen' => ['id' => $px->dosen?->id, 'nama' => $px->dosen?->user?->name ?? '-'],
                            ];
                        }),
                    ] : null,
                    'penilaian' => $pa->penilaian ? [
                        'id'           => $pa->penilaian->id,
                        'komponen'     => $pa->penilaian->komponen,
                        'nilai'        => $pa->penilaian->nilai,
                        'catatan'      => $pa->penilaian->catatan,
                        'status_hasil' => $pa->penilaian->status_hasil,
                        'dinilai_at'   => $pa->penilaian->dinilai_at,
                    ] : null,
                    // Kunci input jika penilaian sudah di-approve kaprodi
                    'is_nilai_locked' => PenilaianApproval::where('pengajuan_ujian_id', $pa->pengajuanUjian?->id)->exists(),
                ];
            });

        return Inertia::render('Dosen/Penilaian/Index', [
            'pengujiAssignments' => $pengujiAssignments,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'penguji_id'          => 'required|exists:penguji,id',
            'pengajuan_ujian_id'  => 'required|exists:pengajuan_ujian,id',
            'status_hasil'        => 'required|in:lulus,revisi,ngulang',
            'nilai'               => 'required|numeric|min:0|max:100',
            'catatan'             => 'nullable|string',
        ]);

        // ── LOCK: cek apakah penilaian sudah di-approve kaprodi ──
        $alreadyApproved = PenilaianApproval::where('pengajuan_ujian_id', $request->pengajuan_ujian_id)->exists();
        if ($alreadyApproved) {
            return back()->with('error', 'Penilaian sudah disetujui oleh Kaprodi dan tidak dapat diubah lagi.');
        }

        $user = Auth::user();
        $dosen = Dosen::where('user_id', $user->id)->firstOrFail();

        // Verify this dosen is assigned as penguji
        $penguji = PengujiUjian::where('id', $request->penguji_id)
            ->where('dosen_id', $dosen->id)
            ->firstOrFail();

        PenilaianUjian::updateOrCreate(
            [
                'pengajuan_ujian_id' => $request->pengajuan_ujian_id,
                'penguji_id' => $request->penguji_id,
            ],
            [
                'komponen' => 'Penilaian Penguji',
                'nilai' => $request->nilai,
                'catatan' => $request->catatan,
                'status_hasil' => $request->status_hasil,
                'dinilai_at' => now(),
            ]
        );

        return back()->with('success', 'Penilaian berhasil disimpan.');
    }
}