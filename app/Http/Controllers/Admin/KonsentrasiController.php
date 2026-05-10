<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Konsentrasi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KonsentrasiController extends Controller
{
    public function index()
    {
        $konsentrasi = Konsentrasi::withCount('judulPengajuan')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Konsentrasi/Index', [
            'konsentrasi' => $konsentrasi,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'required|string|unique:konsentrasi,kode|max:10',
            'deskripsi' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Konsentrasi::create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Konsentrasi berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $konsentrasi = Konsentrasi::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'required|string|unique:konsentrasi,kode,' . $id . '|max:10',
            'deskripsi' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $konsentrasi->update($validated);

        return redirect()->back()->with('success', 'Konsentrasi berhasil diupdate');
    }

    public function destroy($id)
    {
        $konsentrasi = Konsentrasi::findOrFail($id);
        $konsentrasi->delete();

        return redirect()->back()->with('success', 'Konsentrasi berhasil dihapus');
    }
}