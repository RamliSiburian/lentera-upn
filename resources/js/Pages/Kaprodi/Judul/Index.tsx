import { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Modal, Button, PageHeader, FlashMessage, Badge, Avatar, EmptyState, Card } from '@/Components/UI';

interface Konsentrasi { id: string; nama: string; }
interface User { name: string; email: string; }
interface Prodi { id: string; nama: string; jenjang: string; kode: string; }
interface Mahasiswa { id: string; nim: string; user: User; prodi: Prodi | null; }
interface DosenData { id: string; nidn: string; user: User; }
interface PembimbingData { id: string; urutan: string; status: string; dosen: DosenData; }
interface Judul {
    id: string; judul: string; status: string; keterangan_tolak: string | null;
    dokumen_url: string | null;
    konsentrasi: Konsentrasi; mahasiswa: Mahasiswa; pembimbing: PembimbingData[]; created_at: string;
    revision_status: string | null; alasan_revisi: string | null; catatan_revisi_kaprodi: string | null;
}
interface Props { juduls: Judul[]; pendingSteps?: string[]; pembimbingSteps?: string[]; managedProdis?: Prodi[]; [key: string]: any; }

export default function Index({ juduls, pendingSteps = [], pembimbingSteps = [], managedProdis = [] }: Props) {
    const { flash } = usePage().props as any;
    const [rejectId, setRejectId] = useState<string | null>(null);
    const rejectForm = useForm({ catatan: '' });
    const [rejectPembimbingId, setRejectPembimbingId] = useState<string | null>(null);
    const rejectPembimbingForm = useForm({ catatan: '' });

    const [activeTab, setActiveTab] = useState<'baru' | 'revisi' | 'histori'>('baru');
    const [reviewRevisiId, setReviewRevisiId] = useState<string | null>(null);
    const [reviewRevisiAksi, setReviewRevisiAksi] = useState<'acc' | 'tolak' | null>(null);
    const reviewRevisiForm = useForm({
        aksi: '',
        catatan_revisi_kaprodi: '',
    });

    const handleApprove = (id: string) => { router.post(route('kaprodi.judul.approve', id), { catatan: '' }); };
    const handleReject = (id: string) => { rejectForm.post(route('kaprodi.judul.reject', id), { onSuccess: () => { setRejectId(null); rejectForm.reset(); } }); };
    const handleApprovePembimbing = (id: string) => { router.post(route('kaprodi.pembimbing.approve', id), { catatan: '' }); };
    const handleRejectPembimbing = (id: string) => { rejectPembimbingForm.post(route('kaprodi.pembimbing.reject', id), { onSuccess: () => { setRejectPembimbingId(null); rejectPembimbingForm.reset(); } }); };

    const handleReviewRevisi = (id: string, aksi: 'acc' | 'tolak') => {
        reviewRevisiForm.transform((data) => ({
            ...data,
            aksi: aksi,
        }));
        reviewRevisiForm.post(route('kaprodi.judul.revisi.review', id), {
            onSuccess: () => {
                setReviewRevisiId(null);
                setReviewRevisiAksi(null);
                reviewRevisiForm.reset();
            }
        });
    };

    const statusColor = (s: string): string => ({
        draft: 'gray', submitted: 'blue',
        'verified_admin': 'yellow', 'verified-admin': 'yellow',
        rejected: 'red', approved: 'green',
        'approved_kaprodi': 'green', 'kaprodi_approval': 'indigo',
        'rejected_kaprodi': 'red',
    } as Record<string, string>)[s] ?? 'gray';
    const statusLabel = (s: string): string => ({
        draft: 'Draft', submitted: 'Diajukan',
        'verified_admin': 'Diverifikasi Admin', 'verified-admin': 'Diverifikasi Admin',
        rejected: 'Ditolak', approved: 'Disetujui',
        'approved_kaprodi': 'Disetujui Kaprodi', 'kaprodi_approval': 'Menunggu Kaprodi',
        'rejected_kaprodi': 'Ditolak Kaprodi',
    } as Record<string, string>)[s] ?? s;
    const pembimbingStatusColor = (s: string): string => ({ requested: 'yellow', 'verified_admin': 'yellow', 'verified-admin': 'yellow', 'kaprodi_approval': 'indigo', 'dosen_approval': 'purple', approved: 'green', rejected: 'red' } as Record<string, string>)[s] ?? 'gray';
    const pembimbingStatusLabel = (s: string): string => ({ requested: 'Menunggu Verifikasi', 'verified_admin': 'Menunggu Verifikasi Admin', 'verified-admin': 'Menunggu Verifikasi Admin', 'kaprodi_approval': 'Menunggu Kaprodi', 'dosen_approval': 'Menunggu Konfirmasi Dosen', approved: 'Diterima', rejected: 'Ditolak' } as Record<string, string>)[s] ?? s;

    return (
        <AppLayout title="Verifikasi Judul & Pembimbing">
            <PageHeader 
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Verifikasi Judul' }]}
            />
            <FlashMessage message={flash?.success} />

            {/* Info prodi yang dikelola */}
            {managedProdis.length > 0 && (
                <div className="mb-4 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 font-medium">Mengelola prodi:</span>
                    {managedProdis.map(p => (
                        <span key={p.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            {p.jenjang}. {p.nama}
                        </span>
                    ))}
                </div>
            )}
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('baru')}
                    className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 ${
                        activeTab === 'baru'
                            ? 'border-orange-500 text-orange-600 font-bold'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Pengajuan Judul Baru ({juduls.filter(j => j.status !== 'approved' && j.revision_status !== 'revision_pending').length})
                </button>
                <button
                    onClick={() => setActiveTab('revisi')}
                    className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 ${
                        activeTab === 'revisi'
                            ? 'border-orange-500 text-orange-600 font-bold'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Revisi Judul ({juduls.filter(j => j.revision_status === 'revision_pending').length})
                </button>
                <button
                    onClick={() => setActiveTab('histori')}
                    className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 ${
                        activeTab === 'histori'
                            ? 'border-orange-500 text-orange-600 font-bold'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <span className="inline-flex items-center gap-1.5">
                        Histori ({juduls.filter(j => j.status === 'approved' && j.revision_status !== 'revision_pending').length})
                        {/* Badge notif jika ada pembimbing pending di histori */}
                        {juduls.some(j => j.status === 'approved' && j.pembimbing?.some(p => pembimbingSteps.includes(p.status))) && (
                            <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-orange-500 text-white rounded-full">
                                !
                            </span>
                        )}
                    </span>
                </button>
            </div>

            {/* Tab: Baru */}
            {activeTab === 'baru' && (
                <div className="space-y-4">
                    {juduls.filter(j => j.status !== 'approved' && j.revision_status !== 'revision_pending').length === 0 ? (
                        <Card><EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} title="Tidak ada pengajuan" description="Belum ada judul baru yang perlu diverifikasi" /></Card>
                    ) : (
                        juduls.filter(j => j.status !== 'approved' && j.revision_status !== 'revision_pending').map(j => (
                            <div key={j.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden hover:shadow-md transition-all duration-300">
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <Avatar name={j.mahasiswa?.user?.name || 'M'} size="md" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge color={statusColor(j.status)} dot>{statusLabel(j.status)}</Badge>
                                                    {j.konsentrasi && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">{j.konsentrasi.nama}</span>}
                                                </div>
                                                <h3 className="font-semibold text-gray-900 line-clamp-2">{j.judul}</h3>
                                                <p className="text-sm text-gray-400 mt-0.5">
                                                    {j.mahasiswa?.user?.name || '-'} • {j.mahasiswa?.nim}
                                                </p>
                                                {j.mahasiswa?.prodi && (
                                                    <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-semibold ${
                                                        j.mahasiswa.prodi.jenjang === 'S1' ? 'bg-emerald-50 text-emerald-700' :
                                                        j.mahasiswa.prodi.jenjang === 'D3' ? 'bg-blue-50 text-blue-700' :
                                                        'bg-purple-50 text-purple-700'
                                                    }`}>
                                                        {j.mahasiswa.prodi.jenjang}. {j.mahasiswa.prodi.nama}
                                                    </span>
                                                )}
                                                <p className="text-xs text-gray-300 mt-0.5">{new Date(j.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
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
                                        <div className="mt-3 p-2.5 bg-red-50/70 rounded-xl text-sm text-red-700">
                                            <span className="font-medium">Alasan:</span> {j.keterangan_tolak}
                                        </div>
                                    )}

                                    {j.pembimbing?.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pembimbing</p>
                                            <div className="space-y-1.5">
                                                {j.pembimbing.map(p => (
                                                    <div key={p.id} className="flex items-center justify-between p-2.5 bg-gray-50/70 rounded-xl">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{p.urutan === 'pembimbing_utama' ? 'P1' : 'P2'}</div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">{p.dosen?.user?.name || '-'}</p>
                                                                <p className="text-xs text-gray-400 font-mono">{p.dosen?.nidn}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge color={pembimbingStatusColor(p.status)}>{pembimbingStatusLabel(p.status)}</Badge>
                                                            {pendingSteps.includes(p.status) && (
                                                                <div className="flex gap-1.5 ml-2">
                                                                    <button onClick={() => handleApprovePembimbing(p.id)} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">ACC</button>
                                                                    <button onClick={() => setRejectPembimbingId(p.id)} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Tolak</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {rejectPembimbingId && j.pembimbing.some(p => p.id === rejectPembimbingId) && (
                                                <div className="mt-2 flex gap-2 items-center p-3 bg-red-50/50 rounded-xl border border-red-100">
                                                    <input value={rejectPembimbingForm.data.catatan} onChange={e => rejectPembimbingForm.setData('catatan', e.target.value)} placeholder="Alasan penolakan..." className="flex-1 border border-red-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none" required />
                                                    <Button size="sm" variant="danger" onClick={() => handleRejectPembimbing(rejectPembimbingId!)}>Tolak</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => { setRejectPembimbingId(null); rejectPembimbingForm.reset(); }}>Batal</Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {pendingSteps.includes(j.status) && (
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                                            <Button size="sm" variant="success" onClick={() => handleApprove(j.id)} icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}>Approve Judul</Button>
                                            <Button size="sm" variant="danger" onClick={() => setRejectId(j.id)} icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}>Tolak</Button>
                                        </div>
                                    )}

                                    {rejectId === j.id && (
                                        <div className="mt-3 flex gap-2 items-center p-3 bg-red-50/50 rounded-xl border border-red-100">
                                            <input value={rejectForm.data.catatan} onChange={e => rejectForm.setData('catatan', e.target.value)} placeholder="Alasan penolakan judul..." className="flex-1 border border-red-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none" required />
                                            <Button size="sm" variant="danger" onClick={() => handleReject(j.id)} disabled={rejectForm.processing}>Submit</Button>
                                            <Button size="sm" variant="ghost" onClick={() => { setRejectId(null); rejectForm.reset(); }}>Batal</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Tab: Revisi */}
            {activeTab === 'revisi' && (
                <div className="space-y-4">
                    {juduls.filter(j => j.revision_status === 'revision_pending').length === 0 ? (
                        <Card><EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} title="Tidak ada revisi" description="Tidak ada pengajuan revisi judul yang perlu ditinjau." /></Card>
                    ) : (
                        juduls.filter(j => j.revision_status === 'revision_pending').map(j => (
                            <div key={j.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden hover:shadow-md transition-all duration-300">
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <Avatar name={j.mahasiswa?.user?.name || 'M'} size="md" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge color="yellow" dot>Revisi Pending</Badge>
                                                    {j.konsentrasi && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">{j.konsentrasi.nama}</span>}
                                                </div>
                                                <h3 className="font-semibold text-gray-900 line-clamp-2">{j.judul}</h3>
                                                <p className="text-sm text-gray-400 mt-0.5">
                                                    {j.mahasiswa?.user?.name || '-'} • {j.mahasiswa?.nim}
                                                </p>
                                                {j.mahasiswa?.prodi && (
                                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                                                        {j.mahasiswa.prodi.jenjang}. {j.mahasiswa.prodi.nama}
                                                    </span>
                                                )}
                                                <p className="text-xs text-gray-300 mt-1">Diajukan: {new Date(j.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Alasan revisi */}
                                    <div className="mt-4 p-3 bg-orange-50/50 rounded-xl border border-orange-100 text-sm text-gray-700">
                                        <div className="font-semibold text-orange-800 text-[11px] mb-1 uppercase tracking-wider">Alasan revisi dari mahasiswa:</div>
                                        "{j.alasan_revisi}"
                                    </div>

                                    {j.dokumen_url && (
                                        <div className="mt-3">
                                            <a href={j.dokumen_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                Lihat Sinopsis Baru (PDF)
                                            </a>
                                        </div>
                                    )}

                                    {reviewRevisiId !== j.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                                            <Button size="sm" variant="success" onClick={() => { setReviewRevisiId(j.id); setReviewRevisiAksi('acc'); }} icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}>Setujui Revisi</Button>
                                            <Button size="sm" variant="danger" onClick={() => { setReviewRevisiId(j.id); setReviewRevisiAksi('tolak'); }} icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}>Tolak Revisi</Button>
                                        </div>
                                    )}

                                    {reviewRevisiId === j.id && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                                {reviewRevisiAksi === 'acc' ? 'Berikan Catatan Persetujuan Revisi' : 'Berikan Alasan Penolakan Revisi'} (Wajib)
                                            </div>
                                            <textarea
                                                value={reviewRevisiForm.data.catatan_revisi_kaprodi}
                                                onChange={e => reviewRevisiForm.setData('catatan_revisi_kaprodi', e.target.value)}
                                                placeholder={reviewRevisiAksi === 'acc' ? "Catatan persetujuan revisi judul..." : "Alasan penolakan revisi judul..."}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none mb-3"
                                                rows={3}
                                                required
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={reviewRevisiAksi === 'acc' ? 'success' : 'danger'}
                                                    onClick={() => handleReviewRevisi(j.id, reviewRevisiAksi!)}
                                                    disabled={reviewRevisiForm.processing || !reviewRevisiForm.data.catatan_revisi_kaprodi}
                                                >
                                                    {reviewRevisiForm.processing ? 'Memproses...' : 'Kirim Keputusan'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => { setReviewRevisiId(null); setReviewRevisiAksi(null); reviewRevisiForm.reset(); }}
                                                >
                                                    Batal
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Tab: Histori */}
            {activeTab === 'histori' && (
                <div className="space-y-4">
                    {juduls.filter(j => j.status === 'approved' && j.revision_status !== 'revision_pending').length === 0 ? (
                        <Card><EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} title="Tidak ada histori" description="Belum ada judul yang disetujui" /></Card>
                    ) : (
                        juduls.filter(j => j.status === 'approved' && j.revision_status !== 'revision_pending').map(j => (
                            <div key={j.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden hover:shadow-md transition-all duration-300">
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <Avatar name={j.mahasiswa?.user?.name || 'M'} size="md" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge color="green" dot>Disetujui</Badge>
                                                    {j.konsentrasi && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">{j.konsentrasi.nama}</span>}
                                                </div>
                                                <h3 className="font-semibold text-gray-900 line-clamp-2">{j.judul}</h3>
                                                <p className="text-sm text-gray-400 mt-0.5">
                                                    {j.mahasiswa?.user?.name || '-'} &bull; {j.mahasiswa?.nim}
                                                </p>
                                                {j.mahasiswa?.prodi && (
                                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                                                        {j.mahasiswa.prodi.jenjang}. {j.mahasiswa.prodi.nama}
                                                    </span>
                                                )}
                                                <p className="text-xs text-gray-300 mt-0.5">{new Date(j.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {j.dokumen_url && (
                                        <div className="mt-3">
                                            <a href={j.dokumen_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                Lihat Sinopsis (PDF)
                                            </a>
                                        </div>
                                    )}

                                    {j.pembimbing?.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pembimbing</p>
                                            <div className="space-y-1.5">
                                                {j.pembimbing.map(p => (
                                                    <div key={p.id} className="flex items-center justify-between p-2.5 bg-gray-50/70 rounded-xl">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{p.urutan === 'pembimbing_utama' ? 'P1' : 'P2'}</div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">{p.dosen?.user?.name || '-'}</p>
                                                                <p className="text-xs text-gray-400 font-mono">{p.dosen?.nidn}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge color={pembimbingStatusColor(p.status)}>{pembimbingStatusLabel(p.status)}</Badge>
                                                            {pembimbingSteps.includes(p.status) && (
                                                                <div className="flex gap-1.5 ml-2">
                                                                    <button onClick={() => handleApprovePembimbing(p.id)} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">ACC</button>
                                                                    <button onClick={() => setRejectPembimbingId(p.id)} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Tolak</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {rejectPembimbingId && j.pembimbing.some(p => p.id === rejectPembimbingId) && (
                                                <div className="mt-2 flex gap-2 items-center p-3 bg-red-50/50 rounded-xl border border-red-100">
                                                    <input value={rejectPembimbingForm.data.catatan} onChange={e => rejectPembimbingForm.setData('catatan', e.target.value)} placeholder="Alasan penolakan..." className="flex-1 border border-red-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none" required />
                                                    <Button size="sm" variant="danger" onClick={() => handleRejectPembimbing(rejectPembimbingId!)}>Tolak</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => { setRejectPembimbingId(null); rejectPembimbingForm.reset(); }}>Batal</Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Jika belum ada pembimbing: tampilkan info menunggu */}
                                    {(!j.pembimbing || j.pembimbing.length === 0) && (
                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            <p className="text-xs text-gray-400 italic">Menunggu mahasiswa memilih pembimbing...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </AppLayout>
    );
}