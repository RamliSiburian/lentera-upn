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
        Schema::create('dosen_konsentrasi', function (Blueprint $table) {
            $table->uuid('dosen_id');
            $table->uuid('konsentrasi_id');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('dosen_id')->references('id')->on('dosen')->onDelete('cascade');
            $table->foreign('konsentrasi_id')->references('id')->on('konsentrasi')->onDelete('cascade');
            
            $table->primary(['dosen_id', 'konsentrasi_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dosen_konsentrasi');
    }
};