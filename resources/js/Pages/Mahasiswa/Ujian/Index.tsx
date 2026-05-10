import { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Modal, Button, Select, PageHeader, FlashMessage, Badge, EmptyState, Card, StatCard } from '@/Components/UI';

interface Tahapan { id: string; nama_tahapan: string; kode: string; min_bab_acc: number; }
interface Eligibility { eligible: boolean; min_bab: number; current_bab: number; has_submitted: boolean; has_approved: boolean; has_pending: boolean; }
interface User { name: string; }
interface Mahasiswa { id: string; nim: string; user: User; }
interface DosenData { id: string; nama: string; user: User; }
interface Penguji { id: string; urutan: number; dosen: DosenData; }
interface Ruangan { id: string; nama: string; }
interface Jadwal { tanggal: string; jam_mulai: string; jam_selesai: string; ruangan: Ruangan; }
interface Penilaian { id: string; nilai: number; status_hasil: string; catatan: string | null; penguji: Penguji; }
interface PengajuanUjian {
    id: string; status: string; keterangan: string | null; submitted_at: string;
    tahapan: Tahapan; mahasiswa: Mahasiswa; penguji: Penguji[]; jadwal: Jadwal | null; penilaian: Penilaian[];
}
interface Props { pengajuanUjian: PengajuanUjian[]; tahapanUjian: Tahapan[]; eligibility: Record<string, Eligibility>; accBabCount: number; [key: string]: any; }

export default function Index({ pengajuanUjian, tahapanUjian, eligibility, accBabCount }: Props) {
    const { flash } = usePage().props as any;
    const [showForm, setShowForm] = useState(false);
    const form = useForm({ tahapan_id: '', keterangan: '' });

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); form.post(route('mahasiswa.ujian.store'), { onSuccess: () => { setShowForm(false); form.reset(); } }); };

    const statusColor = (s: string) => ({ submitted: 'blue', reviewed: 'yellow', approved: 'green', rejected: 'red', selesai: 'purple' }[s] || 'gray');
    const statusLabel = (s: string) => ({ submitted: 'Diajukan', reviewed: 'Diproses', approved: 'Disetujui', rejected: 'Ditolak', selesai: 'Selesai' }[s] || s);
    const hasilColor = (h: string) => ({ lulus: 'green', revisi: 'yellow', ngulang: 'red' }[h] || 'gray');
    const hasilLabel = (h: string) => ({ lulus: 'Lulus', revisi: 'Revisi', ngulang: 'Mengulang' }[h] || h);

    return (
        <AppLayout title="Pengajuan Ujian">
            <PageHeader 
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Ujian' }]}
                actions={<Button onClick={() => setShowForm(true)} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>Ajukan Ujian</Button>}
            />
            <FlashMessage message={flash?.success} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} label="Total Pengajuan" value={pengajuanUjian.length} color="from-blue-500 to-indigo-600" />
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Bab ACC" value={accBabCount} color="from-emerald-500 to-teal-600" />
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Disetujui" value={pengajuanUjian.filter(u => u.status === 'approved' || u.status === 'selesai').length} color="from-amber-500 to-orange-600" />
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} label="Menunggu" value={pengajuanUjian.filter(u => u.status === 'submitted').length} color="from-purple-500 to-pink-600" />
            </div>

            {/* Form Modal */}
            <Modal show={showForm} onClose={() => setShowForm(false)} title="Ajukan Ujian" maxWidth="max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select label="Jenis Ujian" value={form.data.tahapan_id} onChange={e => form.setData('tahapan_id', e.target.value)} required>
                        <option value="">Pilih Ujian</option>
                        {tahapanUjian.map(t => {
                            const e = eligibility[t.id];
                            const disabled = !e?.eligible;
                            return <option key={t.id} value={t.id} disabled={disabled}>{t.nama_tahapan}{disabled ? ` (Min. ${e?.min_bab} bab)` : ''}</option>;
                        })}
                    </Select>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan</label>
                        <textarea value={form.data.keterangan} onChange={e => form.setData('keterangan', e.target.value)} rows={3} placeholder="Keterangan tambahan..." className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-200 outline-none resize-none" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
                        <Button type="submit" disabled={form.processing}>Kirim Pengajuan</Button>
                    </div>
                </form>
            </Modal>

            {/* List */}
            {pengajuanUjian.length === 0 ? (
                <Card><EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} title="Belum ada pengajuan" description="Ajukan ujian sempro, semhas, atau sidang" action={<Button onClick={() => setShowForm(true)}>Ajukan Ujian</Button>} /></Card>
            ) : (
                <div className="space-y-4">
                    {pengajuanUjian.map(u => (
                        <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden hover:shadow-md transition-all duration-300">
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                            {u.tahapan?.kode?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900">{u.tahapan?.nama_tahapan}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">{new Date(u.submitted_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            {u.keterangan && <p className="text-sm text-gray-500 mt-1 italic">"{u.keterangan}"</p>}
                                        </div>
                                    </div>
                                    <Badge color={statusColor(u.status)} dot>{statusLabel(u.status)}</Badge>
                                </div>

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

                                {u.jadwal && (
                                    <div className="mt-3 flex items-center gap-3 p-3 bg-emerald-50/70 rounded-xl">
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
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}