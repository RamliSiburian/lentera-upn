import { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Modal, SearchInput, Button, Input, Select, PageHeader, FlashMessage, Badge, Avatar, EmptyState, Card, Tabs, StatCard } from '@/Components/UI';

interface User { name: string; }
interface Pembimbing { id: string; dosen_id: string; status: string; }
interface Mahasiswa { id: string; nim: string; user: User; pembimbing?: Pembimbing[]; }
interface Tahapan { id: string; nama_tahapan: string; }
interface DosenData { id: string; nama: string; nidn: string; user: User; }
interface Penguji { id: string; urutan: number; dosen: DosenData; }
interface Ruangan { id: string; nama: string; nama_ruangan: string }
interface Jadwal { tanggal: string; jam_mulai: string; jam_selesai: string; catatan: string | null; ruangan: Ruangan; }
interface Penilaian { id: string; nilai: number; status_hasil: string; catatan: string | null; }
interface PengajuanUjian {
    id: string; status: string; keterangan: string | null; submitted_at: string;
    mahasiswa: Mahasiswa; tahapan: Tahapan; penguji: Penguji[]; jadwal: Jadwal | null; penilaian: Penilaian[];
    prev_penguji?: Penguji[]; // penguji dari ujian sebelumnya (jika ada)
    nilai_locked?: boolean;   // dikunci setelah kaprodi approve penilaian
}

interface Props { pengajuanUjian: PengajuanUjian[]; dosenList: DosenData[]; ruanganList: Ruangan[]; [key: string]: any; }

export default function Index({ pengajuanUjian, dosenList, ruanganList }: Props) {
    
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [pengujiModal, setPengujiModal] = useState(false);
    const [jadwalModal, setJadwalModal] = useState(false);
    const [selectedUjian, setSelectedUjian] = useState<string | null>(null);

    const pengujiForm = useForm({ dosen_ids: [] as string[] });
    const jadwalForm = useForm({ ruangan_id: '', tanggal: '', jam_mulai: '', jam_selesai: '', catatan: '' });

    const [prevPengujiInfo, setPrevPengujiInfo] = useState<Penguji[]>([]);

    const openPengujiModal = (u: PengajuanUjian) => {
        setSelectedUjian(u.id);
        let selected = u.penguji?.map(p => p.dosen?.id).filter(Boolean) as string[] || [];
        let prevInfo: Penguji[] = [];

        if (selected.length === 0 && u.prev_penguji && u.prev_penguji.length > 0) {
            // Pre-select penguji dari ujian sebelumnya sebagai default
            selected = u.prev_penguji.map(p => p.dosen?.id).filter(Boolean) as string[];
            prevInfo = u.prev_penguji;
        }

        pengujiForm.setData('dosen_ids', selected);
        setPrevPengujiInfo(prevInfo);
        setPengujiModal(true);
    };
    const openJadwalModal = (u: PengajuanUjian) => {
        setSelectedUjian(u.id);
        if (u.jadwal) {
            jadwalForm.setData({ ruangan_id: u.jadwal.ruangan?.id || '', tanggal: u.jadwal.tanggal || '', jam_mulai: u.jadwal.jam_mulai || '', jam_selesai: u.jadwal.jam_selesai || '', catatan: u.jadwal.catatan || '' });
        } else { jadwalForm.reset(); }
        setJadwalModal(true);
    };

    const handleAssignPenguji = () => {
        if (!selectedUjian) return;
        pengujiForm.post(route('admin.ujian.penguji', selectedUjian), { 
            onSuccess: () => { 
                setPengujiModal(false); 
                setSelectedUjian(null); 
                pengujiForm.reset();
            } 
        });
    };
    const handleSetJadwal = () => {
        if (!selectedUjian) return;
        jadwalForm.post(route('admin.ujian.jadwal', selectedUjian), { onSuccess: () => { setJadwalModal(false); setSelectedUjian(null); } });
    };
    const toggleDosen = (id: string) => {
        pengujiForm.setData('dosen_ids', 
            pengujiForm.data.dosen_ids.includes(id)
                ? pengujiForm.data.dosen_ids.filter(d => d !== id)
                : [...pengujiForm.data.dosen_ids, id]
        );
    };

    const statusColor = (s: string) => ({ submitted: 'blue', reviewed: 'yellow', approved: 'green', rejected: 'red', selesai: 'purple' }[s] || 'gray');
    const statusLabel = (s: string) => ({ submitted: 'Diajukan', reviewed: 'Diproses', approved: 'Disetujui', rejected: 'Ditolak', selesai: 'Selesai' }[s] || s);

    const filtered = pengajuanUjian.filter(u => {
        const matchSearch = (u.mahasiswa?.user?.name || '').toLowerCase().includes(search.toLowerCase()) || (u.mahasiswa?.nim || '').toLowerCase().includes(search.toLowerCase()) || (u.tahapan?.nama_tahapan || '').toLowerCase().includes(search.toLowerCase());
        const matchTab = activeTab === 'all' || activeTab === u.status;
        return matchSearch && matchTab;
    });

    const counts = { all: pengajuanUjian.length, submitted: pengajuanUjian.filter(u => u.status === 'submitted').length, reviewed: pengajuanUjian.filter(u => u.status === 'reviewed').length, approved: pengajuanUjian.filter(u => u.status === 'approved').length, selesai: pengajuanUjian.filter(u => u.status === 'selesai').length };

    return (
        <AppLayout title="Manajemen Ujian">
            <PageHeader 
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Ujian' }]}
            />
            <FlashMessage message={flash?.success} />
            {flash?.error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
                    style={{ background: 'rgba(239,68,68,0.09)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.18)' }}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {flash.error}
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} label="Total Pengajuan" value={counts.all} color="from-blue-500 to-indigo-600" />
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Menunggu" value={counts.submitted} color="from-amber-500 to-orange-600" />
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Disetujui" value={counts.approved} color="from-emerald-500 to-teal-600" />
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} label="Selesai" value={counts.selesai} color="from-purple-500 to-pink-600" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Cari mahasiswa, NIM, atau jenis ujian..." /></div>
                <Tabs tabs={[
                    { key: 'all', label: 'Semua', count: counts.all },
                    { key: 'submitted', label: 'Pending', count: counts.submitted },
                    { key: 'approved', label: 'Disetujui', count: counts.approved },
                    { key: 'selesai', label: 'Selesai', count: counts.selesai },
                ]} active={activeTab} onChange={setActiveTab} />
            </div>

            {filtered.length === 0 ? (
                <Card><EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} title="Tidak ada pengajuan ujian" description="Belum ada pengajuan ujian yang sesuai filter" /></Card>
            ) : (
                <div className="space-y-4">
                    {filtered.map(u => (
                        <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden hover:shadow-md transition-all duration-300">
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <Avatar name={u.mahasiswa?.user?.name || 'M'} size="md" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">{u.tahapan?.nama_tahapan || 'Ujian'}</span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900">{u.mahasiswa?.user?.name}</h3>
                                            <p className="text-sm text-gray-400 font-mono">{u.mahasiswa?.nim}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(u.submitted_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            {u.keterangan && <p className="text-sm text-gray-500 mt-1 italic">"{u.keterangan}"</p>}
                                        </div>
                                    </div>
                                    <Badge color={statusColor(u.status)} dot>{statusLabel(u.status)}</Badge>
                                </div>

                                {/* Info: punya ujian sebelumnya tapi belum ada penguji sekarang */}
                                {u.penguji?.length === 0 && u.prev_penguji && u.prev_penguji.length > 0 && (
                                    <div className="mt-3 px-3 py-2 rounded-xl flex items-center gap-2" style={{ background: 'rgba(99,102,241,0.07)', border: '1px dashed rgba(99,102,241,0.3)' }}>
                                        <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-xs" style={{ color: '#4f46e5' }}>
                                            Pernah ujian sebelumnya — penguji lama akan dijadikan default
                                        </p>
                                    </div>
                                )}

                                {u.penguji?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Penguji</p>
                                        <div className="flex flex-wrap gap-2">
                                            {u.penguji.map(p => (
                                                <div key={p.id} className="flex items-center gap-2 bg-indigo-50/70 rounded-xl px-3 py-1.5">
                                                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">{p.urutan}</div>
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

                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                                    {u.nilai_locked ? (
                                        // ── LOCKED: penilaian sudah di-approve kaprodi ──
                                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                                            style={{ background: 'rgba(34,197,94,0.08)', color: '#15803d', border: '1px solid rgba(34,197,94,0.20)' }}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Dikunci — penilaian sudah disetujui Kaprodi
                                        </div>
                                    ) : (
                                        <>
                                            <Button variant="primary" size="sm" onClick={() => openPengujiModal(u)} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
                                                {u.penguji?.length > 0 ? 'Ubah Penguji' : 'Assign Penguji'}
                                            </Button>
                                            <Button variant="secondary" size="sm" onClick={() => openJadwalModal(u)} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
                                                {u.jadwal ? 'Ubah Jadwal' : 'Set Jadwal'}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Penguji Modal */}
            <Modal show={pengujiModal} onClose={() => { setPengujiModal(false); setPrevPengujiInfo([]); }} title="Pilih Penguji" maxWidth="max-w-lg">
                <div className="space-y-4">
                    {/* Banner: default dari ujian sebelumnya */}
                    {prevPengujiInfo.length > 0 && (
                        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.20)' }}>
                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-xs font-semibold mb-1" style={{ color: '#4f46e5' }}>Diisi otomatis dari ujian sebelumnya</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {prevPengujiInfo.map(p => (
                                        <span key={p.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: 'rgba(99,102,241,0.15)', color: '#4f46e5' }}>
                                            {p.urutan}. {p.dosen?.user?.name}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[11px] mt-1.5" style={{ color: 'rgba(79,70,229,0.65)' }}>Anda dapat mengubah pilihan di bawah ini jika diperlukan.</p>
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-gray-500">Pilih dosen yang akan bertugas sebagai penguji.</p>
                    {pengujiForm.errors.dosen_ids && (
                        <div className="text-xs text-red-600 font-medium px-1">
                            {pengujiForm.errors.dosen_ids}
                        </div>
                    )}
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {(() => {
                            const selectedUjianData = pengajuanUjian.find(u => u.id === selectedUjian);
                            const pembimbingIds = selectedUjianData?.mahasiswa?.pembimbing?.filter(p => p.status === 'approved').map(p => p.dosen_id) || [];
                            const availableDosenList = dosenList.filter(d => !pembimbingIds.includes(d.id));
                            
                            return availableDosenList.map(d => (
                                <label key={d.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${pengujiForm.data.dosen_ids.includes(d.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                    <input type="checkbox" checked={pengujiForm.data.dosen_ids.includes(d.id)} onChange={() => toggleDosen(d.id)} className="sr-only" />
                                    <Avatar name={d.user?.name || d.nama} size="sm" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{d.user?.name || d.nama}</p>
                                        <p className="text-xs text-gray-400">{d.nidn}</p>
                                    </div>
                                    {pengujiForm.data.dosen_ids.includes(d.id) && <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                </label>
                            ));
                        })()}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button variant="secondary" onClick={() => { setPengujiModal(false); setPrevPengujiInfo([]); }}>Batal</Button>
                        <Button onClick={handleAssignPenguji} disabled={pengujiForm.data.dosen_ids.length === 0 || pengujiForm.processing}>Simpan Penguji ({pengujiForm.data.dosen_ids.length})</Button>
                    </div>
                </div>
            </Modal>

            {/* Jadwal Modal */}
            <Modal show={jadwalModal} onClose={() => setJadwalModal(false)} title="Atur Jadwal Ujian" maxWidth="max-w-lg">
                <form onSubmit={e => { e.preventDefault(); handleSetJadwal(); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Ruangan" value={jadwalForm.data.ruangan_id} onChange={e => jadwalForm.setData('ruangan_id', e.target.value)} required>
                            <option value="">Pilih Ruangan</option>
                            {ruanganList.map(r => <option key={r.id} value={r.id}>{r.nama_ruangan}</option>)}
                        </Select>
                        <Input label="Tanggal" type="date" value={jadwalForm.data.tanggal} onChange={e => jadwalForm.setData('tanggal', e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Jam Mulai" type="time" value={jadwalForm.data.jam_mulai} onChange={e => jadwalForm.setData('jam_mulai', e.target.value)} required />
                        <Input label="Jam Selesai" type="time" value={jadwalForm.data.jam_selesai} onChange={e => jadwalForm.setData('jam_selesai', e.target.value)} required />
                    </div>
                    <Input label="Catatan (opsional)" value={jadwalForm.data.catatan} onChange={e => jadwalForm.setData('catatan', e.target.value)} placeholder="Catatan tambahan" />
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button variant="secondary" onClick={() => setJadwalModal(false)}>Batal</Button>
                        <Button type="submit" disabled={jadwalForm.processing}>Simpan Jadwal</Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}