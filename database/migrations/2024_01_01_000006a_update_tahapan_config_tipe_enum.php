<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $this->runStatement("ALTER TABLE tahapan_config MODIFY COLUMN tipe ENUM('bimbingan','ujian','administrasi') NOT NULL");
    }

    public function down(): void
    {
        $this->runStatement("ALTER TABLE tahapan_config MODIFY COLUMN tipe ENUM('bimbingan','ujian') NOT NULL");
    }

    private function runStatement(string $sql): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'sqlite') {
            // SQLite doesn't support ALTER COLUMN - skip for testing
            return;
        }
        DB::statement($sql);
    }
};