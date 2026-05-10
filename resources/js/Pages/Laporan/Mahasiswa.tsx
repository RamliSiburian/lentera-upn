import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge, EmptyState, Card } from '@/Components/UI';

interface Approval {
  dosen_nama: string; urutan: string; status: string; catatan: string | null; reviewed_at: string;
}
interface BimbinganItem {
  id: string; tahapan: string; tipe: string; status: string; bimbingan_ke: number;
  created_at: string; submitted_at: string; catatan_mhs: string | null; approvals: Approval[];
}
interface UjianItem {
  id: string; jenis_ujian: string; status: string; created_at: string;
}
interface Judul {
  id: string; judul: string; status: string; konsentrasi: string | null;
  pembimbing: { dosen_nama: string; urutan: string; status: string; }[];
}
interface Props {
  judul: Judul | null; bimbinganHistory: BimbinganItem[]; ujianHistory: UjianItem[];
  [key: string]: any;
}

export default function MahasiswaLaporan({ judul, bimbinganHistory, ujianHistory }: Props) {
  const bStatusColor = (s: string) => ({ submitted: 'blue', in_review: 'yellow', approved: 'green', rejected: 'red' }[s] || 'gray');
  const bStatusLabel = (s: string) => ({ submitted: 'Diajukan', in_review: 'Ditinjau', approved: 'Disetujui', rejected: 'Revisi' }[s] || s);
  const aStatusColor = (s: string) => ({ pending: 'gray', approved: 'green', rejected: 'red' }[s] || 'gray');

  const handleExportPdf = () => {
    window.open('/mahasiswa/laporan/pdf', '_blank');
  };

  return (
    <AppLayout title="Laporan Bimbingan">
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Laporan' }]}
        actions={
          <button onClick={handleExportPdf}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        }
      />

      {/* Judul Info */}
      {judul ? (
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Informasi Judul</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-gray-400 w-24">Judul</span>
              <span className="text-sm text-gray-800 flex-1">{judul.judul}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400 w-24">Konsentrasi</span>
              <span className="text-sm text-gray-600">{judul.konsentrasi || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400 w-24">Status</span>
              <Badge color={judul.status === 'approved_kaprodi' ? 'green' : 'yellow'}>{judul.status === 'approved_kaprodi' ? 'Disetujui' : judul.status}</Badge>
            </div>
            {judul.pembimbing?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-400">Pembimbing</span>
                <div className="mt-2 space-y-1.5">
                  {judul.pembimbing.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                      <span className="text-sm text-gray-700 flex-1">{p.dosen_nama}</span>
                      <Badge color={p.status === 'approved' ? 'green' : 'yellow'}>{p.status === 'approved' ? 'Aktif' : p.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card><EmptyState title="Belum ada judul" description="Ajukan judul terlebih dahulu untuk melihat laporan" /></Card>
      )}

      {/* Bimbingan History */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Riwayat Bimbingan ({bimbinganHistory.length})</h3>
        {bimbinganHistory.length === 0 ? (
          <Card><EmptyState title="Belum ada bimbingan" description="Riwayat bimbingan Anda akan muncul di sini" /></Card>
        ) : (
          <div className="space-y-3">
            {bimbinganHistory.map(b => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600">Bimbingan #{b.bimbingan_ke}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.tipe === 'bimbingan' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{b.tipe === 'bimbingan' ? 'Bimbingan' : 'Revisi'}</span>
                    <Badge color={bStatusColor(b.status)}>{bStatusLabel(b.status)}</Badge>
                  </div>
                  <span className="text-xs text-gray-400">{b.created_at}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-400">Tahapan:</span>
                  <span className="text-sm text-gray-700">{b.tahapan}</span>
                </div>
                {b.catatan_mhs && (
                  <div className="p-2 bg-gray-50 rounded-lg mb-2">
                    <span className="text-xs text-gray-500">{b.catatan_mhs}</span>
                  </div>
                )}
                {/* Approval status per pembimbing */}
                <div className="mt-2 pt-2 border-t border-gray-50 space-y-1.5">
                  {b.approvals.map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50/70 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                        <span className="text-sm text-gray-700">{a.dosen_nama}</span>
                        <span className="text-xs text-gray-400">({a.urutan})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color={aStatusColor(a.status)}>{a.status === 'approved' ? 'ACC' : a.status === 'rejected' ? 'Revisi' : 'Menunggu'}</Badge>
                        {a.reviewed_at && <span className="text-xs text-gray-400">{a.reviewed_at}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ujian History */}
      {ujianHistory.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Riwayat Ujian ({ujianHistory.length})</h3>
          <div className="space-y-3">
            {ujianHistory.map(u => (
              <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{u.jenis_ujian || 'Ujian'}</span>
                    <Badge color={u.status === 'lulus' ? 'green' : u.status === 'revisi' ? 'yellow' : u.status === 'gagal' ? 'red' : 'gray'}>{u.status}</Badge>
                  </div>
                  <span className="text-xs text-gray-400">{u.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}