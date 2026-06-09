<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\ProgramStudi;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MahasiswaController extends Controller
{
    public function index()
    {
        $mahasiswa = Mahasiswa::with(['user', 'prodi'])
            ->orderBy('created_at', 'desc')
            ->get();

        $prodis = ProgramStudi::where('is_active', true)
            ->orderBy('jenjang')
            ->orderBy('nama')
            ->get();

        return Inertia::render('Admin/Mahasiswa/Index', [
            'mahasiswa' => $mahasiswa,
            'prodis'    => $prodis,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'nim'       => 'required|string|unique:mahasiswa,nim',
            'prodi_id'  => 'required|uuid|exists:program_studi,id',
            'angkatan'  => 'required|integer|min:2010|max:2035',
            'no_hp'     => 'nullable|string|max:20',
            'password'  => 'required|string|min:6',
        ]);

        $user = User::create([
            'name'              => $validated['name'],
            'email'             => $validated['email'],
            'password'          => bcrypt($validated['password']),
            'role'              => 'mahasiswa',
            'email_verified_at' => now(),
        ]);

        Mahasiswa::create([
            'user_id'  => $user->id,
            'nim'      => $validated['nim'],
            'prodi_id' => $validated['prodi_id'],
            'angkatan' => $validated['angkatan'],
            'no_hp'    => $validated['no_hp'],
            'status'   => 'aktif',
        ]);

        return redirect()->back()->with('success', 'Mahasiswa berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $mhs = Mahasiswa::findOrFail($id);

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email,' . $mhs->user_id,
            'nim'      => 'required|string|unique:mahasiswa,nim,' . $id,
            'prodi_id' => 'required|uuid|exists:program_studi,id',
            'angkatan' => 'required|integer|min:2010|max:2035',
            'no_hp'    => 'nullable|string|max:20',
            'status'   => 'required|in:aktif,nonaktif,cuti,lulus',
            'password' => 'nullable|string|min:6',
        ]);

        $userUpdate = [
            'name'  => $validated['name'],
            'email' => $validated['email'],
        ];

        // Update password hanya jika diisi
        if (!empty($validated['password'])) {
            $userUpdate['password'] = bcrypt($validated['password']);
        }

        $mhs->user->update($userUpdate);

        $mhs->update([
            'nim'      => $validated['nim'],
            'prodi_id' => $validated['prodi_id'],
            'angkatan' => $validated['angkatan'],
            'no_hp'    => $validated['no_hp'],
            'status'   => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Mahasiswa berhasil diupdate.');
    }

    public function destroy($id)
    {
        $mhs = Mahasiswa::findOrFail($id);
        $mhs->delete();

        return redirect()->back()->with('success', 'Mahasiswa berhasil dihapus.');
    }
}