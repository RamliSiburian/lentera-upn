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
        Schema::create('penguji', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('pengajuan_ujian_id');
            $table->uuid('dosen_id');
            $table->integer('urutan');
            $table->uuid('assigned_by');
            $table->timestamp('assigned_at');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('pengajuan_ujian_id')->references('id')->on('pengajuan_ujian')->onDelete('cascade');
            $table->foreign('dosen_id')->references('id')->on('dosen')->onDelete('cascade');
            $table->foreign('assigned_by')->references('id')->on('users')->onDelete('restrict');
            
            $table->unique(['pengajuan_ujian_id', 'dosen_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penguji');
    }
};