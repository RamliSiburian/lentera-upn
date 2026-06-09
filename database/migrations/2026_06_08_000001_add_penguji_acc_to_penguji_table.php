<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('penguji', function (Blueprint $table) {
            $table->string('penguji_acc')->default('pending')->after('assigned_at');
            // pending = belum konfirmasi, accepted = menerima, rejected = menolak
            $table->timestamp('penguji_acc_at')->nullable()->after('penguji_acc');
            $table->text('penguji_acc_catatan')->nullable()->after('penguji_acc_at');
        });
    }

    public function down(): void
    {
        Schema::table('penguji', function (Blueprint $table) {
            $table->dropColumn(['penguji_acc', 'penguji_acc_at', 'penguji_acc_catatan']);
        });
    }
};
