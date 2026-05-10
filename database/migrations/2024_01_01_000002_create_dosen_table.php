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
        Schema::create('dosen', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('nidn')->unique();
            $table->string('bidang_keahlian')->nullable();
            $table->integer('kuota_bimbingan')->default(10);
            $table->boolean('is_kaprodi')->default(false);
            $table->string('foto_profil_path')->nullable();
            $table->string('paraf_path')->nullable();
            $table->string('no_hp')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dosen');
    }
};