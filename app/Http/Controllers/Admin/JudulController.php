<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApprovalConfig;
use App\Models\JudulPengajuan;
use App\Models\Pembimbing;
use App\Services\ApprovalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class JudulController extends Controller
{
    /**
     * Step admin yang optional di suatu module.
     * Admin tetap bisa aksi meski step-nya optional.
     */
    private function getAdminAllowedSteps(ApprovalService $approvalService, string $moduleKey): array
    {
        $steps = $approvalService->getStepsForRole($moduleKey, 'admin');
        return empty($steps) ? ['submitted'] : $steps;
    }

    // ─── Judul Pengajuan ────────────────────────────────────────
    public function index(ApprovalService $approvalService)
    {
        $judulSteps      = $this->getAdminAllowedSteps($approvalService, 'judul_pengajuan');
        $pembimbingSteps = $this->getAdminAllowedSteps($approvalService, 'pembimbing');

        // Judul yang butuh verifikasi admin
        $juduls = JudulPengajuan::with([
            'konsentrasi',
            'mahasiswa.user',
            'mahasiswa.prodi',
            'pembimbing.dosen.user',
        ])
        ->whereIn('status', $judulSteps)
        ->orderBy('created_at', 'desc')
        ->get();

        // Pembimbing yang butuh verifikasi admin (tampilkan di halaman yang sama)
        $pembimbings = Pembimbing::with(['mahasiswa.user', 'mahasiswa.prodi', 'dosen.user'])
            ->whereIn('status', $pembimbingSteps)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Judul/Index', [
            'juduls'          => $juduls,
            'pendingSteps'    => $judulSteps,
            'pembimbings'     => $pembimbings,          // ← baru: daftar pembimbing pending
            'pembimbingSteps' => $pembimbingSteps,
        ]);
    }

    public function verify($id, ApprovalService $approvalService)
    {
        $judulSteps = $this->getAdminAllowedSteps($approvalService, 'judul_pengajuan');
        $judul = JudulPengajuan::whereIn('status', $judulSteps)->findOrFail($id);

        $approvalService->processApproval(
            $judul,
            'judul_pengajuan',
            'approved',
            ['actor_id' => Auth::id()],
            'judul_approval_log',
            'judul_id'
        );

        return redirect()->route('admin.judul')->with('success', 'Judul berhasil diverifikasi.');
    }

    public function reject(Request $request, $id, ApprovalService $approvalService)
    {
        $validated  = $request->validate(['catatan' => 'required|string']);
        $judulSteps = $this->getAdminAllowedSteps($approvalService, 'judul_pengajuan');
        $judul      = JudulPengajuan::whereIn('status', $judulSteps)->findOrFail($id);

        $judul->keterangan_tolak = $validated['catatan'];

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

        return redirect()->route('admin.judul')->with('success', 'Judul ditolak.');
    }

    // ─── Pembimbing ─────────────────────────────────────────────
    public function verifyPembimbing($id, ApprovalService $approvalService)
    {
        $pembimbingSteps = $this->getAdminAllowedSteps($approvalService, 'pembimbing');
        $pembimbing      = Pembimbing::whereIn('status', $pembimbingSteps)->findOrFail($id);

        $approvalService->processApproval(
            $pembimbing,
            'pembimbing',
            'approved',
            ['actor_id' => Auth::id()],
            'pembimbing_approval_log',
            'pembimbing_id'
        );

        return redirect()->route('admin.judul')->with('success', 'Pembimbing diverifikasi.');
    }

    public function rejectPembimbing(Request $request, $id, ApprovalService $approvalService)
    {
        $validated       = $request->validate(['catatan' => 'required|string']);
        $pembimbingSteps = $this->getAdminAllowedSteps($approvalService, 'pembimbing');
        $pembimbing      = Pembimbing::whereIn('status', $pembimbingSteps)->findOrFail($id);

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

        $pembimbing->update(['keterangan_tolak' => $validated['catatan']]);

        return redirect()->route('admin.judul')->with('success', 'Pembimbing ditolak.');
    }
}