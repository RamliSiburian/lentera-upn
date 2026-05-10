<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RuanganController extends Controller
{
    public function index()
    {
        $ruangan = Ruangan::orderBy('created_at', 'desc')->get()->map(function ($r) {
            return [
                'id' => $r->id,
                'nama' => $r->nama_ruangan,
                'kode_ruangan' => $r->kode_ruangan,
                'gedung' => $r->gedung,
                'lantai' => $r->lantai,
                'kapasitas' => $r->kapasitas,
                'fasilitas' => $r->fasilitas,
                'status' => $r->is_active ? 'tersedia' : 'tidak_tersedia',
                'is_active' => $r->is_active,
            ];
        });

        return Inertia::render('Admin/Ruangan/Index', [
            'ruangan' => $ruangan,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'gedung' => 'nullable|string|max:100',
            'lantai' => 'nullable|integer|min:0',
            'kapasitas' => 'required|integer|min:1',
            'status' => 'required|in:tersedia,tidak_tersedia',
        ]);

        $kodeRuangan = 'R-' . strtoupper(substr(uniqid(), -5));

        Ruangan::create([
            'nama_ruangan' => $validated['nama'],
            'kode_ruangan' => $kodeRuangan,
            'gedung' => $validated['gedung'] ?? null,
            'lantai' => $validated['lantai'] ?? 1,
            'kapasitas' => $validated['kapasitas'],
            'is_active' => $validated['status'] === 'tersedia',
        ]);

        return redirect()->back()->with('success', 'Ruangan berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $ruangan = Ruangan::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'gedung' => 'nullable|string|max:100',
            'lantai' => 'nullable|integer|min:0',
            'kapasitas' => 'required|integer|min:1',
            'status' => 'required|in:tersedia,tidak_tersedia',
        ]);

        $ruangan->update([
            'nama_ruangan' => $validated['nama'],
            'gedung' => $validated['gedung'] ?? null,
            'lantai' => $validated['lantai'] ?? 1,
            'kapasitas' => $validated['kapasitas'],
            'is_active' => $validated['status'] === 'tersedia',
        ]);

        return redirect()->back()->with('success', 'Ruangan berhasil diupdate');
    }

    public function destroy($id)
    {
        $ruangan = Ruangan::findOrFail($id);
        $ruangan->delete();

        return redirect()->back()->with('success', 'Ruangan berhasil dihapus');
    }
}