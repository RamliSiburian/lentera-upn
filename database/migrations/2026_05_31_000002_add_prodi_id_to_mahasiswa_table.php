<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mahasiswa', function (Blueprint $table) {
            // Tambah kolom prodi_id (nullable dulu agar tidak konflik dengan data existing)
            $table->uuid('prodi_id')->nullable()->after('user_id');
            $table->foreign('prodi_id')->references('id')->on('program_studi')->onDelete('set null');
        });

        // Hapus kolom program_studi yang lama (sudah diganti dengan prodi_id)
        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->dropColumn('program_studi');
        });
    }

    public function down(): void
    {
        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->dropForeign(['prodi_id']);
            $table->dropColumn('prodi_id');
            $table->string('program_studi')->nullable();
        });
    }
};
