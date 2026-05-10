import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, StatCard, Badge, EmptyState, Card } from '@/Components/UI';

interface Stats {
  totalMahasiswa: number; totalJudul: number; judulApproved: number; judulPending: number;
  totalBimbingan: number; bimbinganApproved: number; totalUjian: number;
}
interface BimbinganItem {
  id: string; mahasiswa_id: string; mahasiswa_nama: string; mahasiswa_nim: string; tahapan: string; tipe: string;
  status: string; bimbingan_ke: number; created_at: string; approved_by: string;
}
interface MhsItem { id: string; nim: string; nama: string; }
interface Props {
  stats: Stats; judulByStatus: Record<string, number>; recentBimbingan: BimbinganItem[];
  mahasiswaList: MhsItem[]; selectedMahasiswa: string | null; [key: string]: any;
}

export default function AdminLaporan({ stats, judulByStatus, recentBimbingan, mahasiswaList, selectedMahasiswa }: Props) {
  const { auth } = usePage().props as any;
  const role = auth?.user?.role;
  const isKaprodi = role === 'k.prodi';
  const isPimpinan = role === 'pimpinan';
  const prefix = isKaprodi ? '/kaprodi' : isPimpinan ? '/pimpinan' : '/admin';
  const [filterMhs, setFilterMhs] = useState(selectedMahasiswa || '');

  const statusLabel: Record<string, string> = {
    draft: 'Draft', submitted: 'Diajukan', verified_admin: 'Diverifikasi',
    approved_kaprodi: 'Disetujui', rejected: 'Ditolak',
  };
  const statusColor: Record<string, string> = {
    draft: 'gray', submitted: 'blue', verified_admin: 'yellow',
    approved_kaprodi: 'green', rejected: 'red',
  };
  const bStatusColor = (s: string) => ({ submitted: 'blue', in_review: 'yellow', approved: 'green', rejected: 'red' }[s] || 'gray');
  const bStatusLabel = (s: string) => ({ submitted: 'Diajukan', in_review: 'Ditinjau', approved: 'Disetujui', rejected: 'Revisi' }[s] || s);

  const handleFilter = () => {
    const url = filterMhs ? `${prefix}/laporan?mahasiswa_id=${filterMhs}` : `${prefix}/laporan`;
    router.visit(url);
  };

  const handleExportPdf = () => {
    const url = filterMhs ? `${prefix}/laporan/pdf?mahasiswa_id=${filterMhs}` : `${prefix}/laporan/pdf`;
    window.open(url, '_blank');
  };

  const handleReset = () => {
    setFilterMhs('');
    router.visit(`${prefix}/laporan`);
  };

  return (
    <AppLayout title="Laporan">
      <PageHeader 
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Laporan' }]}
      />

      {/* Filter & Export */}
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Filter Mahasiswa</label>
            <select value={filterMhs} onChange={e => setFilterMhs(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none">
              <option value="">Semua Mahasiswa</option>
              {mahasiswaList.map(m => (
                <option key={m.id} value={m.id}>{m.nim} - {m.nama}</option>
              ))}
            </select>
          </div>
          <button onClick={handleFilter}
            className="px-4 py-2 text-sm font-medium text-white rounded-xl"
            style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }}>
            Filter
          </button>
          {filterMhs && (
            <button onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
              Reset
            </button>
          )}
          <button onClick={handleExportPdf}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-4">
        <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} label="Total Mahasiswa" value={stats.totalMahasiswa} color="from-blue-500 to-indigo-600" />
        <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} label="Judul Diapproved" value={stats.judulApproved} color="from-emerald-500 to-teal-600" />
        <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Total Bimbingan" value={stats.totalBimbingan} color="from-purple-500 to-pink-600" />
        <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Bimbingan Selesai" value={stats.bimbinganApproved} color="from-amber-500 to-orange-600" />
      </div>

      {/* Judul by Status */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Statistik Judul per Status</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(judulByStatus).map(([status, total]) => (
            <div key={status} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <Badge color={statusColor[status] || 'gray'} dot>{statusLabel[status] || status}</Badge>
              <span className="text-lg font-bold text-gray-700">{total as number}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Bimbingan */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Riwayat Bimbingan {selectedMahasiswa ? `(Filtered)` : `Terbaru`}
        </h3>
        {recentBimbingan.length === 0 ? (
          <Card><EmptyState title="Belum ada bimbingan" description="Riwayat bimbingan akan muncul di sini" /></Card>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Mahasiswa</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Tahapan</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Ke-</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Tipe</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Approved By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentBimbingan.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3.5">
                        <div><span className="font-medium text-gray-900">{b.mahasiswa_nama}</span></div>
                        <div className="text-xs text-gray-400">{b.mahasiswa_nim}</div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{b.tahapan}</td>
                      <td className="px-5 py-3.5 text-gray-600">{b.bimbingan_ke}</td>
                      <td className="px-5 py-3.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.tipe === 'bimbingan' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{b.tipe === 'bimbingan' ? 'Bimbingan' : 'Revisi'}</span></td>
                      <td className="px-5 py-3.5"><Badge color={bStatusColor(b.status)}>{bStatusLabel(b.status)}</Badge></td>
                      <td className="px-5 py-3.5 text-gray-500 text-sm">{b.created_at}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-sm">{b.approved_by || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}