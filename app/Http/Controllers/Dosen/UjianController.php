<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\PengajuanUjian;
use App\Models\PengujiUjian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UjianController extends Controller
{
    private function getDosen()
    {
        return Dosen::where('user_id', Auth::id())->firstOrFail();
    }

    public function index()
    {
        $user = Auth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return Inertia::render('Dosen/Ujian/Index', [
                'jadwalUjian' => [],
                'pendingKonfirmasi' => [],
            ]);
        }

        // Get ujian where this dosen is penguji
        $jadwalUjian = PengajuanUjian::whereHas('penguji', function ($q) use ($dosen) {
            $q->where('dosen_id', $dosen->id);
        })
            ->with([
                'mahasiswa.user',
                'tahapan',
                'penguji' => function ($q) use ($dosen) {
                    $q->with('dosen.user');
                },
                'jadwal.ruangan',
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($ujian) use ($dosen) {
                // Cari record penguji milik dosen ini
                $myPenguji = $ujian->penguji->firstWhere('dosen_id', $dosen->id);
                $ujian->my_penguji_acc = $myPenguji ? $myPenguji->penguji_acc : null;
                $ujian->my_penguji_id  = $myPenguji ? $myPenguji->id : null;
                return $ujian;
            });

        // Ujian yang masih menunggu konfirmasi dari dosen ini
        $pendingKonfirmasi = $jadwalUjian->filter(fn($u) => $u->my_penguji_acc === 'pending');

        return Inertia::render('Dosen/Ujian/Index', [
            'jadwalUjian'       => $jadwalUjian->values(),
            'pendingKonfirmasi' => $pendingKonfirmasi->values(),
        ]);
    }

    /**
     * Dosen menerima tugas sebagai penguji.
     */
    public function acceptPenguji(Request $request, $pengujiId)
    {
        $dosen = $this->getDosen();

        $penguji = PengujiUjian::where('id', $pengujiId)
            ->where('dosen_id', $dosen->id)
            ->where('penguji_acc', 'pending')
            ->firstOrFail();

        $penguji->update([
            'penguji_acc'    => 'accepted',
            'penguji_acc_at' => now(),
        ]);

        // Cek apakah semua penguji sudah accept — jika ya, ubah status pengajuan ke 'reviewed'
        $pengajuan = $penguji->pengajuanUjian;
        $allAccepted = $pengajuan->penguji()
            ->where('penguji_acc', '!=', 'accepted')
            ->count() === 0;

        if ($allAccepted) {
            $pengajuan->update(['status' => 'reviewed']);
        }

        return back()->with('success', 'Tugas penguji berhasil diterima.');
    }

    /**
     * Dosen menolak tugas sebagai penguji.
     */
    public function rejectPenguji(Request $request, $pengujiId)
    {
        $dosen = $this->getDosen();

        $penguji = PengujiUjian::where('id', $pengujiId)
            ->where('dosen_id', $dosen->id)
            ->where('penguji_acc', 'pending')
            ->firstOrFail();

        $request->validate([
            'catatan' => 'nullable|string|max:500',
        ]);

        $penguji->update([
            'penguji_acc'          => 'rejected',
            'penguji_acc_at'       => now(),
            'penguji_acc_catatan'  => $request->catatan,
        ]);

        // Kembalikan status pengajuan ke 'submitted' agar admin bisa assign ulang
        $pengajuan = $penguji->pengajuanUjian;
        $pengajuan->update(['status' => 'submitted']);

        return back()->with('success', 'Tugas penguji ditolak. Admin akan diberitahu untuk assign ulang penguji.');
    }
}