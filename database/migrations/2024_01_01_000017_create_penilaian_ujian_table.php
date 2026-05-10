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
        Schema::create('penilaian_ujian', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('pengajuan_ujian_id');
            $table->uuid('penguji_id');
            $table->string('komponen');
            $table->decimal('nilai', 5, 2);
            $table->text('catatan')->nullable();
            $table->enum('status_hasil', ['lulus', 'revisi', 'ngulang'])->default('revisi');
            $table->timestamp('dinilai_at');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('pengajuan_ujian_id')->references('id')->on('pengajuan_ujian')->onDelete('cascade');
            $table->foreign('penguji_id')->references('id')->on('penguji')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penilaian_ujian');
    }
};