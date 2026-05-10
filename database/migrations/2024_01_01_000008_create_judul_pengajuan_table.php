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
        Schema::create('judul_pengajuan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mahasiswa_id');
            $table->uuid('konsentrasi_id');
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['draft', 'submitted', 'verified_admin', 'approved_kaprodi', 'rejected'])->default('draft');
            $table->text('keterangan_tolak')->nullable();
            $table->integer('pengajuan_ke')->default(1);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->foreign('konsentrasi_id')->references('id')->on('konsentrasi')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('judul_pengajuan');
    }
};