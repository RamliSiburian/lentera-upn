<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\JudulPengajuan;
use App\Models\Pembimbing;
use App\Models\Mahasiswa;
use App\Models\Dosen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class JudulController extends Controller
{
    private function getMahasiswa()
    {
        return Mahasiswa::where('user_id', Auth::id())->firstOrFail();
    }

    public function index()
    {
        $mahasiswa = $this->getMahasiswa();
        $juduls = JudulPengajuan::where('mahasiswa_id', $mahasiswa->id)
            ->with(['konsentrasi', 'pembimbing.dosen.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $konsentrasis = \App\Models\Konsentrasi::where('is_active', true)->get();

        return Inertia::render('Mahasiswa/Judul/Index', [
            'juduls' => $juduls,
            'konsentrasis' => $konsentrasis,
        ]);
    }

    public function store(Request $request)
    {
        $mahasiswa = $this->getMahasiswa();

        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'konsentrasi_id' => 'required|uuid|exists:konsentrasi,id',
            'deskripsi' => 'nullable|string',
            'dokumen' => 'required|file|mimes:pdf|max:10240',
        ]);

        // Check active judul
        $activeCount = JudulPengajuan::where('mahasiswa_id', $mahasiswa->id)
            ->whereNotIn('status', ['rejected'])
            ->count();

        // Upload dokumen
        if ($request->hasFile('dokumen')) {
            $validated['dokumen'] = $request->file('dokumen')->store('sinopsis/' . $mahasiswa->id, 'public');
        }

        $validated['mahasiswa_id'] = $mahasiswa->id;
        $validated['pengajuan_ke'] = $activeCount + 1;
        $validated['status'] = 'draft';

        JudulPengajuan::create($validated);

        return redirect()->route('mahasiswa.judul')->with('success', 'Judul berhasil disimpan sebagai draft.');
    }

    public function update(Request $request, $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $judul = JudulPengajuan::where('mahasiswa_id', $mahasiswa->id)->findOrFail($id);

        if (!in_array($judul->status, ['draft', 'rejected'])) {
            return back()->with('error', 'Judul tidak bisa diedit.');
        }

        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'konsentrasi_id' => 'required|uuid|exists:konsentrasi,id',
            'deskripsi' => 'nullable|string',
            'dokumen' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        // Upload new dokumen if provided
        if ($request->hasFile('dokumen')) {
            // Delete old file
            if ($judul->dokumen) {
                Storage::disk('public')->delete($judul->dokumen);
            }
            $validated['dokumen'] = $request->file('dokumen')->store('sinopsis/' . $mahasiswa->id, 'public');
        }

        $judul->update($validated);

        return redirect()->route('mahasiswa.judul')->with('success', 'Judul berhasil diupdate.');
    }

    public function submit($id)
    {
        $mahasiswa = $this->getMahasiswa();
        $judul = JudulPengajuan::where('mahasiswa_id', $mahasiswa->id)->findOrFail($id);

        if ($judul->status !== 'draft' && $judul->status !== 'rejected') {
            return back()->with('error', 'Judul tidak bisa diajukan.');
        }

        $judul->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        return redirect()->route('mahasiswa.judul')->with('success', 'Judul berhasil diajukan.');
    }

    public function destroy($id)
    {
        $mahasiswa = $this->getMahasiswa();
        $judul = JudulPengajuan::where('mahasiswa_id', $mahasiswa->id)->findOrFail($id);

        if ($judul->status !== 'draft') {
            return back()->with('error', 'Hanya draft yang bisa dihapus.');
        }

        $judul->delete();

        return redirect()->route('mahasiswa.judul')->with('success', 'Judul berhasil dihapus.');
    }

    public function availableDosen($konsentrasiId)
    {
        $dosens = Dosen::whereHas('konsentrasi', function ($q) use ($konsentrasiId) {
                $q->where('konsentrasi.id', $konsentrasiId);
            })
            ->with('user')
            ->withCount(['pembimbing as active_bimbingan' => function ($q) {
                $q->where('status', 'approved');
            }])
            ->get()
            ->map(function ($d) {
                return [
                    'id' => $d->id,
                    'nama' => $d->user->name ?? '-',
                    'nidn' => $d->nidn,
                    'kuota_bimbingan' => $d->kuota_bimbingan,
                    'active_bimbingan' => $d->active_bimbingan,
                    'sisa_kuota' => $d->kuota_bimbingan - $d->active_bimbingan,
                ];
            });

        return response()->json($dosens);
    }

    public function requestPembimbing(Request $request, $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $judul = JudulPengajuan::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', 'approved_kaprodi')
            ->findOrFail($id);

        $validated = $request->validate([
            'dosen_id_1' => 'required|uuid|exists:dosen,id',
            'dosen_id_2' => 'nullable|uuid|exists:dosen,id|different:dosen_id_1',
        ]);

        // Delete existing pembimbing requests
        Pembimbing::where('mahasiswa_id', $mahasiswa->id)->delete();

        // Create pembimbing utama
        Pembimbing::create([
            'mahasiswa_id' => $mahasiswa->id,
            'dosen_id' => $validated['dosen_id_1'],
            'urutan' => 'pembimbing_utama',
            'status' => 'requested',
            'requested_at' => now(),
        ]);

        // Create pembimbing pendamping if provided
        if (!empty($validated['dosen_id_2'])) {
            Pembimbing::create([
                'mahasiswa_id' => $mahasiswa->id,
                'dosen_id' => $validated['dosen_id_2'],
                'urutan' => 'pembimbing_pendamping',
                'status' => 'requested',
                'requested_at' => now(),
            ]);
        }

        return redirect()->route('mahasiswa.judul')->with('success', 'Permintaan pembimbing berhasil diajukan.');
    }
}