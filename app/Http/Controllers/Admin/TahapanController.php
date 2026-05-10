<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TahapanConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TahapanController extends Controller
{
    public function index()
    {
        $tahapan = TahapanConfig::orderBy('urutan')->get()->map(function ($t) {
            return [
                'id' => $t->id,
                'nama' => $t->nama_tahapan,
                'kode' => $t->kode,
                'tipe' => $t->tipe,
                'urutan' => $t->urutan,
                'deskripsi' => $t->deskripsi,
                'min_bab_sebelum' => $t->min_bab_acc,
                'status' => $t->is_active ? 'aktif' : 'nonaktif',
            ];
        });

        return Inertia::render('Admin/Tahapan/Index', [
            'tahapan' => $tahapan,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'tipe' => 'required|in:bimbingan,ujian,administrasi',
            'urutan' => 'required|integer|min:1',
            'min_bab_sebelum' => 'nullable|integer|min:0',
            'status' => 'required|in:aktif,nonaktif',
            'deskripsi' => 'nullable|string|max:500',
        ]);

        // Generate kode from nama
        $kode = strtoupper(Str::slug($validated['nama'], '_'));
        // Ensure unique kode
        $baseKode = $kode;
        $counter = 1;
        while (TahapanConfig::where('kode', $kode)->exists()) {
            $kode = $baseKode . '_' . $counter++;
        }

        TahapanConfig::create([
            'nama_tahapan' => $validated['nama'],
            'kode' => $kode,
            'tipe' => $validated['tipe'],
            'urutan' => $validated['urutan'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'min_bab_acc' => $validated['min_bab_sebelum'],
            'is_active' => $validated['status'] === 'aktif',
            'created_by' => $request->user()->id ?? null,
        ]);

        return redirect()->back()->with('success', 'Tahapan berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $tahapan = TahapanConfig::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'tipe' => 'required|in:bimbingan,ujian,administrasi',
            'urutan' => 'required|integer|min:1',
            'min_bab_sebelum' => 'nullable|integer|min:0',
            'status' => 'required|in:aktif,nonaktif',
            'deskripsi' => 'nullable|string|max:500',
        ]);

        $tahapan->update([
            'nama_tahapan' => $validated['nama'],
            'tipe' => $validated['tipe'],
            'urutan' => $validated['urutan'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'min_bab_acc' => $validated['min_bab_sebelum'],
            'is_active' => $validated['status'] === 'aktif',
        ]);

        return redirect()->back()->with('success', 'Tahapan berhasil diupdate');
    }

    public function destroy($id)
    {
        $tahapan = TahapanConfig::findOrFail($id);
        $tahapan->delete();

        return redirect()->back()->with('success', 'Tahapan berhasil dihapus');
    }
}