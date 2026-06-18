<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bimbingan_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('bimbingan_id');
            $table->string('judul_laporan');
            $table->string('file_path');
            $table->timestamps();

            $table->foreign('bimbingan_id')->references('id')->on('bimbingan')->onDelete('cascade');
        });

        // Migrate existing records
        $bimbingans = DB::table('bimbingan')->get();
        foreach ($bimbingans as $b) {
            if (!empty($b->file_path)) {
                DB::table('bimbingan_files')->insert([
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'bimbingan_id' => $b->id,
                    'judul_laporan' => $b->judul_laporan,
                    'file_path' => $b->file_path,
                    'created_at' => $b->created_at ?? now(),
                    'updated_at' => $b->updated_at ?? now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bimbingan_files');
    }
};
