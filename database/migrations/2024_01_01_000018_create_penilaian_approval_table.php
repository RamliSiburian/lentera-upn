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
        Schema::create('penilaian_approval', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('pengajuan_ujian_id');
            $table->uuid('kaprodi_id');
            $table->enum('status', ['approved', 'rejected']);
            $table->text('catatan')->nullable();
            $table->timestamp('approved_at');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('pengajuan_ujian_id')->references('id')->on('pengajuan_ujian')->onDelete('cascade');
            $table->foreign('kaprodi_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penilaian_approval');
    }
};