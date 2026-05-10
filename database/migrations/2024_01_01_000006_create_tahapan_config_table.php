<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tahapan_config', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama_tahapan');
            $table->string('kode')->unique();
            $table->enum('tipe', ['bimbingan', 'ujian']);
            $table->integer('urutan');
            $table->text('deskripsi')->nullable();
            $table->integer('min_bab_acc')->nullable();
            $table->boolean('is_active')->default(true);
            $table->uuid('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tahapan_config');
    }
};