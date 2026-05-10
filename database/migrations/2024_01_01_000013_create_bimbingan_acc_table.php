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
        Schema::create('bimbingan_acc', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('bimbingan_id');
            $table->uuid('pembimbing_id');
            $table->enum('status', ['approved', 'rejected']);
            $table->text('catatan')->nullable();
            $table->timestamp('reviewed_at');
            $table->timestamps();

            $table->foreign('bimbingan_id')->references('id')->on('bimbingan')->onDelete('cascade');
            $table->foreign('pembimbing_id')->references('id')->on('pembimbing')->onDelete('cascade');
            
            $table->unique(['bimbingan_id', 'pembimbing_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bimbingan_acc');
    }
};