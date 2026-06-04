<?php

namespace App\Services;

use App\Models\ApprovalConfig;
use Illuminate\Support\Facades\DB;

class ApprovalService
{
    /**
     * Ambil config aktif untuk module tertentu.
     */
    private function getConfig(string $moduleKey): ?ApprovalConfig
    {
        return ApprovalConfig::where('module_key', $moduleKey)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get the first REQUIRED step in the approval config.
     * Skips optional (required=false) steps at the beginning.
     *
     * Contoh:
     *   steps = [admin(optional), kaprodi(required)]
     *   → return 'kaprodi_approval'  (admin diloncati)
     *
     *   steps = [admin(required), kaprodi(required)]
     *   → return 'verified_admin'
     */
    public function getFirstStep(string $moduleKey): ?string
    {
        $config = $this->getConfig($moduleKey);
        if (!$config || empty($config->steps)) {
            return null;
        }

        foreach ($config->steps as $step) {
            // Kalau required tidak di-set, anggap required=true (backward compat)
            $required = isset($step['required']) ? (bool) $step['required'] : true;
            if ($required) {
                return $step['step'];
            }
        }

        // Semua optional → kembalikan step pertama sebagai fallback
        return $config->steps[0]['step'];
    }

    /**
     * Get the next REQUIRED step after the current step.
     * Skips intermediate optional steps.
     *
     * @return string|null  Null berarti sudah selesai (fully approved)
     */
    public function getNextStep(string $moduleKey, string $currentStep): ?string
    {
        $config = $this->getConfig($moduleKey);
        if (!$config || empty($config->steps)) {
            return null;
        }

        $steps = $config->steps;
        $currentIndex = array_search($currentStep, array_column($steps, 'step'));

        if ($currentIndex === false) {
            return null;
        }

        // Cari step REQUIRED berikutnya setelah currentIndex
        for ($i = $currentIndex + 1; $i < count($steps); $i++) {
            $required = isset($steps[$i]['required']) ? (bool) $steps[$i]['required'] : true;
            if ($required) {
                return $steps[$i]['step'];
            }
        }

        return null; // tidak ada step lagi → approved
    }

    /**
     * Get all step keys assigned to a specific role.
     * Digunakan untuk memfilter data yang perlu di-approve oleh role tertentu.
     */
    public function getStepsForRole(string $moduleKey, string $role): array
    {
        $config = $this->getConfig($moduleKey);
        if (!$config || empty($config->steps)) {
            return [];
        }

        $steps = [];
        foreach ($config->steps as $step) {
            if ($step['role'] === $role) {
                $steps[] = $step['step'];
            }
        }

        return $steps;
    }

    /**
     * Get the role responsible for the given step.
     */
    public function getRoleForStep(string $moduleKey, string $stepKey): ?string
    {
        $config = $this->getConfig($moduleKey);
        if (!$config || empty($config->steps)) {
            return null;
        }

        foreach ($config->steps as $step) {
            if ($step['step'] === $stepKey) {
                return $step['role'];
            }
        }

        return null;
    }

    /**
     * Cek apakah suatu step bersifat required.
     */
    public function isStepRequired(string $moduleKey, string $stepKey): bool
    {
        $config = $this->getConfig($moduleKey);
        if (!$config || empty($config->steps)) {
            return true;
        }

        foreach ($config->steps as $step) {
            if ($step['step'] === $stepKey) {
                return isset($step['required']) ? (bool) $step['required'] : true;
            }
        }

        return true;
    }

    /**
     * Process an approval action for a model.
     *
     * @param \Illuminate\Database\Eloquent\Model $model
     * @param string $moduleKey
     * @param string $action  'approved' | 'rejected'
     * @param array  $logData
     * @param string $logTable
     * @param string $foreignKeyName
     * @param string|null $stepOverride
     */
    public function processApproval($model, string $moduleKey, string $action, array $logData, string $logTable, string $foreignKeyName, ?string $stepOverride = null): void
    {
        DB::transaction(function () use ($model, $moduleKey, $action, $logData, $logTable, $foreignKeyName, $stepOverride) {
            $currentStatus = $model->status;
            $stepToLog = $stepOverride ?? $currentStatus;

            // Insert log
            $logEntry = array_merge([
                'id'             => (string) \Illuminate\Support\Str::uuid(),
                $foreignKeyName  => $model->id,
                'step'           => $stepToLog,
                'action'         => $action,
                'created_at'     => now(),
                'updated_at'     => now(),
            ], $logData);

            DB::table($logTable)->insert($logEntry);

            if ($action === 'rejected') {
                $model->update(['status' => 'rejected']);
            } else {
                // Jika step yang disetujui (stepToLog) berbeda dengan status model saat ini
                // (misal status model sudah kaprodi_approval karena optional, tapi admin baru klik verifikasi),
                // maka jangan ubah status model karena statusnya sudah melampaui step tersebut.
                if ($stepOverride && $stepOverride !== $currentStatus) {
                    // Do not update status
                } else {
                    $nextStep = $this->getNextStep($moduleKey, $currentStatus);
                    $model->update(['status' => $nextStep ?? 'approved']);
                }
            }
        });
    }
}
