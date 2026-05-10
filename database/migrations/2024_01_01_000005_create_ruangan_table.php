<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ruangan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama_ruangan');
            $table->string('kode_ruangan')->unique();
            $table->integer('kapasitas');
            $table->string('gedung')->nullable();
            $table->integer('lantai')->nullable();
            $table->text('fasilitas')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ruangan');
    }
};