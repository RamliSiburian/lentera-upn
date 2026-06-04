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

        $isJudulAdminOptional = !$approvalService->isStepRequired('judul_pengajuan', 'verified_admin');
        
        // Judul yang butuh verifikasi admin
        $juduls = JudulPengajuan::with([
            'konsentrasi',
            'mahasiswa.user',
            'mahasiswa.prodi',
            'pembimbing.dosen.user',
        ])
        ->where(function($query) use ($judulSteps, $isJudulAdminOptional) {
            $query->whereIn('status', $judulSteps);
            
            if ($isJudulAdminOptional) {
                $query->orWhere(function($q) {
                    $q->where('status', 'kaprodi_approval')
                      ->whereNotExists(function($subQuery) {
                          $subQuery->select(\DB::raw(1))
                                   ->from('judul_approval_log')
                                   ->whereRaw('judul_approval_log.judul_id = judul_pengajuan.id')
                                   ->where('step', 'verified_admin')
                                   ->where('action', 'approved');
                      });
                });
            }
        })
        ->orderBy('created_at', 'desc')
        ->get();

        // Check logs for each pembimbing relation to know if verified by admin
        $juduls->each(function($judul) {
            $judul->pembimbing->each(function($p) {
                $p->has_verified_admin_log = \DB::table('pembimbing_approval_log')
                    ->where('pembimbing_id', $p->id)
                    ->where('step', 'verified_admin')
                    ->where('action', 'approved')
                    ->exists();
            });
        });

        $isPembimbingAdminOptional = !$approvalService->isStepRequired('pembimbing', 'verified_admin');

        // Pembimbing yang butuh verifikasi admin (tampilkan di halaman yang sama)
        $pembimbings = Pembimbing::with(['mahasiswa.user', 'mahasiswa.prodi', 'dosen.user'])
            ->where(function($query) use ($pembimbingSteps, $isPembimbingAdminOptional) {
                $query->whereIn('status', $pembimbingSteps);
                
                if ($isPembimbingAdminOptional) {
                    $query->orWhere(function($q) {
                        $q->where('status', 'kaprodi_approval')
                          ->whereNotExists(function($subQuery) {
                              $subQuery->select(\DB::raw(1))
                                       ->from('pembimbing_approval_log')
                                       ->whereRaw('pembimbing_approval_log.pembimbing_id = pembimbing.id')
                                       ->where('step', 'verified_admin')
                                       ->where('action', 'approved');
                          });
                    });
                }
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $pendingJudulSteps = $judulSteps;
        if ($isJudulAdminOptional) {
            $pendingJudulSteps[] = 'kaprodi_approval';
        }

        $pendingPembimbingSteps = $pembimbingSteps;
        if ($isPembimbingAdminOptional) {
            $pendingPembimbingSteps[] = 'kaprodi_approval';
        }

        return Inertia::render('Admin/Judul/Index', [
            'juduls'          => $juduls,
            'pendingSteps'    => $pendingJudulSteps,
            'pembimbings'     => $pembimbings,
            'pembimbingSteps' => $pendingPembimbingSteps,
        ]);
    }

    public function verify($id, ApprovalService $approvalService)
    {
        $judulSteps = $this->getAdminAllowedSteps($approvalService, 'judul_pengajuan');
        $isJudulAdminOptional = !$approvalService->isStepRequired('judul_pengajuan', 'verified_admin');

        $judul = JudulPengajuan::where(function($query) use ($judulSteps, $isJudulAdminOptional) {
            $query->whereIn('status', $judulSteps);
            if ($isJudulAdminOptional) {
                $query->orWhere(function($q) {
                    $q->where('status', 'kaprodi_approval')
                      ->whereNotExists(function($subQuery) {
                          $subQuery->select(\DB::raw(1))
                                   ->from('judul_approval_log')
                                   ->whereRaw('judul_approval_log.judul_id = judul_pengajuan.id')
                                   ->where('step', 'verified_admin')
                                   ->where('action', 'approved');
                      });
                });
            }
        })->findOrFail($id);

        $approvalService->processApproval(
            $judul,
            'judul_pengajuan',
            'approved',
            ['actor_id' => Auth::id()],
            'judul_approval_log',
            'judul_id',
            'verified_admin'
        );

        return redirect()->route('admin.judul')->with('success', 'Judul berhasil diverifikasi.');
    }

    public function reject(Request $request, $id, ApprovalService $approvalService)
    {
        $validated  = $request->validate(['catatan' => 'required|string']);
        $judulSteps = $this->getAdminAllowedSteps($approvalService, 'judul_pengajuan');
        $isJudulAdminOptional = !$approvalService->isStepRequired('judul_pengajuan', 'verified_admin');

        $judul = JudulPengajuan::where(function($query) use ($judulSteps, $isJudulAdminOptional) {
            $query->whereIn('status', $judulSteps);
            if ($isJudulAdminOptional) {
                $query->orWhere(function($q) {
                    $q->where('status', 'kaprodi_approval')
                      ->whereNotExists(function($subQuery) {
                          $subQuery->select(\DB::raw(1))
                                   ->from('judul_approval_log')
                                   ->whereRaw('judul_approval_log.judul_id = judul_pengajuan.id')
                                   ->where('step', 'verified_admin')
                                   ->where('action', 'approved');
                      });
                });
            }
        })->findOrFail($id);

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
            'judul_id',
            'verified_admin'
        );

        return redirect()->route('admin.judul')->with('success', 'Judul ditolak.');
    }

    // ─── Pembimbing ─────────────────────────────────────────────
    public function verifyPembimbing($id, ApprovalService $approvalService)
    {
        $pembimbingSteps = $this->getAdminAllowedSteps($approvalService, 'pembimbing');
        $isPembimbingAdminOptional = !$approvalService->isStepRequired('pembimbing', 'verified_admin');

        $pembimbing = Pembimbing::where(function($query) use ($pembimbingSteps, $isPembimbingAdminOptional) {
            $query->whereIn('status', $pembimbingSteps);
            if ($isPembimbingAdminOptional) {
                $query->orWhere(function($q) {
                    $q->where('status', 'kaprodi_approval')
                      ->whereNotExists(function($subQuery) {
                          $subQuery->select(\DB::raw(1))
                                   ->from('pembimbing_approval_log')
                                   ->whereRaw('pembimbing_approval_log.pembimbing_id = pembimbing.id')
                                   ->where('step', 'verified_admin')
                                   ->where('action', 'approved');
                      });
                });
            }
        })->findOrFail($id);

        $approvalService->processApproval(
            $pembimbing,
            'pembimbing',
            'approved',
            ['actor_id' => Auth::id()],
            'pembimbing_approval_log',
            'pembimbing_id',
            'verified_admin'
        );

        return redirect()->route('admin.judul')->with('success', 'Pembimbing diverifikasi.');
    }

    public function rejectPembimbing(Request $request, $id, ApprovalService $approvalService)
    {
        $validated       = $request->validate(['catatan' => 'required|string']);
        $pembimbingSteps = $this->getAdminAllowedSteps($approvalService, 'pembimbing');
        $isPembimbingAdminOptional = !$approvalService->isStepRequired('pembimbing', 'verified_admin');

        $pembimbing = Pembimbing::where(function($query) use ($pembimbingSteps, $isPembimbingAdminOptional) {
            $query->whereIn('status', $pembimbingSteps);
            if ($isPembimbingAdminOptional) {
                $query->orWhere(function($q) {
                    $q->where('status', 'kaprodi_approval')
                      ->whereNotExists(function($subQuery) {
                          $subQuery->select(\DB::raw(1))
                                   ->from('pembimbing_approval_log')
                                   ->whereRaw('pembimbing_approval_log.pembimbing_id = pembimbing.id')
                                   ->where('step', 'verified_admin')
                                   ->where('action', 'approved');
                      });
                });
            }
        })->findOrFail($id);

        $approvalService->processApproval(
            $pembimbing,
            'pembimbing',
            'rejected',
            [
                'actor_id' => Auth::id(),
                'catatan'  => $validated['catatan'],
            ],
            'pembimbing_approval_log',
            'pembimbing_id',
            'verified_admin'
        );

        $pembimbing->update(['keterangan_tolak' => $validated['catatan']]);

        return redirect()->route('admin.judul')->with('success', 'Pembimbing ditolak.');
    }
}