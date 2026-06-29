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

        $pdf = Pdf::loadView('pdf.laporan', [
            'mahasiswa'    => $mahasiswa,
            'judul'        => $judul,
            'bimbingan'    => $bimbingan,
            'ujian'        => $ujian,
            'tanggalCetak' => now()->format('d F Y H:i'),
        ])->setPaper('A4', 'landscape');

        $namaMhs = str_replace(' ', '_', $mahasiswa->user->name ?? 'mahasiswa');
        return $pdf->download('Laporan_Bimbingan_' . $namaMhs . '.pdf');
    }

    public function exportRekapPdf()
    {
        $mahasiswaAll = Mahasiswa::with([
            'user',
            'judulPengajuan' => fn($q) => $q->whereNotIn('status', ['rejected'])
                ->orderBy('created_at', 'desc')
                ->with(['konsentrasi', 'pembimbing.dosen.user']),
            'bimbingan'      => fn($q) => $q->orderBy('created_at', 'desc')->with('tahapanConfig'),
        ])->get();

        // Map ke format ringkas
        $mahasiswaList = $mahasiswaAll->map(function ($m) {
            $judul      = $m->judulPengajuan->first();
            $bimbingan  = $m->bimbingan->first();

            // Ambil ujian terakhir langsung via query
            $ujian = PengajuanUjian::where('mahasiswa_id', $m->id)
                ->with('tahapan')
                ->orderBy('created_at', 'desc')
                ->first();

            $pembimbing = $judul?->pembimbing
                ->map(fn($p) => $p->dosen?->user?->name ?? '-')
                ->implode(' / ');

            $judulStatusLabel = [
                'draft'            => 'Draft',
                'submitted'        => 'Diajukan',
                'verified_admin'   => 'Diverifikasi',
                'approved_kaprodi' => 'Disetujui',
                'rejected'         => 'Ditolak',
            ];

            return [
                'nim'               => $m->nim ?? '-',
                'nama'              => $m->user->name ?? '-',
                'judul'             => $judul?->judul ?? '-',
                'status_judul'      => $judulStatusLabel[$judul?->status ?? ''] ?? ($judul?->status ?? '-'),
                'pembimbing'        => $pembimbing ?: '-',
                'total_bimbingan'   => $m->bimbingan->count(),
                'tahapan_bimbingan' => $bimbingan?->tahapanConfig?->nama ?? '-',
                'status_bimbingan'  => match($bimbingan?->status) {
                    'submitted'  => 'Diajukan',
                    'in_review'  => 'Ditinjau',
                    'approved'   => 'Disetujui',
                    'rejected'   => 'Revisi',
                    default      => $bimbingan?->status ?? '-',
                },
                'jenis_ujian'  => $ujian?->tahapan?->nama ?? '-',
                'status_ujian' => match($ujian?->status) {
                    'submitted'       => 'Diajukan',
                    'reviewed'        => 'Dijadwalkan',
                    'menunggu_penguji'=> 'Tunggu Penguji',
                    'lulus'           => 'Lulus',
                    'revisi'          => 'Revisi',
                    'gagal'           => 'Gagal',
                    default           => $ujian?->status ?? '-',
                },
            ];
        });

        $pdf = Pdf::loadView('pdf.laporan-rekap', [
            'mahasiswaList' => $mahasiswaList,
            'tanggalCetak'  => now()->format('d F Y H:i'),
            'totalMhs'      => $mahasiswaList->count(),
        ])->setPaper('A4', 'landscape');

        return $pdf->download('Rekap_Progress_Mahasiswa_' . now()->format('Ymd') . '.pdf');
    }

    public function exportBeritaAcaraPdf($id)
    {
        $ujian = PengajuanUjian::with([
            'mahasiswa.user',
            'mahasiswa.prodi.kaprodi.user',
            'mahasiswa.pembimbing.dosen.user',
            'tahapan',
            'jadwal.ruangan',
            'penguji.dosen.user',
            'penilaian.penguji.dosen.user',
            'approvals.kaprodi'
        ])->findOrFail($id);

        // Helper to convert number to Indonesian words
        $terbilang = function ($angka) use (&$terbilang) {
            $angka = (int)$angka;
            $bilangan = [
                '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
                'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
            ];

            if ($angka < 12) {
                return $bilangan[$angka];
            } else if ($angka < 20) {
                return $terbilang($angka - 10) . ' Belas';
            } else if ($angka < 100) {
                $puluh = (int)($angka / 10);
                $sisa = $angka % 10;
                return $bilangan[$puluh] . ' Puluh' . ($sisa ? ' ' . $terbilang($sisa) : '');
            } else if ($angka < 200) {
                return 'Seratus' . ($angka - 100 ? ' ' . $terbilang($angka - 100) : '');
            } else if ($angka < 1000) {
                $ratus = (int)($angka / 100);
                $sisa = $angka % 100;
                return $bilangan[$ratus] . ' Ratus' . ($sisa ? ' ' . $terbilang($sisa) : '');
            } else if ($angka < 2000) {
                return 'Seribu' . ($angka - 1000 ? ' ' . $terbilang($angka - 1000) : '');
            } else if ($angka < 1000000) {
                $ribu = (int)($angka / 1000);
                $sisa = $angka % 1000;
                return $terbilang($ribu) . ' Ribu' . ($sisa ? ' ' . $terbilang($sisa) : '');
            }
            return '';
        };

        $getHariIndonesian = function ($date) {
            if (!$date) return '-';
            $day = $date->format('N');
            $days = [
                1 => 'Senin',
                2 => 'Selasa',
                3 => 'Rabu',
                4 => 'Kamis',
                5 => 'Jumat',
                6 => 'Sabtu',
                7 => 'Minggu'
            ];
            return $days[$day] ?? '';
        };

        $getBulanIndonesian = function ($date) {
            if (!$date) return '-';
            $month = $date->format('n');
            $months = [
                1 => 'Januari',
                2 => 'Februari',
                3 => 'Maret',
                4 => 'April',
                5 => 'Mei',
                6 => 'Juni',
                7 => 'Juli',
                8 => 'Agustus',
                9 => 'September',
                10 => 'Oktober',
                11 => 'November',
                12 => 'Desember'
            ];
            return $months[$month] ?? '';
        };

        $tanggalJadwal = $ujian->jadwal?->tanggal;
        $hari = $tanggalJadwal ? $getHariIndonesian($tanggalJadwal) : '-';
        $tanggalTerbilang = $tanggalJadwal ? $terbilang($tanggalJadwal->format('j')) : '-';
        $bulan = $tanggalJadwal ? $getBulanIndonesian($tanggalJadwal) : '-';
        $tahunTerbilang = $tanggalJadwal ? $terbilang($tanggalJadwal->format('Y')) : '-';

        // Map penguji data to roles
        $pengujiList = $ujian->penguji->sortBy('urutan');
        $nilaiList = $ujian->penilaian;

        $pengujiData = [];
        $totalNilaiAkhir = 0;

        foreach ($pengujiList as $p) {
            $bobot = 0.0;
            $jabatan = '';
            if ($p->urutan === 1) {
                $bobot = 0.25;
                $jabatan = 'Penguji Utama';
            } elseif ($p->urutan === 2) {
                $bobot = 0.25;
                $jabatan = 'Penguji Lembaga';
            } elseif ($p->urutan === 3) {
                $bobot = 0.50;
                $jabatan = 'Pembimbing';
            } else {
                $bobot = 0.0;
                $jabatan = 'Penguji ' . $p->urutan;
            }

            // Find grade
            $penilaian = $nilaiList->firstWhere('penguji_id', $p->id);
            $nilai = $penilaian ? (float)$penilaian->nilai : null;
            $nilaiAkhir = $nilai !== null ? $nilai * $bobot : null;

            if ($nilaiAkhir !== null) {
                $totalNilaiAkhir += $nilaiAkhir;
            }

            $pengujiData[] = [
                'nama' => $p->dosen->user->name ?? '-',
                'nidn' => $p->dosen->nidn ?? '-',
                'urutan' => $p->urutan,
                'jabatan' => $jabatan,
                'bobot_percent' => ($bobot * 100) . ' %',
                'nilai' => $nilai !== null ? number_format($nilai, 2, ',', '.') : '-',
                'nilai_akhir' => $nilaiAkhir !== null ? number_format($nilaiAkhir, 2, ',', '.') : '-',
                'nilai_raw' => $nilai,
                'catatan' => $penilaian->catatan ?? '',
            ];
        }

        // Calculate Nilai Mutu
        $getNilaiMutu = function ($score) {
            if ($score >= 85.00) return 'A';
            if ($score >= 80.00) return 'A-';
            if ($score >= 75.00) return 'B+';
            if ($score >= 70.00) return 'B';
            if ($score >= 65.00) return 'B-';
            if ($score >= 60.00) return 'C+';
            if ($score >= 55.00) return 'C';
            if ($score >= 40.00) return 'D';
            return 'E';
        };

        $nilaiMutu = $totalNilaiAkhir > 0 ? $getNilaiMutu($totalNilaiAkhir) : '-';

        // Check if student passed
        $isLulus = $totalNilaiAkhir >= 55.00;

        // Judul proposal/tugas akhir
        $judul = JudulPengajuan::where('mahasiswa_id', $ujian->mahasiswa_id)
            ->whereNotIn('status', ['rejected'])
            ->orderBy('created_at', 'desc')->first();

        // Get Kaprodi name
        $kaprodiNama = $ujian->mahasiswa->prodi->kaprodi->user->name ?? 'Andhika Octa Indarso, M.MSI';

        $pdf = Pdf::loadView('pdf.berita-acara', [
            'ujian' => $ujian,
            'hari' => $hari,
            'tanggal_terbilang' => $tanggalTerbilang,
            'bulan' => $bulan,
            'tahun_terbilang' => $tahunTerbilang,
            'pengujiData' => $pengujiData,
            'totalNilaiAkhir' => number_format($totalNilaiAkhir, 2, ',', '.'),
            'nilaiMutu' => $nilaiMutu,
            'isLulus' => $isLulus,
            'judul' => $judul,
            'kaprodiNama' => $kaprodiNama,
            'tanggalCetak' => now()->format('d F Y H:i'),
        ])->setPaper('A4', 'portrait');

        $namaMhs = str_replace(' ', '_', $ujian->mahasiswa->user->name ?? 'mahasiswa');
        return $pdf->download('Berita_Acara_Ujian_' . $namaMhs . '.pdf');
    }
}