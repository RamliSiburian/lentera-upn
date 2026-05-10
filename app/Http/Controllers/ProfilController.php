<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ProfilController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $user->load('mahasiswa', 'dosen.konsentrasi');

        $profilData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'role_name' => $user->getRoleName(),
            'last_login_at' => $user->last_login_at?->format('d M Y H:i'),
            'created_at' => $user->created_at?->format('d M Y'),
        ];

        if ($user->mahasiswa) {
            $profilData['mahasiswa'] = [
                'nim' => $user->mahasiswa->nim,
                'program_studi' => $user->mahasiswa->program_studi,
                'angkatan' => $user->mahasiswa->angkatan,
                'status' => $user->mahasiswa->status,
                'no_hp' => $user->mahasiswa->no_hp,
            ];
        }

        if ($user->dosen) {
            $profilData['dosen'] = [
                'nidn' => $user->dosen->nidn,
                'bidang_keahlian' => $user->dosen->bidang_keahlian,
                'kuota_bimbingan' => $user->dosen->kuota_bimbingan,
                'is_kaprodi' => $user->dosen->is_kaprodi,
                'no_hp' => $user->dosen->no_hp,
                'foto_profil_path' => $user->dosen->foto_profil_path,
                'paraf_path' => $user->dosen->paraf_path,
                'konsentrasi' => $user->dosen->konsentrasi->map(fn ($k) => [
                    'id' => $k->id,
                    'nama' => $k->nama,
                ]),
            ];
        }

        return Inertia::render('Profil/Index', [
            'profil' => $profilData,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $rules = [
            'name' => 'required|string|max:255',
        ];

        // If mahasiswa, allow updating no_hp
        if ($user->mahasiswa) {
            $rules['no_hp'] = 'nullable|string|max:20';
        }

        // If dosen, allow updating no_hp, foto_profil, paraf
        if ($user->dosen) {
            $rules['no_hp'] = 'nullable|string|max:20';
            $rules['foto_profil'] = 'nullable|image|max:2048';
            $rules['paraf'] = 'nullable|image|max:1024';
        }

        $validated = $request->validate($rules);

        $user->update(['name' => $validated['name']]);

        if ($user->mahasiswa && isset($validated['no_hp'])) {
            $user->mahasiswa->update(['no_hp' => $validated['no_hp']]);
        }

        if ($user->dosen) {
            $dosenData = [];
            if (isset($validated['no_hp'])) {
                $dosenData['no_hp'] = $validated['no_hp'];
            }
            if ($request->hasFile('foto_profil')) {
                $path = $request->file('foto_profil')->store('dosen/foto', 'public');
                $dosenData['foto_profil_path'] = $path;
            }
            if ($request->hasFile('paraf')) {
                $path = $request->file('paraf')->store('dosen/paraf', 'public');
                $dosenData['paraf_path'] = $path;
            }
            if (!empty($dosenData)) {
                $user->dosen->update($dosenData);
            }
        }

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = auth()->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors([
                'current_password' => 'Password saat ini tidak sesuai.',
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password berhasil diubah.');
    }
}