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
            'mahasiswaStatus' => $mahasiswa->status,
        ]);
    }

    public function store(Request $request)
    {
        $mahasiswa = $this->getMahasiswa();

        if ($mahasiswa->status === 'lulus') {
            return back()->with('error', 'Anda sudah lulus dan tidak dapat membuat pengajuan baru.');
        }

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

        if ($mahasiswa->status === 'lulus') {
            return back()->with('error', 'Anda sudah lulus dan tidak dapat mengubah judul.');
        }

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

        if ($mahasiswa->status === 'lulus') {
            return back()->with('error', 'Anda sudah lulus dan tidak dapat mengajukan judul.');
        }

        $judul = JudulPengajuan::where('mahasiswa_id', $mahasiswa->id)->findOrFail($id);

        if ($judul->status !== 'draft' && $judul->status !== 'rejected') {
            return back()->with('error', 'Judul tidak bisa diajukan.');
        }

        // Status awal pengajuan selalu 'verified_admin' agar judul masuk antrian verifikasi admin.
        // Step admin pada ApprovalConfig bisa opsional (admin boleh langsung meneruskan ke kaprodi),
        // tetapi mahasiswa tetap harus melewati loket admin sebagai pintu masuk pertama.
        $judul->update([
            'status'       => 'verified_admin',
            'submitted_at' => now(),
        ]);

        return redirect()->route('mahasiswa.judul')->with('success', 'Judul berhasil diajukan.');
    }

    public function destroy($id)
    {
        $mahasiswa = $this->getMahasiswa();

        if ($mahasiswa->status === 'lulus') {
            return back()->with('error', 'Anda sudah lulus dan tidak dapat menghapus judul.');
        }

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
            ->where(function ($q) {
                $q->where('kategori', '!=', 'asisten ahli')
                  ->orWhereNull('kategori');
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

    public function requestPembimbing(Request $request, $id, \App\Services\ApprovalService $approvalService)
    {
        $mahasiswa = $this->getMahasiswa();

        if ($mahasiswa->status === 'lulus') {
            return back()->with('error', 'Anda sudah lulus.');
        }

        $judul = JudulPengajuan::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', 'approved') // changed from approved_kaprodi to approved because now it's fully approved
            ->findOrFail($id);

        $validated = $request->validate([
            'dosen_id_1' => 'required|uuid|exists:dosen,id',
            'dosen_id_2' => 'nullable|uuid|exists:dosen,id|different:dosen_id_1',
        ]);

        $dosen1 = Dosen::findOrFail($validated['dosen_id_1']);
        if ($dosen1->kategori === 'asisten ahli') {
            return back()->with('error', 'Dosen dengan kategori Asisten Ahli tidak dapat dipilih sebagai pembimbing.');
        }

        if (!empty($validated['dosen_id_2'])) {
            $dosen2 = Dosen::findOrFail($validated['dosen_id_2']);
            if ($dosen2->kategori === 'asisten ahli') {
                return back()->with('error', 'Dosen dengan kategori Asisten Ahli tidak dapat dipilih sebagai pembimbing.');
            }
        }

        // Delete existing pembimbing requests
        Pembimbing::where('mahasiswa_id', $mahasiswa->id)->delete();

        $firstStep = $approvalService->getFirstStep('pembimbing') ?? 'requested';

        // Create pembimbing utama
        Pembimbing::create([
            'mahasiswa_id' => $mahasiswa->id,
            'dosen_id' => $validated['dosen_id_1'],
            'urutan' => 'pembimbing_utama',
            'status' => $firstStep,
            'requested_at' => now(),
        ]);

        // Create pembimbing pendamping if provided
        if (!empty($validated['dosen_id_2'])) {
            Pembimbing::create([
                'mahasiswa_id' => $mahasiswa->id,
                'dosen_id' => $validated['dosen_id_2'],
                'urutan' => 'pembimbing_pendamping',
                'status' => $firstStep,
                'requested_at' => now(),
            ]);
        }

        return redirect()->route('mahasiswa.judul')->with('success', 'Permintaan pembimbing berhasil diajukan.');
    }

    /**
     * Ganti pembimbing yang ditolak dengan dosen baru.
     * Hanya mengganti record yang statusnya 'rejected', pembimbing yang sudah accepted tidak tersentuh.
     */
    public function replacePembimbing(Request $request, $id, \App\Services\ApprovalService $approvalService)
    {
        $mahasiswa = $this->getMahasiswa();

        if ($mahasiswa->status === 'lulus') {
            return back()->with('error', 'Anda sudah lulus.');
        }

        $judul = JudulPengajuan::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', 'approved')
            ->findOrFail($id);

        $validated = $request->validate([
            'dosen_id'  => 'required|uuid|exists:dosen,id',
            'urutan'    => 'required|in:pembimbing_utama,pembimbing_pendamping',
        ]);

        $dosenBaru = Dosen::findOrFail($validated['dosen_id']);
        if ($dosenBaru->kategori === 'asisten ahli') {
            return back()->with('error', 'Dosen dengan kategori Asisten Ahli tidak dapat dipilih sebagai pembimbing.');
        }

        // Pastikan dosen ini tidak sudah menjadi pembimbing lain di judul yang sama (yang masih aktif)
        $sudahJadiPembimbing = Pembimbing::where('mahasiswa_id', $mahasiswa->id)
            ->where('dosen_id', $validated['dosen_id'])
            ->whereNotIn('status', ['rejected'])
            ->exists();

        if ($sudahJadiPembimbing) {
            return back()->with('error', 'Dosen ini sudah menjadi pembimbing Anda.');
        }

        // Hapus PERMANEN (forceDelete) pembimbing yang ditolak dengan urutan yang sesuai.
        // Tidak bisa pakai delete() biasa karena Pembimbing menggunakan SoftDeletes,
        // dan unique constraint (mahasiswa_id, urutan) akan tetap dilanggar oleh record soft-deleted.
        Pembimbing::where('mahasiswa_id', $mahasiswa->id)
            ->where('urutan', $validated['urutan'])
            ->where('status', 'rejected')
            ->forceDelete();

        $firstStep = $approvalService->getFirstStep('pembimbing') ?? 'kaprodi_approval';

        Pembimbing::create([
            'mahasiswa_id' => $mahasiswa->id,
            'dosen_id'     => $validated['dosen_id'],
            'urutan'       => $validated['urutan'],
            'status'       => $firstStep,
            'requested_at' => now(),
        ]);

        return redirect()->route('mahasiswa.judul')->with('success', 'Pembimbing berhasil diganti. Menunggu persetujuan Kaprodi.');
    }

    public function requestRevisi(Request $request, $id)
    {
        $mahasiswa = $this->getMahasiswa();

        if ($mahasiswa->status === 'lulus') {
            return back()->with('error', 'Anda sudah lulus.');
        }

        $mahasiswa->load('user');
        
        $judul = JudulPengajuan::where('mahasiswa_id', $mahasiswa->id)->findOrFail($id);

        if ($judul->status !== 'approved' && $judul->revision_status !== 'revision_rejected') {
            return back()->with('error', 'Judul tidak dapat direvisi.');
        }

        $validated = $request->validate([
            'judul_baru' => 'required|string|max:255',
            'alasan_revisi' => 'required|string',
            'dokumen' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $updateData = [
            'judul' => $validated['judul_baru'],
            'alasan_revisi' => $validated['alasan_revisi'],
            'revision_status' => 'revision_pending',
            'revision_submitted_at' => now(),
        ];

        if ($request->hasFile('dokumen')) {
            if ($judul->dokumen) {
                Storage::disk('public')->delete($judul->dokumen);
            }
            $updateData['dokumen'] = $request->file('dokumen')->store('sinopsis/' . $mahasiswa->id, 'public');
        }

        $judul->update($updateData);

        // Notify Kaprodi
        $kaprodiUserIds = \App\Models\User::where('role', 'k.prodi')
            ->orWhereHas('dosen', fn($q) => $q->where('is_kaprodi', true))
            ->pluck('id')
            ->toArray();

        \App\Services\NotifikasiService::sendBulk(
            $kaprodiUserIds,
            'Pengajuan Revisi Judul',
            'Mahasiswa ' . $mahasiswa->user->name . ' mengajukan revisi judul.',
            'judul',
            $judul->id
        );

        return redirect()->route('mahasiswa.judul')->with('success', 'Pengajuan revisi judul berhasil dikirim.');
    }
}