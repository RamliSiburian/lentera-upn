<?php

namespace App\Http\Controllers;

use App\Models\Bimbingan;
use App\Models\JudulPengajuan;
use App\Models\Mahasiswa;
use App\Models\PengajuanUjian;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LaporanController extends Controller
{
    private function getMahasiswaList()
    {
        return Mahasiswa::with('user')->get()->map(fn($m) => [
            'id' => $m->id, 'nim' => $m->nim, 'nama' => $m->user->name ?? '-',
        ]);
    }

    public function admin(Request $request)
    {
        $query = Bimbingan::with(['mahasiswa.user', 'tahapanConfig', 'approvals.pembimbing.dosen.user']);
        $selectedMahasiswa = $request->get('mahasiswa_id');

        if ($selectedMahasiswa) {
            $query->where('mahasiswa_id', $selectedMahasiswa);
        }

        $stats = [
            'totalMahasiswa' => Mahasiswa::count(),
            'totalJudul' => JudulPengajuan::count(),
            'judulApproved' => JudulPengajuan::where('status', 'approved_kaprodi')->count(),
            'judulPending' => JudulPengajuan::whereIn('status', ['submitted', 'verified_admin'])->count(),
            'totalBimbingan' => Bimbingan::count(),
            'bimbinganApproved' => Bimbingan::where('status', 'approved')->count(),
            'totalUjian' => PengajuanUjian::count(),
        ];

        $recentBimbingan = $query->orderBy('created_at', 'desc')->take(100)->get()->map(function ($b) {
            return [
                'id' => $b->id,
                'mahasiswa_id' => $b->mahasiswa_id,
                'mahasiswa_nama' => $b->mahasiswa->user->name ?? '-',
                'mahasiswa_nim' => $b->mahasiswa->nim ?? '-',
                'tahapan' => $b->tahapanConfig->nama ?? '-',
                'tipe' => $b->tipe,
                'status' => $b->status,
                'bimbingan_ke' => $b->bimbingan_ke,
                'judul_laporan' => $b->judul_laporan,
                'catatan_mhs' => $b->catatan_mhs,
                'file_path' => $b->file_path,
                'created_at' => $b->created_at->format('d M Y H:i'),
                'submitted_at' => $b->submitted_at ? $b->submitted_at->format('d M Y H:i') : '-',
                'approved_by' => $b->approvals->filter(fn($a) => $a->status === 'approved')
                    ->map(fn($a) => $a->pembimbing->dosen->user->name ?? '-')->implode(', '),
                'approvals' => $b->approvals->map(fn($a) => [
                    'dosen_nama' => $a->pembimbing->dosen->user->name ?? '-',
                    'urutan' => $a->pembimbing->urutan,
                    'status' => $a->status,
                    'catatan' => $a->catatan,
                    'reviewed_at' => $a->reviewed_at ? $a->reviewed_at->format('d M Y H:i') : '-',
                ]),
            ];
        });

        $judulByStatus = JudulPengajuan::selectRaw('status, count(*) as total')
            ->groupBy('status')->pluck('total', 'status')->toArray();

        return Inertia::render('Laporan/Admin', [
            'stats' => $stats,
            'judulByStatus' => $judulByStatus,
            'recentBimbingan' => $recentBimbingan,
            'mahasiswaList' => $this->getMahasiswaList(),
            'selectedMahasiswa' => $selectedMahasiswa,
        ]);
    }

    public function kaprodi(Request $request)
    {
        return $this->admin($request);
    }

    public function pimpinan(Request $request)
    {
        return $this->admin($request);
    }

    public function mahasiswa()
    {
        $mahasiswa = Mahasiswa::where('user_id', Auth::id())->firstOrFail();

        $judul = JudulPengajuan::where('mahasiswa_id', $mahasiswa->id)
            ->with(['konsentrasi', 'pembimbing.dosen.user'])
            ->whereNotIn('status', ['rejected'])
            ->first();

        $bimbinganHistory = Bimbingan::where('mahasiswa_id', $mahasiswa->id)
            ->with(['tahapanConfig', 'approvals.pembimbing.dosen.user', 'komentar.user'])
            ->orderBy('created_at', 'asc')
            ->get()->map(function ($b) {
                return [
                    'id' => $b->id,
                    'tahapan' => $b->tahapanConfig->nama ?? '-',
                    'tipe' => $b->tipe,
                    'status' => $b->status,
                    'bimbingan_ke' => $b->bimbingan_ke,
                    'judul_laporan' => $b->judul_laporan,
                    'catatan_mhs' => $b->catatan_mhs,
                    'created_at' => $b->created_at->format('d M Y H:i'),
                    'submitted_at' => $b->submitted_at ? $b->submitted_at->format('d M Y H:i') : '-',
                    'approvals' => $b->approvals->map(fn($a) => [
                        'dosen_nama' => $a->pembimbing->dosen->user->name ?? '-',
                        'urutan' => $a->pembimbing->urutan === 'pembimbing_utama' ? 'Pembimbing 1' : 'Pembimbing 2',
                        'status' => $a->status,
                        'catatan' => $a->catatan,
                        'reviewed_at' => $a->reviewed_at ? $a->reviewed_at->format('d M Y H:i') : '-',
                    ]),
                ];
            });

        $ujianHistory = PengajuanUjian::where('mahasiswa_id', $mahasiswa->id)
            ->with(['tahapan', 'jadwal.ruangan', 'penguji.dosen.user', 'penilaian'])
            ->orderBy('created_at', 'desc')->get();

        return Inertia::render('Laporan/Mahasiswa', [
            'judul' => $judul ? [
                'id' => $judul->id,
                'judul' => $judul->judul,
                'deskripsi' => $judul->deskripsi,
                'status' => $judul->status,
                'konsentrasi' => $judul->konsentrasi?->nama,
                'submitted_at' => $judul->submitted_at?->format('d M Y H:i'),
                'created_at' => $judul->created_at->format('d M Y H:i'),
                'pembimbing' => $judul->pembimbing->map(fn($p) => [
                    'dosen_nama' => $p->dosen->user->name ?? '-',
                    'urutan' => $p->urutan === 'pembimbing_utama' ? 'Pembimbing 1' : 'Pembimbing 2',
                    'status' => $p->status,
                    'approved_at' => $p->approved_at ? \Carbon\Carbon::parse($p->approved_at)->format('d M Y H:i') : '-',
                ]),
            ] : null,
            'bimbinganHistory' => $bimbinganHistory,
            'ujianHistory' => $ujianHistory,
        ]);
    }

    public function exportPdf(Request $request, $mahasiswaId = null)
    {
        $mhsId = $mahasiswaId ?? $request->get('mahasiswa_id');

        if (!$mhsId) {
            $user = Auth::user();
            if ($user->role === 'mahasiswa') {
                $mhs = Mahasiswa::where('user_id', $user->id)->first();
                $mhsId = $mhs?->id;
            }
        }

        if (!$mhsId) {
            abort(404, 'Mahasiswa tidak ditemukan');
        }

        $mahasiswa = Mahasiswa::with('user')->findOrFail($mhsId);

        // Judul
        $judul = JudulPengajuan::where('mahasiswa_id', $mhsId)
            ->with(['konsentrasi', 'pembimbing.dosen.user'])
            ->whereNotIn('status', ['rejected'])
            ->orderBy('created_at', 'desc')->first();

        // Bimbingan
        $bimbingan = Bimbingan::where('mahasiswa_id', $mhsId)
            ->with(['tahapanConfig', 'approvals.pembimbing.dosen.user'])
            ->orderBy('created_at', 'asc')->get();

        // Ujian
        $ujian = PengajuanUjian::where('mahasiswa_id', $mhsId)
            ->with(['tahapan', 'jadwal.ruangan', 'penguji.dosen.user', 'penilaian.penguji.dosen.user', 'approvals'])
            ->orderBy('created_at', 'desc')->get();

        // Calculate total penguji across all ujian
        $pengujiTotal = 0;
        foreach ($ujian as $u) {
            $pengujiTotal += $u->penguji->count();
        }

        $pdf = Pdf::loadView('pdf.laporan', [
            'mahasiswa' => $mahasiswa,
            'judul' => $judul,
            'bimbingan' => $bimbingan,
            'ujian' => $ujian,
            'pengujiTotal' => $pengujiTotal,
            'tanggalCetak' => now()->format('d F Y H:i'),
        ]);

        $namaMhs = str_replace(' ', '_', $mahasiswa->user->name ?? 'mahasiswa');
        return $pdf->download('Laporan_Bimbingan_' . $namaMhs . '.pdf');
    }
}