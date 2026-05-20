<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JudulPengajuan;
use App\Models\Pembimbing;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JudulController extends Controller
{
    public function index(\App\Services\ApprovalService $approvalService)
    {
        $judulSteps = $approvalService->getStepsForRole('judul_pengajuan', 'admin');
        
        $judulsQuery = JudulPengajuan::with(['konsentrasi', 'mahasiswa.user', 'pembimbing.dosen.user'])
            ->orderBy('created_at', 'desc');

        if (!empty($judulSteps)) {
            $judulsQuery->whereIn('status', $judulSteps);
        } else {
            // fallback if no config
            $judulsQuery->where('status', 'submitted');
        }

        $juduls = $judulsQuery->get();

        return Inertia::render('Admin/Judul/Index', [
            'juduls' => $juduls,
        ]);
    }

    public function verify($id, \App\Services\ApprovalService $approvalService)
    {
        $judulSteps = $approvalService->getStepsForRole('judul_pengajuan', 'admin');
        if (empty($judulSteps)) $judulSteps = ['submitted'];

        $judul = JudulPengajuan::whereIn('status', $judulSteps)->findOrFail($id);
        
        $approvalService->processApproval(
            $judul,
            'judul_pengajuan',
            'approved',
            ['actor_id' => \Illuminate\Support\Facades\Auth::id()],
            'judul_approval_log',
            'judul_id'
        );

        return redirect()->route('admin.judul')->with('success', 'Judul berhasil diverifikasi.');
    }

    public function reject(Request $request, $id, \App\Services\ApprovalService $approvalService)
    {
        $validated = $request->validate(['catatan' => 'required|string']);
        
        $judulSteps = $approvalService->getStepsForRole('judul_pengajuan', 'admin');
        if (empty($judulSteps)) $judulSteps = ['submitted'];

        $judul = JudulPengajuan::whereIn('status', $judulSteps)->findOrFail($id);
        $judul->keterangan_tolak = $validated['catatan']; // optionally store here too

        $approvalService->processApproval(
            $judul,
            'judul_pengajuan',
            'rejected',
            [
                'actor_id' => \Illuminate\Support\Facades\Auth::id(),
                'catatan' => $validated['catatan']
            ],
            'judul_approval_log',
            'judul_id'
        );

        return redirect()->route('admin.judul')->with('success', 'Judul ditolak.');
    }

    public function verifyPembimbing($id, \App\Services\ApprovalService $approvalService)
    {
        $pembimbingSteps = $approvalService->getStepsForRole('pembimbing', 'admin');
        if (empty($pembimbingSteps)) $pembimbingSteps = ['requested'];

        $pembimbing = Pembimbing::whereIn('status', $pembimbingSteps)->findOrFail($id);
        
        $approvalService->processApproval(
            $pembimbing,
            'pembimbing',
            'approved',
            ['actor_id' => \Illuminate\Support\Facades\Auth::id()],
            'pembimbing_approval_log',
            'pembimbing_id'
        );

        return redirect()->route('admin.judul')->with('success', 'Pembimbing diverifikasi.');
    }
}