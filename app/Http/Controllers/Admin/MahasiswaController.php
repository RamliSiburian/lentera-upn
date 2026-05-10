<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MahasiswaController extends Controller
{
    public function index()
    {
        $mahasiswa = Mahasiswa::with('user')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Mahasiswa/Index', [
            'mahasiswa' => $mahasiswa,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nim' => 'required|string|unique:mahasiswa,nim',
            'program_studi' => 'required|string|max:255',
            'angkatan' => 'required|integer|min:2010|max:2030',
            'no_hp' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => 'mahasiswa',
        ]);

        Mahasiswa::create([
            'user_id' => $user->id,
            'nim' => $validated['nim'],
            'program_studi' => $validated['program_studi'],
            'angkatan' => $validated['angkatan'],
            'no_hp' => $validated['no_hp'],
            'status' => 'aktif',
        ]);

        return redirect()->back()->with('success', 'Mahasiswa berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $mhs = Mahasiswa::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $mhs->user_id,
            'nim' => 'required|string|unique:mahasiswa,nim,' . $id,
            'program_studi' => 'required|string|max:255',
            'angkatan' => 'required|integer|min:2010|max:2030',
            'no_hp' => 'nullable|string|max:20',
            'status' => 'required|in:aktif,nonaktif,cuti,lulus',
        ]);

        $mhs->user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        $mhs->update([
            'nim' => $validated['nim'],
            'program_studi' => $validated['program_studi'],
            'angkatan' => $validated['angkatan'],
            'no_hp' => $validated['no_hp'],
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Mahasiswa berhasil diupdate');
    }

    public function destroy($id)
    {
        $mhs = Mahasiswa::findOrFail($id);
        $mhs->delete();

        return redirect()->back()->with('success', 'Mahasiswa berhasil dihapus');
    }
}