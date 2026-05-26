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
        Schema::create('pembimbing_approval_log', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('pembimbing_id');
            $table->uuid('actor_id');
            $table->enum('step', ['verified_admin', 'kaprodi_approval', 'dosen_approval']);
            $table->enum('action', ['approved', 'rejected']);
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->foreign('pembimbing_id')->references('id')->on('pembimbing')->onDelete('cascade');
            $table->foreign('actor_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembimbing_approval_log');
    }
};