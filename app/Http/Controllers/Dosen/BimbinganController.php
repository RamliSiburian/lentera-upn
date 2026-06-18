<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Bimbingan;
use App\Models\BimbinganAcc;
use App\Models\Dosen;
use App\Models\Komentar;
use App\Models\Pembimbing;
use App\Services\ApprovalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BimbinganController extends Controller
{
    private function getDosen()
    {
        return Dosen::where('user_id', Auth::id())->firstOrFail();
    }

    public function index(ApprovalService $approvalService)
    {
        $dosen = $this->getDosen();

        // Step dosen yang perlu dikonfirmasi
        $dosenPendingSteps = $approvalService->getStepsForRole('pembimbing', 'dosen');
        if (empty($dosenPendingSteps)) {
            $dosenPendingSteps = ['dosen_approval', 'requested'];
        }

        $pembimbings = Pembimbing::where('dosen_id', $dosen->id)
            ->with([
                'judulPengajuan' => function ($q) {
                    // Load judul via mahasiswa relationship
                },
                'mahasiswa.user',
                'mahasiswa.judulPengajuan' => function ($q) {
                    $q->whereNotIn('status', ['rejected'])->with('konsentrasi');
                },
            ])
            ->where('status', '!=', 'rejected')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($p) use ($dosen) {
                $judul = \App\Models\JudulPengajuan::where('mahasiswa_id', $p->mahasiswa_id)
                    ->whereNotIn('status', ['rejected'])
                    ->with(['konsentrasi', 'mahasiswa.user'])
                    ->first();

                $bimbingans = Bimbingan::where('mahasiswa_id', $p->mahasiswa_id)
                    ->with(['tahapanConfig', 'approvals.pembimbing.dosen.user', 'komentar.user', 'files'])
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($b) {
                        return [
                            'id' => $b->id,
                            'tipe' => $b->tipe,
                            'status' => $b->status,
                            'catatan_mhs' => $b->catatan_mhs,
                            'versi' => $b->bimbingan_ke,
                            'created_at' => $b->created_at,
                            'tahapan_config' => $b->tahapanConfig ? ['id' => $b->tahapanConfig->id, 'nama' => $b->tahapanConfig->nama_tahapan, 'nama_tahapan' => $b->tahapanConfig->nama_tahapan, 'urutan' => $b->tahapanConfig->urutan] : null,
                            'files' => $b->files->map(fn($f) => [
                                'id' => $f->id,
                                'nama_file' => $f->judul_laporan,
                                'path_file' => $f->file_path,
                            ])->toArray(),
                            'approvals' => $b->approvals->map(function ($a) {
                                return [
                                    'id' => $a->id,
                                    'status' => $a->status,
                                    'catatan' => $a->catatan,
                                    'pembimbing_id' => $a->pembimbing_id,
                                    'file_revisi' => $a->file_revisi ? asset('storage/' . $a->file_revisi) : null,
                                    'pembimbing' => $a->pembimbing ? [
                                        'urutan' => $a->pembimbing->urutan === 'pembimbing_utama' ? 1 : 2,
                                        'dosen' => ['nama' => $a->pembimbing->dosen?->user?->name ?? '-'],
                                    ] : null,
                                ];
                            }),
                            'komentar' => $b->komentar->map(function ($k) {
                                return [
                                    'id' => $k->id,
                                    'komentar' => $k->isi,
                                    'created_at' => $k->created_at,
                                    'user' => ['name' => $k->user->name, 'role' => $k->user->role],
                                ];
                            }),
                        ];
                    });

                return [
                    'id' => $p->id,
                    'urutan' => $p->urutan === 'pembimbing_utama' ? 1 : 2,
                    'status' => $p->status,
                    'judulPengajuan' => $judul ? [
                        'id' => $judul->id,
                        'judul' => $judul->judul,
                        'mahasiswa' => [
                            'id' => $judul->mahasiswa->id,
                            'nim' => $judul->mahasiswa->nim,
                            'nama' => $judul->mahasiswa->user->name ?? '-',
                        ],
                        'konsentrasi' => $judul->konsentrasi ? ['id' => $judul->konsentrasi->id, 'nama' => $judul->konsentrasi->nama] : null,
                        'bimbingan' => $bimbingans,
                    ] : null,
                ];
            });

        return Inertia::render('Dosen/Bimbingan/Index', [
            'pembimbings'       => $pembimbings,
            'dosenPendingSteps' => $dosenPendingSteps, // step yang butuh konfirmasi dosen
            'dosen'             => ['id' => $dosen->id, 'nama' => $dosen->user->name ?? '-', 'nidn' => $dosen->nidn],
        ]);
    }

    public function approvePembimbing($id, ApprovalService $approvalService)
    {
        $dosen = $this->getDosen();

        // Step yang menjadi tanggung jawab dosen (dari approval config)
        $dosenSteps = $approvalService->getStepsForRole('pembimbing', 'dosen');
        if (empty($dosenSteps)) {
            $dosenSteps = ['dosen_approval'];
        }

        $pembimbing = Pembimbing::where('dosen_id', $dosen->id)
            ->whereIn('status', $dosenSteps)
            ->findOrFail($id);

        // processApproval menentukan next step dari ApprovalConfig.
        // Karena dosen adalah step terakhir, next step = null → status = 'approved'.
        $approvalService->processApproval(
            $pembimbing,
            'pembimbing',
            'approved',
            ['actor_id' => Auth::id()],
            'pembimbing_approval_log',
            'pembimbing_id'
        );

        return redirect()->route('dosen.bimbingan')->with('success', 'Pembimbing diterima. Mahasiswa dapat memulai bimbingan.');
    }

    public function rejectPembimbing(Request $request, $id, ApprovalService $approvalService)
    {
        $dosen = $this->getDosen();

        $dosenSteps = $approvalService->getStepsForRole('pembimbing', 'dosen');
        if (empty($dosenSteps)) {
            $dosenSteps = ['dosen_approval'];
        }

        $pembimbing = Pembimbing::where('dosen_id', $dosen->id)
            ->whereIn('status', $dosenSteps)
            ->findOrFail($id);

        $validated = $request->validate(['catatan' => 'required|string']);

        $pembimbing->keterangan_tolak = $validated['catatan'];

        $approvalService->processApproval(
            $pembimbing,
            'pembimbing',
            'rejected',
            [
                'actor_id' => Auth::id(),
                'catatan'  => $validated['catatan'],
            ],
            'pembimbing_approval_log',
            'pembimbing_id'
        );

        return redirect()->route('dosen.bimbingan')->with('success', 'Konfirmasi pembimbing ditolak.');
    }

    public function approveBimbingan(Request $request, $id)
    {
        $dosen = $this->getDosen();
        $bimbingan = Bimbingan::findOrFail($id);

        // Find the correct pembimbing for this dosen AND this bimbingan's mahasiswa
        $pembimbing = Pembimbing::where('dosen_id', $dosen->id)
            ->where('mahasiswa_id', $bimbingan->mahasiswa_id)
            ->firstOrFail();

        $acc = BimbinganAcc::where('bimbingan_id', $id)
            ->where('pembimbing_id', $pembimbing->id)
            ->firstOrFail();

        $acc->update([
            'status' => 'approved',
            'catatan' => $request->input('catatan'),
            'reviewed_at' => now(),
        ]);

        // Check if all pembimbing approved
        $bimbingan = Bimbingan::findOrFail($id);
        $allApproved = $bimbingan->approvals()->where('status', '!=', 'approved')->count() === 0;
        if ($allApproved) {
            $bimbingan->update(['status' => 'approved']);
            \App\Services\NotifikasiService::send(
                $bimbingan->mahasiswa->user->id,
                'Bimbingan Disetujui',
                'Bimbingan ' . ($bimbingan->tahapanConfig->nama_tahapan ?? '') . ' Anda telah disetujui oleh seluruh pembimbing.',
                'bimbingan',
                $bimbingan->id
            );
        } else {
            $bimbingan->update(['status' => 'in_review']);
            \App\Services\NotifikasiService::send(
                $bimbingan->mahasiswa->user->id,
                'Bimbingan Disetujui Sebagian',
                'Bimbingan Anda disetujui oleh ' . $dosen->user->name . '.',
                'bimbingan',
                $bimbingan->id
            );
        }

        return redirect()->route('dosen.bimbingan')->with('success', 'Bimbingan disetujui.');
    }

    public function revisiBimbingan(Request $request, $id)
    {
        $dosen = $this->getDosen();
        $bimbingan = Bimbingan::findOrFail($id);

        $request->validate([
            'catatan' => 'required|string',
            'file_revisi' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        // Find the correct pembimbing for this dosen AND this bimbingan's mahasiswa
        $pembimbing = Pembimbing::where('dosen_id', $dosen->id)
            ->where('mahasiswa_id', $bimbingan->mahasiswa_id)
            ->firstOrFail();

        $acc = BimbinganAcc::where('bimbingan_id', $id)
            ->where('pembimbing_id', $pembimbing->id)
            ->firstOrFail();

        $updateData = [
            'status' => 'rejected',
            'catatan' => $request->input('catatan'),
            'reviewed_at' => now(),
        ];

        if ($request->hasFile('file_revisi')) {
            $updateData['file_revisi'] = $request->file('file_revisi')->store('bimbingan_revisi/' . $bimbingan->mahasiswa_id, 'public');
        }

        $acc->update($updateData);

        // Hitung ulang status bimbingan berdasarkan semua approval
        // Jika ada yang rejected → bimbingan rejected
        // Jika semua approved → bimbingan approved
        // Selain itu → in_review
        $bimbinganAcls = BimbinganAcc::where('bimbingan_id', $id)->get();
        $hasRejected = $bimbinganAcls->where('status', 'rejected')->count() > 0;
        $allApproved = $bimbinganAcls->where('status', '!=', 'approved')->count() === 0;

        if ($allApproved) {
            $bimbingan->update(['status' => 'approved']);
            \App\Services\NotifikasiService::send(
                $bimbingan->mahasiswa->user->id,
                'Bimbingan Disetujui',
                'Bimbingan ' . ($bimbingan->tahapanConfig->nama_tahapan ?? '') . ' Anda telah disetujui oleh seluruh pembimbing.',
                'bimbingan',
                $bimbingan->id
            );
        } elseif ($hasRejected) {
            $bimbingan->update(['status' => 'rejected']);
            \App\Services\NotifikasiService::send(
                $bimbingan->mahasiswa->user->id,
                'Revisi Bimbingan Diminta',
                'Bimbingan Anda perlu direvisi oleh ' . $dosen->user->name . '. Catatan: ' . $request->input('catatan'),
                'bimbingan',
                $bimbingan->id
            );
        } else {
            $bimbingan->update(['status' => 'in_review']);
        }

        return redirect()->route('dosen.bimbingan')->with('success', 'Revisi diminta. Mahasiswa dapat mengupload perbaikan di bimbingan yang sama.');
    }

    public function rejectBimbingan(Request $request, $id)
    {
        return $this->revisiBimbingan($request, $id);
    }

    public function komentar(Request $request, $id)
    {
        $bimbingan = Bimbingan::findOrFail($id);

        $validated = $request->validate([
            'komentar' => 'required|string',
        ]);

        Komentar::create([
            'bimbingan_id' => $bimbingan->id,
            'user_id' => Auth::id(),
            'isi' => $validated['komentar'],
        ]);

        return redirect()->route('dosen.bimbingan')->with('success', 'Komentar ditambahkan.');
    }
}