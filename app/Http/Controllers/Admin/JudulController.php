<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JudulPengajuan;
use App\Models\Pembimbing;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JudulController extends Controller
{
    public function index()
    {
        $juduls = JudulPengajuan::with(['konsentrasi', 'mahasiswa.user', 'pembimbing.dosen.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Judul/Index', [
            'juduls' => $juduls,
        ]);
    }

    public function verify($id)
    {
        $judul = JudulPengajuan::where('status', 'submitted')->findOrFail($id);
        $judul->update(['status' => 'verified_admin']);

        return redirect()->route('admin.judul')->with('success', 'Judul berhasil diverifikasi.');
    }

    public function reject(Request $request, $id)
    {
        $validated = $request->validate(['catatan' => 'required|string']);
        $judul = JudulPengajuan::where('status', 'submitted')->findOrFail($id);
        $judul->update([
            'status' => 'rejected',
            'keterangan_tolak' => $validated['catatan'],
        ]);

        return redirect()->route('admin.judul')->with('success', 'Judul ditolak.');
    }

    public function verifyPembimbing($id)
    {
        $pembimbing = Pembimbing::where('status', 'requested')->findOrFail($id);
        $pembimbing->update(['status' => 'verified_admin']);

        return redirect()->route('admin.judul')->with('success', 'Pembimbing diverifikasi.');
    }
}