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
        Schema::create('pembimbing', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mahasiswa_id');
            $table->uuid('dosen_id');
            $table->enum('urutan', ['pembimbing_utama', 'pembimbing_pendamping']);
            $table->enum('status', ['requested', 'verified_admin', 'approved', 'rejected'])->default('requested');
            $table->timestamp('requested_at');
            $table->timestamp('dosen_acc_at')->nullable();
            $table->uuid('final_approved_by')->nullable();
            $table->timestamp('final_approved_at')->nullable();
            $table->text('keterangan_tolak')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->foreign('dosen_id')->references('id')->on('dosen')->onDelete('cascade');
            $table->foreign('final_approved_by')->references('id')->on('users')->onDelete('set null');
            
            $table->unique(['mahasiswa_id', 'urutan']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembimbing');
    }
};