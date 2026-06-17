<?php

namespace App\Http\Controllers\Kaprodi;

use App\Http\Controllers\Controller;
use App\Models\ApprovalConfig;
use App\Models\Dosen;
use App\Models\JudulPengajuan;
use App\Models\Pembimbing;
use App\Models\ProgramStudi;
use App\Services\ApprovalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class JudulController extends Controller
{
    /**
     * Dapatkan prodi yang dikelola kaprodi yang sedang login.
     * Kaprodi bisa mengelola lebih dari 1 prodi (edge case), jadi return array.
     *
     * Chain: Auth::user() → Dosen (via user_id) → ProgramStudi (kaprodi_id = dosen.id)
     */
    private function getKaprodiProdiIds(): array
    {
        $dosen = Dosen::where('user_id', Auth::id())->first();
        if (!$dosen) {
            return [];
        }

        return ProgramStudi::where('kaprodi_id', $dosen->id)
            ->pluck('id')
            ->toArray();
    }

    /**
     * Semua step yang boleh di-aksi kaprodi:
     * - Step dengan role 'k.prodi'
     * - Step admin yang optional (required=false)
     */
    private function getAllowedSteps(ApprovalService $approvalService): array
    {
        $kaprodiSteps = $approvalService->getStepsForRole('judul_pengajuan', 'k.prodi');

        $optionalAdminSteps = [];
        $config = ApprovalConfig::where('module_key', 'judul_pengajuan')
            ->where('is_active', true)->first();
        if ($config) {
            foreach ($config->steps as $step) {
                $isOptional = isset($step['required']) ? !(bool) $step['required'] : false;
                if ($isOptional && $step['role'] === 'admin') {
                    $optionalAdminSteps[] = $step['step'];
                }
            }
        }

        $allowed = array_unique(array_merge($kaprodiSteps, $optionalAdminSteps));
        return empty($allowed) ? ['submitted', 'verified_admin'] : array_values($allowed);
    }

    // ─────────────────────────────────────────────────────────────
    // INDEX
    // ─────────────────────────────────────────────────────────────
    public function index(ApprovalService $approvalService)
    {
        $prodiIds     = $this->getKaprodiProdiIds();
        $allowedSteps = $this->getAllowedSteps($approvalService);

        // Step pembimbing yang bisa diaksi kaprodi (hanya step kaprodi)
        $pembimbingSteps = $approvalService->getStepsForRole('pembimbing', 'k.prodi');
        if (empty($pembimbingSteps)) {
            $pembimbingSteps = ['kaprodi_approval'];
        }

        // Status yang kaprodi bisa aksi + approved (untuk histori)
        $filterStatuses = array_unique(array_merge($allowedSteps, ['approved']));

        $query = JudulPengajuan::with([
            'konsentrasi',
            'mahasiswa.user',
            'mahasiswa.prodi',
            'pembimbing.dosen.user',
        ])->whereIn('status', $filterStatuses);

        // ── Filter berdasarkan prodi mahasiswa ──
        if (!empty($prodiIds)) {
            $query->whereHas('mahasiswa', function ($q) use ($prodiIds) {
                $q->whereIn('prodi_id', $prodiIds);
            });
        }
        // Jika prodiIds kosong (kaprodi belum di-assign ke prodi),
        // tampilkan nothing agar tidak bocor ke prodi lain
        else {
            $query->whereRaw('1 = 0'); // empty result
        }

        $juduls = $query->orderBy('created_at', 'desc')->get();

        // Info prodi yang dikelola (untuk ditampilkan di UI)
        $managedProdis = ProgramStudi::whereIn('id', $prodiIds)
            ->get(['id', 'nama', 'jenjang', 'kode']);

        return Inertia::render('Kaprodi/Judul/Index', [
            'juduls'          => $juduls,
            'pendingSteps'    => $allowedSteps,
            'pembimbingSteps' => $pembimbingSteps,
            'managedProdis'   => $managedProdis,
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // APPROVE
    // ─────────────────────────────────────────────────────────────
    public function approve($id, ApprovalService $approvalService)
    {
        $prodiIds     = $this->getKaprodiProdiIds();
        $allowedSteps = $this->getAllowedSteps($approvalService);

        // Pastikan judul milik mahasiswa dari prodi kaprodi ini
        $judul = JudulPengajuan::whereIn('status', $allowedSteps)
            ->whereHas('mahasiswa', fn($q) => $q->whereIn('prodi_id', $prodiIds))
            ->findOrFail($id);

        $approvalService->processApproval(
            $judul,
            'judul_pengajuan',
            'approved',
            ['actor_id' => Auth::id()],
            'judul_approval_log',
            'judul_id'
        );

        return redirect()->route('kaprodi.judul')->with('success', 'Judul berhasil disetujui.');
    }

    // ─────────────────────────────────────────────────────────────
    // REJECT
    // ─────────────────────────────────────────────────────────────
    public function reject(Request $request, $id, ApprovalService $approvalService)
    {
        $validated = $request->validate([
            'catatan' => 'required|string',
        ]);

        $prodiIds     = $this->getKaprodiProdiIds();
        $allowedSteps = $this->getAllowedSteps($approvalService);

        $judul = JudulPengajuan::whereIn('status', $allowedSteps)
            ->whereHas('mahasiswa', fn($q) => $q->whereIn('prodi_id', $prodiIds))
            ->findOrFail($id);

        $approvalService->processApproval(
            $judul,
            'judul_pengajuan',
            'rejected',
            [
                'actor_id' => Auth::id(),
                'catatan'  => $validated['catatan'],
            ],
            'judul_approval_log',
            'judul_id'
        );

        $judul->update(['keterangan_tolak' => $validated['catatan']]);

        return redirect()->route('kaprodi.judul')->with('success', 'Judul berhasil ditolak.');
    }

    // ─────────────────────────────────────────────────────────────
    // APPROVE PEMBIMBING
    // ─────────────────────────────────────────────────────────────
    public function approvePembimbing($id, ApprovalService $approvalService)
    {
        $prodiIds        = $this->getKaprodiProdiIds();
        $pembimbingSteps = $approvalService->getStepsForRole('pembimbing', 'k.prodi');
        if (empty($pembimbingSteps)) {
            $pembimbingSteps = ['kaprodi_approval'];
        }

        $pembimbing = Pembimbing::whereIn('status', $pembimbingSteps)
            ->whereHas('mahasiswa', fn($q) => $q->whereIn('prodi_id', $prodiIds))
            ->findOrFail($id);

        // Gunakan ApprovalService agar next step dihitung dari ApprovalConfig.
        // Jika ada step 'dosen_approval' sesudah kaprodi, status akan → dosen_approval.
        // Jika tidak ada step berikutnya, status akan → approved.
        $approvalService->processApproval(
            $pembimbing,
            'pembimbing',
            'approved',
            ['actor_id' => Auth::id()],
            'pembimbing_approval_log',
            'pembimbing_id'
        );

        return redirect()->route('kaprodi.judul')->with('success', 'Pembimbing berhasil disetujui. Menunggu konfirmasi dosen.');
    }

    // ─────────────────────────────────────────────────────────────
    // REJECT PEMBIMBING
    // ─────────────────────────────────────────────────────────────
    public function rejectPembimbing(Request $request, $id, ApprovalService $approvalService)
    {
        $validated = $request->validate([
            'catatan' => 'required|string',
        ]);

        $prodiIds        = $this->getKaprodiProdiIds();
        $pembimbingSteps = $approvalService->getStepsForRole('pembimbing', 'k.prodi');
        if (empty($pembimbingSteps)) {
            $pembimbingSteps = ['kaprodi_approval'];
        }

        $pembimbing = Pembimbing::whereIn('status', $pembimbingSteps)
            ->whereHas('mahasiswa', fn($q) => $q->whereIn('prodi_id', $prodiIds))
            ->findOrFail($id);

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

        return redirect()->route('kaprodi.judul')->with('success', 'Pembimbing ditolak.');
    }

    public function reviewRevisi(Request $request, $id)
    {
        $prodiIds = $this->getKaprodiProdiIds();
        $judul = JudulPengajuan::where('revision_status', 'revision_pending')
            ->whereHas('mahasiswa', fn($q) => $q->whereIn('prodi_id', $prodiIds))
            ->findOrFail($id);

        $request->validate([
            'aksi' => 'required|in:acc,tolak',
            'catatan_revisi_kaprodi' => 'required|string',
        ]);

        $status = $request->aksi === 'acc' ? 'revision_approved' : 'revision_rejected';

        $judul->update([
            'revision_status' => $status,
            'catatan_revisi_kaprodi' => $request->catatan_revisi_kaprodi,
            'revision_reviewed_by' => Auth::id(),
            'revision_reviewed_at' => now(),
        ]);

        $judul->load('mahasiswa.user');

        if ($request->aksi === 'acc') {
            \App\Services\NotifikasiService::send(
                $judul->mahasiswa->user->id,
                'Revisi Judul Disetujui',
                'Revisi judul Anda telah disetujui Kaprodi. Catatan: ' . $request->catatan_revisi_kaprodi,
                'judul',
                $judul->id
            );
        } else {
            \App\Services\NotifikasiService::send(
                $judul->mahasiswa->user->id,
                'Revisi Judul Ditolak',
                'Revisi judul Anda ditolak Kaprodi. Silakan ajukan revisi ulang. Catatan Kaprodi: ' . $request->catatan_revisi_kaprodi,
                'judul',
                $judul->id
            );
        }

        return redirect()->route('kaprodi.judul')->with('success', 'Review revisi judul berhasil dikirim.');
    }
}