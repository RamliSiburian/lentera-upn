<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Bimbingan;
use App\Models\BimbinganAcc;
use App\Models\Komentar;
use App\Models\Mahasiswa;
use App\Models\Pembimbing;
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

        // Only show bimbingan-type tahapan (sempro/semhas/sidang handled via pengajuan ujian)
        $tahapanList = TahapanConfig::where('is_active', true)
            ->where('tipe', 'bimbingan')
            ->orderBy('urutan')
            ->get();

        // Determine next tipe & canCreate
        $nextTipe = 'bimbingan';
        $canCreate = false;
        if ($judul && $judul->pembimbing->count() > 0) {
            $lastBimbingan = Bimbingan::where('mahasiswa_id', $mahasiswa->id)
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$lastBimbingan) {
                // First bimbingan ever
                $canCreate = true;
                $nextTipe = 'bimbingan';
            } elseif ($lastBimbingan->status === 'approved') {
                // Last bimbingan approved → can create new bimbingan
                $canCreate = true;
                $nextTipe = 'bimbingan';
            } elseif ($lastBimbingan->status === 'rejected') {
                // Last bimbingan needs revision → can upload revision
                $canCreate = true;
                $nextTipe = 'revisi';
            }
            // If submitted/in_review → cannot create new one yet
        }

        return Inertia::render('Mahasiswa/Bimbingan/Index', [
            'bimbingans' => $bimbingans,
            'judul' => $judul ? [
                'id' => $judul->id,
                'judul' => $judul->judul,
                'pembimbing' => $judul->pembimbing->map(fn($p) => [
                    'id' => $p->id,
                    'urutan' => $p->urutan === 'pembimbing_utama' ? 1 : 2,
                    'dosen' => ['id' => $p->dosen->id, 'nama' => $p->dosen->user->name, 'nidn' => $p->dosen->nidn],
                ]),
            ] : null,
            'tahapanList' => $tahapanList,
            'canCreateBimbingan' => $canCreate,
            'nextTipe' => $nextTipe,
        ]);
    }

    public function store(Request $request)
    {
        $mahasiswa = $this->getMahasiswa();

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

        // Get last bimbingan number
        $lastBimbingan = Bimbingan::where('mahasiswa_id', $mahasiswa->id)->max('bimbingan_ke') ?? 0;

        // Determine tipe: revisi only if last bimbingan was rejected (needs revision)
        $tipe = 'bimbingan';
        $lastBimbinganRecord = Bimbingan::where('mahasiswa_id', $mahasiswa->id)
            ->orderBy('created_at', 'desc')
            ->first();
        if ($lastBimbinganRecord && $lastBimbinganRecord->status === 'rejected') {
            $tipe = 'revisi';
        }

        $bimbingan = Bimbingan::create([
            'mahasiswa_id' => $mahasiswa->id,
            'tahapan_id' => $validated['tahapan_config_id'],
            'judul_laporan' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'tipe' => $tipe,
            'status' => 'submitted',
            'bimbingan_ke' => $lastBimbingan + 1,
            'catatan_mhs' => $validated['catatan_mhs'] ?? null,
            'submitted_at' => now(),
        ]);

        // Create approval records for each approved pembimbing
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
        }

        return redirect()->route('mahasiswa.bimbingan')->with('success', 'Bimbingan berhasil diupload.');
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