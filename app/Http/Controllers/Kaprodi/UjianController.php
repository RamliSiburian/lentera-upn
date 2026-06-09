<?php

namespace App\Http\Controllers\Kaprodi;

use App\Http\Controllers\Controller;
use App\Models\PengajuanUjian;
use App\Models\PenilaianApproval;
use App\Models\PengujiUjian;
use App\Models\JadwalUjian;
use App\Models\Dosen;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UjianController extends Controller
{
    public function index()
    {
        $pengajuanUjian = PengajuanUjian::with([
            'mahasiswa.user',
            'tahapan',
            'penguji.dosen.user',
            'jadwal.ruangan',
            'penilaian.penguji.dosen.user',
            'approvals.kaprodi'
        ])->orderBy('created_at', 'desc')->get();

        return Inertia::render('Kaprodi/Ujian/Index', [
            'pengajuanUjian' => $pengajuanUjian,
        ]);
    }

    public function approveUjian(Request $request, $id)
    {
        $pengajuan = PengajuanUjian::with('penguji')->findOrFail($id);
        $user = Auth::user();

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'catatan' => 'nullable|string',
        ]);

        // Validasi: jika approve, semua penguji harus sudah 'accepted'
        if ($request->status === 'approved') {
            $belumAcc = $pengajuan->penguji()
                ->where('penguji_acc', '!=', 'accepted')
                ->count();

            if ($belumAcc > 0) {
                return back()->with('error', 'Belum semua dosen penguji mengkonfirmasi penugasan. Tunggu konfirmasi dari semua penguji terlebih dahulu.');
            }
        }

        $pengajuan->update([
            'status'      => $request->status,
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Status ujian berhasil diperbarui.');
    }

    public function approvePenilaian(Request $request, $id)
    {
        $pengajuan = PengajuanUjian::findOrFail($id);
        $user = Auth::user();

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'catatan' => 'nullable|string',
        ]);

        // Check all penguji have submitted nilai
        $pengujiCount = $pengajuan->penguji()->count();
        $nilaiCount = $pengajuan->penilaian()->count();

        if ($nilaiCount < $pengujiCount) {
            return back()->with('error', 'Belum semua penguji mengisi nilai.');
        }

        PenilaianApproval::create([
            'pengajuan_ujian_id' => $id,
            'kaprodi_id' => $user->id,
            'status' => $request->status,
            'catatan' => $request->catatan,
            'approved_at' => now(),
        ]);

        if ($request->status === 'approved') {
            $pengajuan->update(['status' => 'approved']);

            // Cek apakah tahapan ini adalah tahapan terakhir (urutan terbesar) yang aktif
            $lastStage = \App\Models\TahapanConfig::where('is_active', true)
                ->orderBy('urutan', 'desc')
                ->first();

            if ($lastStage && $pengajuan->tahapan_id === $lastStage->id) {
                $mahasiswa = \App\Models\Mahasiswa::find($pengajuan->mahasiswa_id);
                if ($mahasiswa) {
                    $mahasiswa->update(['status' => 'lulus']);
                }
            }
        }

        return back()->with('success', 'Penilaian berhasil di-approve.');
    }
}