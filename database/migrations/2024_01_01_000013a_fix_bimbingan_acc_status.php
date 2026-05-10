<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change status enum to include 'pending' and make reviewed_at nullable
        DB::statement("ALTER TABLE bimbingan_acc MODIFY COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'");
        DB::statement("ALTER TABLE bimbingan_acc MODIFY COLUMN reviewed_at TIMESTAMP NULL DEFAULT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE bimbingan_acc MODIFY COLUMN status ENUM('approved','rejected') NOT NULL");
        DB::statement("ALTER TABLE bimbingan_acc MODIFY COLUMN reviewed_at TIMESTAMP NOT NULL");
    }
};