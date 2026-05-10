<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\Konsentrasi;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DosenController extends Controller
{
    public function index()
    {
        $dosen = Dosen::with(['user', 'konsentrasi'])->orderBy('created_at', 'desc')->get()->map(function ($d) {
            return [
                'id' => $d->id,
                'nidn' => $d->nidn,
                'bidang_keahlian' => $d->bidang_keahlian,
                'kuota_bimbingan' => $d->kuota_bimbingan,
                'current_load' => $d->getCurrentLoad(),
                'available_slots' => $d->getAvailableSlots(),
                'foto' => $d->foto_profil_path,
                'paraf' => $d->paraf_path,
                'is_kaprodi' => $d->is_kaprodi,
                'status' => $d->user ? ($d->user->is_active ? 'aktif' : 'nonaktif') : 'nonaktif',
                'user' => $d->user ? ['id' => $d->user->id, 'name' => $d->user->name, 'email' => $d->user->email] : null,
                'konsentrasi' => $d->konsentrasi->map(fn($k) => ['id' => $k->id, 'nama' => $k->nama]),
            ];
        });
        $konsentrasiList = Konsentrasi::where('is_active', true)->get()->map(fn($k) => ['id' => $k->id, 'nama' => $k->nama]);

        return Inertia::render('Admin/Dosen/Index', [
            'dosen' => $dosen,
            'konsentrasiList' => $konsentrasiList,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nidn' => 'required|string|unique:dosen,nidn',
            'bidang_keahlian' => 'nullable|string|max:255',
            'kuota_bimbingan' => 'required|integer|min:0|max:50',
            'no_hp' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'konsentrasi_ids' => 'nullable|array',
            'konsentrasi_ids.*' => 'exists:konsentrasi,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => 'dosen',
            'is_active' => true,
        ]);

        $dosen = Dosen::create([
            'user_id' => $user->id,
            'nidn' => $validated['nidn'],
            'bidang_keahlian' => $validated['bidang_keahlian'],
            'kuota_bimbingan' => $validated['kuota_bimbingan'],
            'no_hp' => $validated['no_hp'] ?? null,
        ]);

        if (!empty($validated['konsentrasi_ids'])) {
            $dosen->konsentrasi()->sync($validated['konsentrasi_ids']);
        }

        return redirect()->back()->with('success', 'Dosen berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $dosen = Dosen::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $dosen->user_id,
            'nidn' => 'required|string|unique:dosen,nidn,' . $id,
            'bidang_keahlian' => 'nullable|string|max:255',
            'kuota_bimbingan' => 'required|integer|min:0|max:50',
            'no_hp' => 'nullable|string|max:20',
            'konsentrasi_ids' => 'nullable|array',
            'konsentrasi_ids.*' => 'exists:konsentrasi,id',
        ]);

        $dosen->user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        $dosen->update([
            'nidn' => $validated['nidn'],
            'bidang_keahlian' => $validated['bidang_keahlian'],
            'kuota_bimbingan' => $validated['kuota_bimbingan'],
            'no_hp' => $validated['no_hp'] ?? null,
        ]);

        if (isset($validated['konsentrasi_ids'])) {
            $dosen->konsentrasi()->sync($validated['konsentrasi_ids']);
        }

        return redirect()->back()->with('success', 'Dosen berhasil diupdate');
    }

    public function toggleKaprodi($id)
    {
        $dosen = Dosen::findOrFail($id);

        if ($dosen->is_kaprodi) {
            // Remove kaprodi status
            $dosen->update(['is_kaprodi' => false]);
            return redirect()->back()->with('success', 'Status Kaprodi berhasil dicabut dari ' . $dosen->user->name);
        }

        // Remove kaprodi from existing kaprodi
        $existingKaprodi = Dosen::where('is_kaprodi', true)->first();
        if ($existingKaprodi) {
            $existingKaprodi->update(['is_kaprodi' => false]);
        }

        // Set new kaprodi
        $dosen->update(['is_kaprodi' => true]);

        return redirect()->back()->with('success', $dosen->user->name . ' berhasil ditetapkan sebagai Kaprodi');
    }

    public function destroy($id)
    {
        $dosen = Dosen::findOrFail($id);
        $dosen->delete();

        return redirect()->back()->with('success', 'Dosen berhasil dihapus');
    }
}
