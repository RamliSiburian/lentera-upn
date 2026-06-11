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
        Schema::table('judul_pengajuan', function (Blueprint $table) {
            $table->string('revision_status')->nullable();
            $table->text('alasan_revisi')->nullable();
            $table->text('catatan_revisi_kaprodi')->nullable();
            $table->timestamp('revision_submitted_at')->nullable();
            $table->uuid('revision_reviewed_by')->nullable();
            $table->timestamp('revision_reviewed_at')->nullable();

            $table->foreign('revision_reviewed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('judul_pengajuan', function (Blueprint $table) {
            $table->dropForeign(['revision_reviewed_by']);
            $table->dropColumn([
                'revision_status',
                'alasan_revisi',
                'catatan_revisi_kaprodi',
                'revision_submitted_at',
                'revision_reviewed_by',
                'revision_reviewed_at'
            ]);
        });
    }
};
