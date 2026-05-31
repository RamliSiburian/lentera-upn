<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\JadwalUjian;
use App\Models\Mahasiswa;
use App\Models\PengajuanUjian;
use App\Models\PengujiUjian;
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
            'mahasiswa.prodi',
            'mahasiswa.pembimbing',
            'tahapan',
            'penguji.dosen.user',
            'jadwal.ruangan',
            'penilaian',
            'approvals',
        ])->orderBy('created_at', 'desc')->get();

        // Untuk tiap pengajuan, cari apakah mahasiswa pernah ujian sebelumnya
        // agar admin bisa lihat "penguji default dari ujian sebelumnya"
        $pengajuanUjian = $pengajuanUjian->map(function ($u) {
            // Ujian sebelumnya (sama mahasiswa, beda id, sudah ada penguji)
            $prevPenguji = PengajuanUjian::where('mahasiswa_id', $u->mahasiswa_id)
                ->where('id', '!=', $u->id)
                ->whereHas('penguji')
                ->with('penguji.dosen.user')
                ->latest()
                ->first();

            $u->prev_penguji = $prevPenguji
                ? $prevPenguji->penguji->map(fn($p) => [
                    'id'    => $p->id,
                    'urutan' => $p->urutan,
                    'dosen' => [
                        'id'   => $p->dosen->id,
                        'nidn' => $p->dosen->nidn,
                        'user' => ['name' => $p->dosen->user->name ?? '-'],
                    ],
                ])->values()
                : collect();

            return $u;
        });

        $dosenList = Dosen::with('user')
            ->whereHas('user', fn($q) => $q->where('is_active', true))
            ->where(fn($q) => $q->where('kategori', '!=', 'asisten ahli')->orWhereNull('kategori'))
            ->get();

        $ruanganList = Ruangan::where('is_active', true)->get();

        return Inertia::render('Admin/Ujian/Index', [
            'pengajuanUjian' => $pengajuanUjian,
            'dosenList'      => $dosenList,
            'ruanganList'    => $ruanganList,
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    public function assignPenguji(Request $request, $id)
    {
        $request->validate([
            'dosen_ids'   => 'required|array|min:1',
            'dosen_ids.*' => 'required|exists:dosen,id',
        ]);

        // Validasi: tidak boleh asisten ahli
        foreach ($request->dosen_ids as $dosenId) {
            $dosen = Dosen::findOrFail($dosenId);
            if ($dosen->kategori === 'asisten ahli') {
                return back()->with('error', 'Dosen dengan kategori Asisten Ahli tidak dapat menjadi penguji.');
            }
        }

        // Validasi: tidak boleh duplikat dalam daftar yang diajukan
        if (count($request->dosen_ids) !== count(array_unique($request->dosen_ids))) {
            return back()->with('error', 'Dosen yang sama tidak boleh dipilih lebih dari sekali.');
        }

        $pengajuan = PengajuanUjian::findOrFail($id);

        // ── PERBAIKAN BUG UTAMA ──────────────────────────────────
        // Soft delete tidak cukup karena unique constraint mencakup soft-deleted rows.
        // Gunakan forceDelete untuk benar-benar hapus sebelum insert ulang.
        PengujiUjian::where('pengajuan_ujian_id', $id)->forceDelete();
        // ────────────────────────────────────────────────────────

        foreach ($request->dosen_ids as $urutan => $dosenId) {
            PengujiUjian::create([
                'pengajuan_ujian_id' => $id,
                'dosen_id'           => $dosenId,
                'urutan'             => $urutan + 1,
                'assigned_by'        => Auth::id(),
                'assigned_at'        => now(),
            ]);
        }

        $pengajuan->update(['status' => 'reviewed']);

        return back()->with('success', 'Penguji berhasil ditugaskan.');
    }

    // ─────────────────────────────────────────────────────────────
    public function setJadwal(Request $request, $id)
    {
        $request->validate([
            'ruangan_id'  => 'required|exists:ruangan,id',
            'tanggal'     => 'required|date',
            'jam_mulai'   => 'required',
            'jam_selesai' => 'required|after:jam_mulai',
            'catatan'     => 'nullable|string',
        ]);

        // Cek konflik ruangan
        $conflict = JadwalUjian::where('ruangan_id', $request->ruangan_id)
            ->where('tanggal', $request->tanggal)
            ->where('pengajuan_ujian_id', '!=', $id) // boleh update jadwal sendiri
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
                'ruangan_id'  => $request->ruangan_id,
                'tanggal'     => $request->tanggal,
                'jam_mulai'   => $request->jam_mulai,
                'jam_selesai' => $request->jam_selesai,
                'catatan'     => $request->catatan,
                'created_by'  => Auth::id(),
            ]
        );

        return back()->with('success', 'Jadwal ujian berhasil diatur.');
    }
}