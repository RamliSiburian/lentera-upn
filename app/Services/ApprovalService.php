<?php

namespace App\Services;

use App\Models\ApprovalConfig;
use Illuminate\Support\Facades\DB;

class ApprovalService
{
    /**
     * Get the first step defined in the approval config for a given module.
     *
     * @param string $moduleKey
     * @return string|null
     */
    public function getFirstStep($moduleKey)
    {
        $config = ApprovalConfig::where('module_key', $moduleKey)->where('is_active', true)->first();
        if (!$config || empty($config->steps)) {
            return null;
        }

        return $config->steps[0]['step'];
    }

    /**
     * Get the next step after the current step.
     *
     * @param string $moduleKey
     * @param string $currentStep
     * @return string|null Null if there are no more steps (fully approved)
     */
    public function getNextStep($moduleKey, $currentStep)
    {
        $config = ApprovalConfig::where('module_key', $moduleKey)->where('is_active', true)->first();
        if (!$config || empty($config->steps)) {
            return null;
        }

        $steps = $config->steps;
        $currentIndex = array_search($currentStep, array_column($steps, 'step'));

        if ($currentIndex !== false && isset($steps[$currentIndex + 1])) {
            return $steps[$currentIndex + 1]['step'];
        }

        return null;
    }

    /**
     * Get the role responsible for the given step.
     *
     * @param string $moduleKey
     * @param string $stepKey
     * @return string|null
     */
    public function getRoleForStep($moduleKey, $stepKey)
    {
        $config = ApprovalConfig::where('module_key', $moduleKey)->where('is_active', true)->first();
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
     * Process an approval action for a model.
     * 
     * @param \Illuminate\Database\Eloquent\Model $model The model being approved (e.g. JudulPengajuan)
     * @param string $moduleKey The module key in approval_config
     * @param string $action 'approved' or 'rejected'
     * @param array $logData Data to insert into the log table
     * @param string $logTable The name of the log table
     * @param string $foreignKeyName The foreign key column name in the log table
     */
    public function processApproval($model, $moduleKey, $action, $logData, $logTable, $foreignKeyName)
    {
        DB::transaction(function () use ($model, $moduleKey, $action, $logData, $logTable, $foreignKeyName) {
            $currentStep = $model->status; // We assume the model's status stores the current pending step

            // Insert log
            $logEntry = array_merge([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                $foreignKeyName => $model->id,
                'step' => $currentStep,
                'action' => $action,
                'created_at' => now(),
                'updated_at' => now(),
            ], $logData);
            
            DB::table($logTable)->insert($logEntry);

            if ($action === 'rejected') {
                $model->update(['status' => 'rejected']);
            } else {
                $nextStep = $this->getNextStep($moduleKey, $currentStep);
                if ($nextStep) {
                    $model->update(['status' => $nextStep]);
                } else {
                    $model->update(['status' => 'approved']);
                }
            }
        });
    }

    /**
     * Scope a query to only include pending items for a specific role.
     * This relies on extracting all step keys assigned to the given role,
     * and filtering models whose status matches one of those keys.
     *
     * @param string $moduleKey
     * @param string $role
     * @return array Array of step keys
     */
    public function getStepsForRole($moduleKey, $role)
    {
        $config = ApprovalConfig::where('module_key', $moduleKey)->where('is_active', true)->first();
        if (!$config || empty($config->steps)) {
            return [];
        }

        $stepsForRole = [];
        foreach ($config->steps as $step) {
            if ($step['role'] === $role) {
                $stepsForRole[] = $step['step'];
            }
        }

        return $stepsForRole;
    }
}
