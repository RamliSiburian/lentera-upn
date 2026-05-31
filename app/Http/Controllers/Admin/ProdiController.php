<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\ProgramStudi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProdiController extends Controller
{
    public function index()
    {
        $prodis = ProgramStudi::with(['mahasiswa', 'kaprodi.user'])
            ->withCount('mahasiswa')
            ->orderBy('jenjang')
            ->orderBy('nama')
            ->get();

        // Dosen yang bisa dipilih sebagai kaprodi (minimal lektor)
        $dosenList = Dosen::with('user')
            ->whereHas('user', fn($q) => $q->where('is_active', true))
            ->whereIn('kategori', ['lektor', 'lektor kepala', 'profesor'])
            ->get()
            ->map(fn($d) => [
                'id'   => $d->id,
                'name' => $d->user->name ?? '-',
                'nidn' => $d->nidn,
                'kategori' => $d->kategori,
            ]);

        return Inertia::render('Admin/Prodi/Index', [
            'prodis'    => $prodis,
            'dosenList' => $dosenList,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode'       => 'required|string|max:20|unique:program_studi,kode',
            'nama'       => 'required|string|max:255',
            'jenjang'    => 'required|in:D3,S1,S2,S3',
            'deskripsi'  => 'nullable|string',
            'kaprodi_id' => 'nullable|exists:dosen,id',
            'is_active'  => 'boolean',
        ]);

        $prodi = ProgramStudi::create($validated);

        // Set is_kaprodi flag pada dosen yang dipilih
        if (!empty($validated['kaprodi_id'])) {
            $this->assignKaprodi($prodi, $validated['kaprodi_id']);
        }

        return redirect()->back()->with('success', 'Program studi berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $prodi = ProgramStudi::findOrFail($id);

        $validated = $request->validate([
            'kode'       => 'required|string|max:20|unique:program_studi,kode,' . $id,
            'nama'       => 'required|string|max:255',
            'jenjang'    => 'required|in:D3,S1,S2,S3',
            'deskripsi'  => 'nullable|string',
            'kaprodi_id' => 'nullable|exists:dosen,id',
            'is_active'  => 'boolean',
        ]);

        // Jika kaprodi berubah, revoke status kaprodi dari yang lama
        $oldKaprodiId = $prodi->kaprodi_id;
        $newKaprodiId = $validated['kaprodi_id'] ?? null;

        $prodi->update($validated);

        if ($oldKaprodiId !== $newKaprodiId) {
            // Cabut status kaprodi dari dosen lama jika tidak menjadi kaprodi prodi lain
            if ($oldKaprodiId) {
                $stillKaprodi = ProgramStudi::where('kaprodi_id', $oldKaprodiId)
                    ->where('id', '!=', $id)
                    ->exists();
                if (!$stillKaprodi) {
                    Dosen::where('id', $oldKaprodiId)->update(['is_kaprodi' => false]);
                }
            }

            // Assign kaprodi baru
            if ($newKaprodiId) {
                $this->assignKaprodi($prodi, $newKaprodiId);
            }
        }

        return redirect()->back()->with('success', 'Program studi berhasil diupdate.');
    }

    public function destroy($id)
    {
        $prodi = ProgramStudi::withCount('mahasiswa')->findOrFail($id);

        if ($prodi->mahasiswa_count > 0) {
            return redirect()->back()->with('error', 'Program studi tidak bisa dihapus karena masih memiliki mahasiswa.');
        }

        // Cabut status kaprodi jika tidak menjadi kaprodi prodi lain
        if ($prodi->kaprodi_id) {
            $stillKaprodi = ProgramStudi::where('kaprodi_id', $prodi->kaprodi_id)
                ->where('id', '!=', $id)
                ->exists();
            if (!$stillKaprodi) {
                Dosen::where('id', $prodi->kaprodi_id)->update(['is_kaprodi' => false]);
            }
        }

        $prodi->delete();

        return redirect()->back()->with('success', 'Program studi berhasil dihapus.');
    }

    /**
     * Assign dosen sebagai kaprodi dan set flag is_kaprodi
     */
    private function assignKaprodi(ProgramStudi $prodi, string $dosenId): void
    {
        $dosen = Dosen::find($dosenId);
        if ($dosen) {
            $dosen->update(['is_kaprodi' => true]);
            // Update role user ke k.prodi
            if ($dosen->user) {
                $dosen->user->update(['role' => 'k.prodi']);
            }
        }
    }
}
