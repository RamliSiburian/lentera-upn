<?php

namespace App\Http\Controllers\Kaprodi;

use App\Http\Controllers\Controller;
use App\Models\JudulPengajuan;
use App\Models\Pembimbing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class JudulController extends Controller
{
    public function index()
    {
        $juduls = JudulPengajuan::with(['konsentrasi', 'mahasiswa.user', 'pembimbing.dosen.user'])
            ->whereIn('status', ['submitted', 'verified_admin', 'approved_kaprodi'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Kaprodi/Judul/Index', [
            'juduls' => $juduls,
        ]);
    }

    public function approve($id)
    {
        $judul = JudulPengajuan::whereIn('status', ['submitted', 'verified_admin'])->findOrFail($id);
        $judul->update([
            'status' => 'approved_kaprodi',
        ]);

        return redirect()->route('kaprodi.judul')->with('success', 'Judul berhasil disetujui.');
    }

    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'catatan' => 'required|string',
        ]);

        $judul = JudulPengajuan::whereIn('status', ['submitted', 'verified_admin'])->findOrFail($id);
        $judul->update([
            'status' => 'rejected',
            'keterangan_tolak' => $validated['catatan'],
        ]);

        return redirect()->route('kaprodi.judul')->with('success', 'Judul berhasil ditolak.');
    }

    public function approvePembimbing($id)
    {
        $pembimbing = Pembimbing::whereIn('status', ['requested', 'verified_admin'])->findOrFail($id);
        $pembimbing->update([
            'status' => 'approved',
            'final_approved_by' => Auth::id(),
            'final_approved_at' => now(),
        ]);

        return redirect()->route('kaprodi.judul')->with('success', 'Pembimbing berhasil disetujui.');
    }

    public function rejectPembimbing(Request $request, $id)
    {
        $validated = $request->validate([
            'catatan' => 'required|string',
        ]);

        $pembimbing = Pembimbing::whereIn('status', ['requested', 'verified_admin'])->findOrFail($id);
        $pembimbing->update([
            'status' => 'rejected',
            'keterangan_tolak' => $validated['catatan'],
        ]);

        return redirect()->route('kaprodi.judul')->with('success', 'Pembimbing berhasil ditolak.');
    }
}