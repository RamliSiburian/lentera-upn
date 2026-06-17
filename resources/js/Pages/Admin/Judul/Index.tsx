import { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Modal, SearchInput, Button, PageHeader, FlashMessage, Badge, Avatar, EmptyState, Card, Tabs } from '@/Components/UI';

interface Konsentrasi { id: string; nama: string; }
interface User { name: string; email: string; }
interface Mahasiswa { id: string; nim: string; user: User; }
interface DosenData { id: string; nidn: string; user: User; }
interface PembimbingData { id: string; urutan: string; status: string; dosen: DosenData; }
interface Judul {
    id: string; judul: string; status: string; keterangan_tolak: string | null;
    dokumen_url: string | null;
    konsentrasi: Konsentrasi; mahasiswa: Mahasiswa; pembimbing: PembimbingData[]; created_at: string;
}

interface Props { juduls: Judul[]; pendingSteps?: string[]; pembimbings?: any[]; pembimbingSteps?: string[]; [key: string]: any; }

export default function Index({ juduls, pendingSteps = [], pembimbings = [], pembimbingSteps = [] }: Props) {
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const rejectForm = useForm({ catatan: '' });

    const handleVerify = (id: string) => { router.post(route('admin.judul.verify', id)); };
    const handleReject = (id: string) => { rejectForm.post(route('admin.judul.reject', id), { onSuccess: () => { setRejectId(null); setRejectModal(false); } }); };
    const handleVerifyPembimbing = (pembimbingId: string) => { router.post(route('admin.pembimbing.verify', pembimbingId)); };
    const handleRejectPembimbing = (pembimbingId: string) => { rejectPembimbingForm.post(route('admin.pembimbing.reject', pembimbingId), { onSuccess: () => { setRejectPembimbingId(null); setRejectPembimbingModal(false); rejectPembimbingForm.reset(); } }); };

    const [rejectPembimbingId, setRejectPembimbingId] = useState<string | null>(null);
    const [rejectPembimbingModal, setRejectPembimbingModal] = useState(false);
    const rejectPembimbingForm = useForm({ catatan: '' });

    const statusColor = (s: string): string => ({
        draft: 'gray', submitted: 'blue',
        'verified_admin': 'yellow', 'verified-admin': 'yellow',
        rejected: 'red',
        'approved_kaprodi': 'green', 'kaprodi_approval': 'green',
        approved: 'green',
        'rejected_kaprodi': 'red',
    } as Record<string, string>)[s] ?? 'gray';
    const statusLabel = (s: string): string => ({
        draft: 'Draft', submitted: 'Diajukan',
        'verified_admin': 'Diverifikasi Admin', 'verified-admin': 'Diverifikasi Admin',
        rejected: 'Ditolak', approved: 'Disetujui',
        'approved_kaprodi': 'Disetujui Kaprodi', 'kaprodi_approval': 'Menunggu Kaprodi',
        'rejected_kaprodi': 'Ditolak Kaprodi',
    } as Record<string, string>)[s] ?? s;
    const pembimbingStatusColor = (s: string) => ({
        requested: 'yellow', verified_admin: 'yellow', approved: 'green', rejected: 'red',
        kaprodi_approval: 'indigo', dosen_approval: 'purple',
    }[s] || 'gray');
    const pembimbingStatusLabel = (s: string) => ({
        requested: 'Menunggu Verifikasi', verified_admin: 'Menunggu Verifikasi Admin', approved: 'Diterima', rejected: 'Ditolak',
        kaprodi_approval: 'Menunggu Kaprodi', dosen_approval: 'Menunggu Konfirmasi Dosen',
    }[s] || s);
    const canVerifyPembimbing = (p: any) => {
        if (p.status === 'approved' || p.status === 'rejected') return false;
        if (p.status === 'verified_admin' || p.status === 'requested') return true;
        if (p.status === 'kaprodi_approval' && !p.has_verified_admin_log) return true;
        return false;
    };

    const getMhsName = (j: Judul) => j.mahasiswa?.user?.name || '-';

    // Pending = status yang masih dalam alur approval (belum final)
    const isRejected = (s: string) => s === 'rejected' || s.startsWith('rejected');
    const isApproved = (s: string) => s === 'approved';
    const isPending = (s: string) => !isRejected(s) && !isApproved(s) && s !== 'draft';
    console.log({ juduls, pendingSteps });


    const filtered = juduls.filter(j => {
        const name = getMhsName(j).toLowerCase();
        const matchSearch = j.judul.toLowerCase().includes(search.toLowerCase()) || name.includes(search.toLowerCase()) || j.mahasiswa?.nim?.toLowerCase().includes(search.toLowerCase());
        const matchTab = activeTab === 'all' ||
            (activeTab === 'pending' && isPending(j.status)) ||
            (activeTab === 'approved' && isApproved(j.status)) ||
            (activeTab === 'rejected' && isRejected(j.status));
        return matchSearch && matchTab;
    });

    const counts = {
        all: juduls.length,
        pending: juduls.filter(j => isPending(j.status)).length,
        approved: juduls.filter(j => isApproved(j.status)).length,
        rejected: juduls.filter(j => isRejected(j.status)).length,
    };

    console.log({ juduls });


    return (
        <AppLayout title="Verifikasi Judul">
            <PageHeader
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Verifikasi Judul' }]}
            />
            <FlashMessage message={(usePage().props as any).flash?.success} />

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Cari judul, nama, atau NIM..." /></div>
                <Tabs tabs={[
                    { key: 'all', label: 'Semua', count: counts.all },
                    { key: 'pending', label: 'Pending', count: counts.pending },
                    { key: 'approved', label: 'Disetujui', count: counts.approved },
                    { key: 'rejected', label: 'Ditolak', count: counts.rejected },
                ]} active={activeTab} onChange={setActiveTab} />
            </div>

            {filtered.length === 0 ? (
                <Card><EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} title="Tidak ada pengajuan" description="Belum ada pengajuan judul yang sesuai filter" /></Card>
            ) : (
                <div className="space-y-4">
                    {filtered.map(j => (
                        <div key={j.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden hover:shadow-md transition-all duration-300">
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <Avatar name={getMhsName(j)} size="md" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1 line-clamp-2">{j.judul}</h3>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                                <span className="font-medium text-gray-700">{getMhsName(j)}</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="font-mono text-xs bg-gray-50 px-1.5 py-0.5 rounded">{j.mahasiswa?.nim}</span>
                                                {j.konsentrasi && (<><span className="text-gray-300">•</span><span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs">{j.konsentrasi.nama}</span></>)}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1.5">{new Date(j.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <Badge color={statusColor(j.status)} dot>{statusLabel(j.status)}</Badge>
                                </div>

                                {j.dokumen_url && (
                                    <div className="mt-3">
                                        <a href={j.dokumen_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                            Lihat Sinopsis (PDF)
                                        </a>
                                    </div>
                                )}

                                {j.keterangan_tolak && (
                                    <div className="mt-3 flex items-start gap-2 p-3 bg-red-50/70 rounded-xl text-sm text-red-700">
                                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                        {j.keterangan_tolak}
                                    </div>
                                )}

                                {j.pembimbing?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pembimbing</p>
                                        <div className="space-y-2">
                                            {j.pembimbing.map(p => (
                                                <div key={p.id} className="flex items-center justify-between bg-gray-50/70 rounded-xl px-4 py-2.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{p.urutan === 'pembimbing_utama' ? 'P1' : 'P2'}</div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">{p.dosen?.user?.name || '-'}</p>
                                                            <p className="text-xs text-gray-400">{p.dosen?.nidn}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge color={pembimbingStatusColor(p.status)} dot>{pembimbingStatusLabel(p.status)}</Badge>
                                                        {canVerifyPembimbing(p) && (
                                                            <Button size="sm" variant="success" onClick={() => handleVerifyPembimbing(p.id)}>Verifikasi</Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {pendingSteps.includes(j.status) && (
                                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                                        <Button variant="success" onClick={() => handleVerify(j.id)} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}>Verifikasi Judul</Button>
                                        <Button variant="danger" onClick={() => { setRejectId(j.id); setRejectModal(true); }} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}>Tolak</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── SECTION: Verifikasi Pembimbing ───────────────────────────── */}
            {pembimbings.length > 0 && (
                <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-base font-semibold text-gray-800">Verifikasi Pembimbing</h2>
                        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-600">{pembimbings.length}</span>
                    </div>
                    <div className="space-y-3">
                        {pembimbings.map((p: any) => (
                            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                {p.urutan === 'pembimbing_utama' ? 'P1' : 'P2'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{p.dosen?.user?.name || '-'}</p>
                                                <p className="text-xs text-gray-400 font-mono">{p.dosen?.nidn}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge color={pembimbingStatusColor(p.status)} dot>{pembimbingStatusLabel(p.status)}</Badge>
                                            <Button size="sm" variant="success" onClick={() => handleVerifyPembimbing(p.id)}>Verifikasi</Button>
                                            <Button size="sm" variant="danger" onClick={() => { setRejectPembimbingId(p.id); setRejectPembimbingModal(true); }}>Tolak</Button>
                                        </div>
                                    </div>

                                    {/* Info mahasiswa & judul */}
                                    <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">Mahasiswa:</span>
                                            <span className="text-xs font-medium text-gray-700">{p.mahasiswa?.user?.name || '-'}</span>
                                            <span className="text-xs text-gray-300">•</span>
                                            <span className="text-xs font-mono text-gray-500">{p.mahasiswa?.nim}</span>
                                        </div>
                                        {p.judul_pengajuan?.judul && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-xs text-gray-400 flex-shrink-0">Judul:</span>
                                                <span className="text-xs text-gray-600 leading-relaxed line-clamp-2">{p.judul_pengajuan.judul}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Modal show={rejectModal} onClose={() => setRejectModal(false)} title="Tolak Pengajuan Judul" maxWidth="max-w-md">
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Berikan alasan penolakan untuk pengajuan judul ini.</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan Penolakan</label>
                        <textarea value={rejectForm.data.catatan} onChange={e => rejectForm.setData('catatan', e.target.value)} placeholder="Tuliskan alasan penolakan..." rows={3} className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-200 outline-none resize-none" required />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setRejectModal(false)}>Batal</Button>
                        <Button variant="danger" onClick={() => rejectId && handleReject(rejectId)}>Tolak Pengajuan</Button>
                    </div>
                </div>
            </Modal>

            <Modal show={rejectPembimbingModal} onClose={() => setRejectPembimbingModal(false)} title="Tolak Pembimbing" maxWidth="max-w-md">
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Berikan alasan penolakan untuk pembimbing ini.</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan Penolakan</label>
                        <textarea value={rejectPembimbingForm.data.catatan} onChange={e => rejectPembimbingForm.setData('catatan', e.target.value)} placeholder="Tuliskan alasan penolakan..." rows={3} className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-200 outline-none resize-none" required />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setRejectPembimbingModal(false)}>Batal</Button>
                        <Button variant="danger" onClick={() => rejectPembimbingId && handleRejectPembimbing(rejectPembimbingId)}>Tolak Pembimbing</Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}