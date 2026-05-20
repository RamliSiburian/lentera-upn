<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PengajuanUjian;
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
            'mahasiswa.pembimbing',
            'tahapan',
            'penguji.dosen.user',
            'jadwal.ruangan',
            'penilaian',
            'approvals'
        ])->orderBy('created_at', 'desc')->get();

        $dosenList = Dosen::with('user')->whereHas('user', function ($q) {
            $q->where('is_active', true);
        })->get();

        $ruanganList = Ruangan::where('is_active', true)->get();

        return Inertia::render('Admin/Ujian/Index', [
            'pengajuanUjian' => $pengajuanUjian,
            'dosenList' => $dosenList,
            'ruanganList' => $ruanganList,
        ]);
    }

    public function assignPenguji(Request $request, $id)
    {
        $request->validate([
            'dosen_ids' => 'required|array|min:1',
            'dosen_ids.*' => 'required|exists:dosen,id',
        ]);

        $pengajuan = PengajuanUjian::findOrFail($id);
        $user = Auth::user();

        // Remove existing penguji
        PengujiUjian::where('pengajuan_ujian_id', $id)->delete();

        foreach ($request->dosen_ids as $urutan => $dosenId) {
            PengujiUjian::create([
                'pengajuan_ujian_id' => $id,
                'dosen_id' => $dosenId,
                'urutan' => $urutan + 1,
                'assigned_by' => $user->id,
                'assigned_at' => now(),
            ]);
        }

        $pengajuan->update(['status' => 'reviewed']);

        return back()->with('success', 'Penguji berhasil ditugaskan.');
    }

    public function setJadwal(Request $request, $id)
    {
        $request->validate([
            'ruangan_id' => 'required|exists:ruangan,id',
            'tanggal' => 'required|date',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required|after:jam_mulai',
            'catatan' => 'nullable|string',
        ]);

        $user = Auth::user();

        // Check room availability
        $conflict = JadwalUjian::where('ruangan_id', $request->ruangan_id)
            ->where('tanggal', $request->tanggal)
            ->where(function ($q) use ($request) {
                $q->whereBetween('jam_mulai', [$request->jam_mulai, $request->jam_selesai])
                  ->orWhereBetween('jam_selesai', [$request->jam_mulai, $request->jam_selesai]);
            })->exists();

        if ($conflict) {
            return back()->with('error', 'Ruangan sudah digunakan pada waktu tersebut.');
        }

        JadwalUjian::updateOrCreate(
            ['pengajuan_ujian_id' => $id],
            [
                'ruangan_id' => $request->ruangan_id,
                'tanggal' => $request->tanggal,
                'jam_mulai' => $request->jam_mulai,
                'jam_selesai' => $request->jam_selesai,
                'catatan' => $request->catatan,
                'created_by' => $user->id,
            ]
        );

        return back()->with('success', 'Jadwal ujian berhasil diatur.');
    }
}