<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = [
            'judul_pengajuan',
            'pembimbing',
            'bimbingan',
            'pengajuan_ujian'
        ];

        foreach ($tables as $table) {
            if (Schema::hasColumn($table, 'status')) {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE `{$table}` MODIFY `status` VARCHAR(255) NOT NULL");
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No rollback to avoid issues with data truncation if string values are used
    }
};
