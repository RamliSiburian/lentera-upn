import { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Modal, Button, PageHeader, FlashMessage, Badge, Avatar, EmptyState, Card } from '@/Components/UI';

interface User { name: string; }
interface Mahasiswa { id: string; nim: string; user: User; }
interface Tahapan { id: string; nama_tahapan: string; }
interface DosenData { id: string; nama: string; user: User; }
interface Penguji { id: string; urutan: number; dosen: DosenData; }
interface Ruangan { id: string; nama: string; }
interface Jadwal { tanggal: string; jam_mulai: string; jam_selesai: string; ruangan: Ruangan; }
interface Penilaian { id: string; nilai: number; status_hasil: string; catatan: string | null; penguji: Penguji; }
interface Approval { id: string; status: string; catatan: string | null; approved_at: string; kaprodi: User; }
interface PengajuanUjian {
    id: string; status: string; keterangan: string | null; submitted_at: string;
    mahasiswa: Mahasiswa; tahapan: Tahapan; penguji: Penguji[]; jadwal: Jadwal | null;
    penilaian: Penilaian[]; approvals: Approval[];
}
interface Props { pengajuanUjian: PengajuanUjian[]; [key: string]: any; }

export default function Index({ pengajuanUjian }: Props) {
    const { flash } = usePage().props as any;
    const [actionId, setActionId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'approve_ujian' | 'approve_penilaian' | null>(null);
    const form = useForm({ status: 'approved', catatan: '' });

    const handleAction = (ujianId: string) => {
        if (actionType === 'approve_ujian') {
            form.post(route('kaprodi.ujian.approve', ujianId), { onSuccess: () => { setActionId(null); setActionType(null); form.reset(); } });
        } else {
            form.post(route('kaprodi.ujian.penilaian', ujianId), { onSuccess: () => { setActionId(null); setActionType(null); form.reset(); } });
        }
    };

    const statusColor = (s: string) => ({ submitted: 'blue', reviewed: 'yellow', approved: 'green', rejected: 'red', selesai: 'purple' }[s] || 'gray');
    const statusLabel = (s: string) => ({ submitted: 'Diajukan', reviewed: 'Diproses', approved: 'Disetujui', rejected: 'Ditolak', selesai: 'Selesai' }[s] || s);
    const hasilColor = (h: string) => ({ lulus: 'green', revisi: 'yellow', ngulang: 'red' }[h] || 'gray');
    const hasilLabel = (h: string) => ({ lulus: 'Lulus', revisi: 'Revisi', ngulang: 'Mengulang' }[h] || h);

    return (
        <AppLayout title="Manajemen Ujian">
            <PageHeader 
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Manajemen Ujian' }]}
            />
            <FlashMessage message={flash?.success} />

            {pengajuanUjian.length === 0 ? (
                <Card><EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} title="Belum ada pengajuan ujian" description="Belum ada pengajuan ujian yang perlu dikelola" /></Card>
            ) : (
                <div className="space-y-4">
                    {pengajuanUjian.map(u => {
                        const allNilaiSubmitted = u.penguji?.length > 0 && u.penilaian?.length >= u.penguji?.length;
                        const hasApproval = u.approvals?.length > 0;

                        return (
                            <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden hover:shadow-md transition-all duration-300">
                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <Avatar name={u.mahasiswa?.user?.name || 'M'} size="md" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge color={statusColor(u.status)} dot>{statusLabel(u.status)}</Badge>
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">{u.tahapan?.nama_tahapan}</span>
                                                </div>
                                                <h3 className="font-semibold text-gray-900">{u.mahasiswa?.user?.name}</h3>
                                                <p className="text-sm text-gray-400 font-mono">{u.mahasiswa?.nim}</p>
                                                <p className="text-xs text-gray-300 mt-0.5">{new Date(u.submitted_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                {u.keterangan && <p className="text-sm text-gray-500 mt-1 italic">"{u.keterangan}"</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Penguji */}
                                    {u.penguji?.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Penguji</p>
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

                                    {/* Jadwal */}
                                    {u.jadwal && (
                                        <div className="mt-3 flex flex-wrap items-center gap-3 p-3 bg-emerald-50/70 rounded-xl">
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

                                    {/* Penilaian */}
                                    {u.penilaian?.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hasil Penilaian</p>
                                            <div className="space-y-1.5">
                                                {u.penilaian.map(n => (
                                                    <div key={n.id} className="flex items-center justify-between p-2.5 bg-gray-50/70 rounded-xl">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-700">{n.penguji?.dosen?.user?.name || n.penguji?.dosen?.nama}</span>
                                                            <span className="text-xs text-gray-400">Nilai: <strong className="text-gray-700">{n.nilai}</strong></span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge color={hasilColor(n.status_hasil)}>{hasilLabel(n.status_hasil)}</Badge>
                                                            {n.catatan && <span className="text-xs text-gray-400 max-w-[200px] truncate">"{n.catatan}"</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Approval Status */}
                                    {hasApproval && (
                                        <div className="mt-3 p-3 bg-green-50/70 rounded-xl flex items-center gap-2">
                                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span className="text-sm text-green-700">Penilaian di-approve oleh <strong>{u.approvals[0].kaprodi?.name}</strong> pada {new Date(u.approvals[0].approved_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {!hasApproval && (
                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            {u.status === 'submitted' && (
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="success" onClick={() => { setActionId(u.id); setActionType('approve_ujian'); form.setData('status', 'approved'); }} icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}>Approve</Button>
                                                    <Button size="sm" variant="danger" onClick={() => { setActionId(u.id); setActionType('approve_ujian'); form.setData('status', 'rejected'); }} icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}>Tolak</Button>
                                                </div>
                                            )}
                                            {allNilaiSubmitted && u.status === 'reviewed' && (
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="success" onClick={() => { setActionId(u.id); setActionType('approve_penilaian'); form.setData('status', 'approved'); }} icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>Approve Penilaian</Button>
                                                    <Button size="sm" variant="danger" onClick={() => { setActionId(u.id); setActionType('approve_penilaian'); form.setData('status', 'rejected'); }} icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}>Tolak Penilaian</Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Form */}
                                    {actionId === u.id && actionType && (
                                        <div className="mt-3 flex gap-2 items-center p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                            <input value={form.data.catatan} onChange={e => form.setData('catatan', e.target.value)} placeholder="Catatan (opsional)" className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none" />
                                            <Button size="sm" onClick={() => handleAction(u.id)} disabled={form.processing}>Submit</Button>
                                            <Button size="sm" variant="ghost" onClick={() => { setActionId(null); setActionType(null); form.reset(); }}>Batal</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}