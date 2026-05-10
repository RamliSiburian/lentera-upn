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
        Schema::create('bimbingan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mahasiswa_id');
            $table->uuid('tahapan_id');
            $table->string('judul_laporan');
            $table->string('file_path');
            $table->enum('tipe', ['revisi', 'bimbingan'])->default('revisi');
            $table->enum('status', ['submitted', 'in_review', 'approved', 'rejected'])->default('submitted');
            $table->integer('bimbingan_ke')->default(1);
            $table->text('catatan_mhs')->nullable();
            $table->timestamp('submitted_at');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->foreign('tahapan_id')->references('id')->on('tahapan_config')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bimbingan');
    }
};