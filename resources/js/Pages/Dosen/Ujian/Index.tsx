import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge, Avatar, EmptyState, Card } from '@/Components/UI';

interface User { name: string; }
interface Mahasiswa { id: string; nim: string; user: User; }
interface Tahapan { id: string; nama_tahapan: string; }
interface DosenData { id: string; nama: string; user: User; }
interface Penguji { id: string; urutan: number; dosen: DosenData; }
interface Ruangan { id: string; nama: string; }
interface Jadwal { tanggal: string; jam_mulai: string; jam_selesai: string; ruangan: Ruangan; }
interface PengajuanUjian { id: string; status: string; mahasiswa: Mahasiswa; tahapan: Tahapan; penguji: Penguji[]; jadwal: Jadwal | null; }
interface Props { jadwalUjian: PengajuanUjian[]; [key: string]: any; }

export default function Index({ jadwalUjian = [] }: Props) {
    const statusColor = (s: string) => ({ submitted: 'blue', reviewed: 'yellow', approved: 'green', rejected: 'red', selesai: 'purple' }[s] || 'gray');
    const statusLabel = (s: string) => ({ submitted: 'Diajukan', reviewed: 'Diproses', approved: 'Disetujui', rejected: 'Ditolak', selesai: 'Selesai' }[s] || s);
    console.log({jadwalUjian});
    

    return (
        <AppLayout title="Jadwal Ujian">
            <PageHeader
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Jadwal Ujian' }]}
            />

            {jadwalUjian.length === 0 ? (
                <Card><EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} title="Belum ada jadwal ujian" description="Anda belum memiliki jadwal ujian sebagai penguji" /></Card>
            ) : (
                <div className="space-y-4">
                    {jadwalUjian.map(u => (
                        <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden hover:shadow-md transition-all duration-300">
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <Avatar name={u.mahasiswa?.user?.name || 'M'} size="md" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">{u.tahapan?.nama_tahapan}</span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900">{u.mahasiswa?.user?.name}</h3>
                                            <p className="text-sm text-gray-400 font-mono">{u.mahasiswa?.nim}</p>
                                        </div>
                                    </div>
                                    <Badge color={statusColor(u.status)} dot>{statusLabel(u.status)}</Badge>
                                </div>

                                {u.jadwal && (
                                    <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-emerald-50/70 rounded-xl">
                                        <div className="flex items-center gap-1.5 text-sm text-emerald-700">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {new Date(u.jadwal.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-emerald-700">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {u.jadwal.jam_mulai} - {u.jadwal.jam_selesai}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-emerald-700">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" /></svg>
                                            {u.jadwal.ruangan?.nama}
                                        </div>
                                    </div>
                                )}

                                {u.penguji?.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-50">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tim Penguji</p>
                                        <div className="flex flex-wrap gap-2">
                                            {u.penguji.map(p => (
                                                <div key={p.id} className="flex items-center gap-2 bg-indigo-50/70 rounded-xl px-3 py-1.5">
                                                    <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">{p.urutan}</div>
                                                    <span className="text-sm text-indigo-700 font-medium">{p.dosen?.user?.name || p.dosen?.nama}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}