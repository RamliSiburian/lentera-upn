import React from 'react'
import { Head, Link } from '@inertiajs/react'

export default function Welcome() {
  return (
    <>
      <Head title="LENTERA - Sistem Bimbingan Skripsi Online" />

      <div className="min-h-screen bg-gradient-to-b from-blue-700 to-blue-900 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            🎓 LENTERA
          </h1>
          <h2 className="text-xl md:text-2xl text-blue-100 mb-4">
            Layanan Elektronik Tugas Akhir Terintegrasi
          </h2>
          <p className="text-blue-200 mb-8 text-lg">
            Sistem bimbingan skripsi online terpadu untuk Mahasiswa, Dosen, dan Pimpinan
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/login" className="bg-white text-blue-800 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition shadow-lg">
              Masuk ke Sistem
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-5">
              <div className="text-3xl mb-2">👨‍🎓</div>
              <div className="text-white font-semibold">Mahasiswa</div>
              <div className="text-blue-200 text-sm mt-1">Ajukan judul & bimbingan skripsi</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-5">
              <div className="text-3xl mb-2">👨‍🏫</div>
              <div className="text-white font-semibold">Dosen</div>
              <div className="text-blue-200 text-sm mt-1">Bimbingan & penilaian mahasiswa</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-5">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-white font-semibold">Kaprodi</div>
              <div className="text-blue-200 text-sm mt-1">Persetujuan & monitoring</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-5">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-white font-semibold">Pimpinan</div>
              <div className="text-blue-200 text-sm mt-1">Laporan & statistik</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}