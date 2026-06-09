<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\MahasiswaController;
use App\Http\Controllers\Admin\DosenController;
use App\Http\Controllers\Admin\KonsentrasiController;
use App\Http\Controllers\Admin\RuanganController;
use App\Http\Controllers\Admin\TahapanController;
use App\Http\Controllers\Admin\ApprovalConfigController;
use App\Http\Controllers\Admin\ProdiController;
use App\Http\Controllers\Admin\JudulController as AdminJudulController;
use App\Http\Controllers\Admin\UjianController as AdminUjianController;
use App\Http\Controllers\Mahasiswa\JudulController as MhsJudulController;
use App\Http\Controllers\Mahasiswa\BimbinganController as MhsBimbinganController;
use App\Http\Controllers\Mahasiswa\UjianController as MhsUjianController;
use App\Http\Controllers\Kaprodi\JudulController as KaprodiJudulController;
use App\Http\Controllers\Kaprodi\UjianController as KaprodiUjianController;
use App\Http\Controllers\Kaprodi\NilaiController as KaprodiNilaiController;
use App\Http\Controllers\Dosen\BimbinganController as DosenBimbinganController;
use App\Http\Controllers\Dosen\UjianController as DosenUjianController;
use App\Http\Controllers\Dosen\PenilaianController as DosenPenilaianController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\ProfilController;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

require __DIR__.'/auth.php';

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Shared Profile Routes (all authenticated users)
    Route::get('/profil', [ProfilController::class, 'index'])->name('profil');
    Route::post('/profil/update', [ProfilController::class, 'updateProfile'])->name('profil.update');
    Route::post('/profil/password', [ProfilController::class, 'updatePassword'])->name('profil.password');

    // Admin Routes
    Route::middleware(['role:admin,pimpinan'])->prefix('admin')->group(function () {
        Route::resource('mahasiswa', MahasiswaController::class)->except(['create', 'show', 'edit']);
        Route::resource('dosen', DosenController::class)->except(['create', 'show', 'edit']);
        Route::post('/dosen/{id}/toggle-kaprodi', [DosenController::class, 'toggleKaprodi'])->name('dosen.toggle-kaprodi');
        Route::post('/dosen/{id}/toggle-pimpinan', [DosenController::class, 'togglePimpinan'])->name('dosen.toggle-pimpinan');
        Route::resource('konsentrasi', KonsentrasiController::class)->except(['create', 'show', 'edit']);
        Route::resource('ruangan', RuanganController::class)->except(['create', 'show', 'edit']);
        Route::resource('tahapan', TahapanController::class)->except(['create', 'show', 'edit']);
        Route::resource('approval', ApprovalConfigController::class)->except(['create', 'show', 'edit']);
        Route::resource('prodi', ProdiController::class)->except(['create', 'show', 'edit']);

        // Admin Judul & Pembimbing verification
        Route::get('/judul', [AdminJudulController::class, 'index'])->name('admin.judul');
        Route::post('/judul/{id}/verify', [AdminJudulController::class, 'verify'])->name('admin.judul.verify');
        Route::post('/judul/{id}/reject', [AdminJudulController::class, 'reject'])->name('admin.judul.reject');
        Route::post('/pembimbing/{pembimbingId}/verify', [AdminJudulController::class, 'verifyPembimbing'])->name('admin.pembimbing.verify');
        Route::post('/pembimbing/{pembimbingId}/reject', [AdminJudulController::class, 'rejectPembimbing'])->name('admin.pembimbing.reject');

        // Admin Ujian management
        Route::get('/ujian', [AdminUjianController::class, 'index'])->name('admin.ujian');
        Route::post('/ujian/{id}/penguji', [AdminUjianController::class, 'assignPenguji'])->name('admin.ujian.penguji');
        Route::post('/ujian/{id}/jadwal', [AdminUjianController::class, 'setJadwal'])->name('admin.ujian.jadwal');

        // Admin Laporan
        Route::get('/laporan', [LaporanController::class, 'admin'])->name('admin.laporan');
        Route::get('/laporan/pdf', [LaporanController::class, 'exportPdf'])->name('admin.laporan.pdf');
    });

    // Pimpinan Routes
    Route::middleware(['role:pimpinan'])->prefix('pimpinan')->group(function () {
        Route::get('/statistik', fn () => inertia('Dashboard'))->name('pimpinan.statistik');
        Route::get('/laporan', [LaporanController::class, 'pimpinan'])->name('pimpinan.laporan');
        Route::get('/laporan/pdf', [LaporanController::class, 'exportPdf'])->name('pimpinan.laporan.pdf');
    });

    // Kaprodi Routes
    Route::middleware(['role:k.prodi'])->prefix('kaprodi')->group(function () {
        Route::get('/judul', [KaprodiJudulController::class, 'index'])->name('kaprodi.judul');
        Route::post('/judul/{id}/approve', [KaprodiJudulController::class, 'approve'])->name('kaprodi.judul.approve');
        Route::post('/judul/{id}/reject', [KaprodiJudulController::class, 'reject'])->name('kaprodi.judul.reject');
        Route::post('/pembimbing/{id}/approve', [KaprodiJudulController::class, 'approvePembimbing'])->name('kaprodi.pembimbing.approve');
        Route::post('/pembimbing/{id}/reject', [KaprodiJudulController::class, 'rejectPembimbing'])->name('kaprodi.pembimbing.reject');
        Route::get('/pembimbing', fn () => inertia('Kaprodi/Pembimbing/Index'))->name('kaprodi.pembimbing');
        Route::get('/ujian', [KaprodiUjianController::class, 'index'])->name('kaprodi.ujian');
        Route::post('/ujian/{id}/approve', [KaprodiUjianController::class, 'approveUjian'])->name('kaprodi.ujian.approve');
        Route::post('/ujian/{id}/penilaian', [KaprodiUjianController::class, 'approvePenilaian'])->name('kaprodi.ujian.penilaian');
        Route::get('/nilai', [KaprodiNilaiController::class, 'index'])->name('kaprodi.nilai');
        Route::post('/nilai/{id}/approve', [KaprodiNilaiController::class, 'approve'])->name('kaprodi.nilai.approve');
        Route::get('/laporan', [LaporanController::class, 'kaprodi'])->name('kaprodi.laporan');
        Route::get('/laporan/pdf', [LaporanController::class, 'exportPdf'])->name('kaprodi.laporan.pdf');
    });

    // Dosen Routes
    Route::middleware(['role:dosen,k.prodi'])->prefix('dosen')->group(function () {
        Route::get('/bimbingan', [DosenBimbinganController::class, 'index'])->name('dosen.bimbingan');
        Route::post('/bimbingan/{bimbinganId}/approve', [DosenBimbinganController::class, 'approveBimbingan'])->name('dosen.bimbingan.approve');
        Route::post('/bimbingan/{bimbinganId}/revisi', [DosenBimbinganController::class, 'revisiBimbingan'])->name('dosen.bimbingan.revisi');
        Route::post('/bimbingan/{bimbinganId}/reject', [DosenBimbinganController::class, 'rejectBimbingan'])->name('dosen.bimbingan.reject');
        Route::post('/bimbingan/{bimbinganId}/komentar', [DosenBimbinganController::class, 'komentar'])->name('dosen.bimbingan.komentar');
        Route::post('/pembimbing/{pembimbingId}/approve', [DosenBimbinganController::class, 'approvePembimbing'])->name('dosen.pembimbing.approve');
        Route::post('/pembimbing/{pembimbingId}/reject', [DosenBimbinganController::class, 'rejectPembimbing'])->name('dosen.pembimbing.reject');
        Route::get('/ujian', [DosenUjianController::class, 'index'])->name('dosen.ujian');
        Route::post('/ujian/penguji/{pengujiId}/accept', [DosenUjianController::class, 'acceptPenguji'])->name('dosen.penguji.accept');
        Route::post('/ujian/penguji/{pengujiId}/reject', [DosenUjianController::class, 'rejectPenguji'])->name('dosen.penguji.reject');
        Route::get('/penilaian', [DosenPenilaianController::class, 'index'])->name('dosen.penilaian');
        Route::post('/penilaian', [DosenPenilaianController::class, 'store'])->name('dosen.penilaian.store');
        Route::get('/profil', fn () => inertia('Dashboard'))->name('dosen.profil');
    });

    // Mahasiswa Routes
    Route::middleware(['role:mahasiswa'])->prefix('mahasiswa')->group(function () {
        Route::get('/judul', [MhsJudulController::class, 'index'])->name('mahasiswa.judul');
        Route::post('/judul', [MhsJudulController::class, 'store'])->name('mahasiswa.judul.store');
        Route::put('/judul/{id}', [MhsJudulController::class, 'update'])->name('mahasiswa.judul.update');
        Route::delete('/judul/{id}', [MhsJudulController::class, 'destroy'])->name('mahasiswa.judul.destroy');
        Route::post('/judul/{id}/submit', [MhsJudulController::class, 'submit'])->name('mahasiswa.judul.submit');
        Route::post('/judul/{id}/pembimbing', [MhsJudulController::class, 'requestPembimbing'])->name('mahasiswa.judul.pembimbing');
        Route::get('/judul/{konsentrasiId}/available-dosen', [MhsJudulController::class, 'availableDosen'])->name('mahasiswa.judul.available-dosen');

        Route::get('/bimbingan', [MhsBimbinganController::class, 'index'])->name('mahasiswa.bimbingan');
        Route::post('/bimbingan', [MhsBimbinganController::class, 'store'])->name('mahasiswa.bimbingan.store');
        Route::post('/bimbingan/{bimbinganId}/revisi', [MhsBimbinganController::class, 'submitRevisi'])->name('mahasiswa.bimbingan.revisi');
        Route::post('/bimbingan/{bimbinganId}/komentar', [MhsBimbinganController::class, 'komentar'])->name('mahasiswa.bimbingan.komentar');

        Route::get('/ujian', [MhsUjianController::class, 'index'])->name('mahasiswa.ujian');
        Route::post('/ujian', [MhsUjianController::class, 'store'])->name('mahasiswa.ujian.store');
        Route::get('/laporan', [LaporanController::class, 'mahasiswa'])->name('mahasiswa.laporan');
        Route::get('/laporan/pdf', [LaporanController::class, 'exportPdf'])->name('mahasiswa.laporan.pdf');
        Route::get('/profil', fn () => inertia('Dashboard'))->name('mahasiswa.profil');
    });
});