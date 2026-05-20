<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For enum changes in Laravel, we need doctrine/dbal, but to avoid dependency issues,
        // we can use raw SQL if doctrine is not installed, or just alter it via standard blueprint if using Laravel 11+.
        // Here we use raw SQL to safely convert ENUM to VARCHAR for all approval log tables.
        
        $tables = [
            'judul_approval_log',
            'pembimbing_approval_log',
            'bimbingan_acc',
            'penilaian_approval'
        ];

        foreach ($tables as $table) {
            if (Schema::hasColumn($table, 'step')) {
                DB::statement("ALTER TABLE `{$table}` MODIFY `step` VARCHAR(255) NOT NULL");
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We won't revert to enum in down() because data might be lost,
        // but typically you would define the old enums here.
    }
};
