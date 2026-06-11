import { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Modal, Button, SearchInput, PageHeader, FlashMessage, Badge, Avatar, EmptyState, Card } from '@/Components/UI';

interface TahapanConfig { id: string; nama: string; urutan: number; }
interface BimbinganFile { id: string; nama_file: string; path_file: string; }
interface ApprovalPembimbing { urutan: number; dosen: { nama: string }; }
interface Approval { id: string; status: string; catatan: string | null; file_revisi: string | null; pembimbing_id: string; pembimbing: ApprovalPembimbing; approved_at: string | null; }
interface Komentar { id: string; komentar: string; created_at: string; user: { name: string; role: string }; }
interface Bimbingan { id: string; tipe: string; status: string; catatan_mhs: string | null; versi: number; created_at: string; tahapan_config: TahapanConfig; files: BimbinganFile[]; approvals: Approval[]; komentar: Komentar[]; }
interface MahasiswaData { id: string; nim: string; nama: string; user: { name: string }; }
interface KonsentrasiData { id: string; nama: string; }
interface JudulPengajuan { id: string; judul: string; mahasiswa: MahasiswaData; konsentrasi: KonsentrasiData; bimbingan: Bimbingan[]; }
interface PembimbingData { id: string; urutan: number; status: string; judulPengajuan: JudulPengajuan; }
interface DosenData { id: string; nama: string; nidn: string; }
interface Props { pembimbings: PembimbingData[]; dosen: DosenData; dosenPendingSteps?: string[]; [key: string]: any; }

export default function Index({ pembimbings, dosen, dosenPendingSteps = ['dosen_approval', 'requested'] }: Props) {
    const { flash } = usePage().props as any;
    const [activeJudul, setActiveJudul] = useState<string | null>(null);
    const [activeBimbingan, setActiveBimbingan] = useState<string | null>(null);
    const [komentarText, setKomentarText] = useState<Record<string, string>>({});
    const [catatanForm, setCatatanForm] = useState<Record<string, string>>({});
    const [fileForm, setFileForm] = useState<Record<string, File | null>>({});
    const [rejectModal, setRejectModal] = useState<{ type: 'pembimbing' | 'bimbingan', id: string } | null>(null);
    const [rejectCatatan, setRejectCatatan] = useState('');
    const [rejectFile, setRejectFile] = useState<File | null>(null);

    const handleApprove = (bimbinganId: string) => { router.post(route('dosen.bimbingan.approve', bimbinganId), { catatan: catatanForm[bimbinganId] || '' }); };
    const handleRevisi = (bimbinganId: string) => { router.post(route('dosen.bimbingan.revisi', bimbinganId), { catatan: catatanForm[bimbinganId] || '', file_revisi: fileForm[bimbinganId] || null }, { forceFormData: true }); };
    const handleReject = (bimbinganId: string) => { router.post(route('dosen.bimbingan.reject', bimbinganId), { catatan: rejectCatatan, file_revisi: rejectFile || null }, { forceFormData: true }); setRejectModal(null); setRejectCatatan(''); setRejectFile(null); };
    const handleAddKomentar = (bimbinganId: string) => { const k = komentarText[bimbinganId]; if (!k) return; router.post(route('dosen.bimbingan.komentar', bimbinganId), { komentar: k }, { onSuccess: () => setKomentarText(prev => ({ ...prev, [bimbinganId]: '' })) }); };
    const handleAcceptPembimbing = (pembimbingId: string) => { router.post(route('dosen.pembimbing.approve', pembimbingId)); };
    const handleRejectPembimbing = () => { if (!rejectModal) return; router.post(route('dosen.pembimbing.reject', rejectModal.id), { catatan: rejectCatatan }); setRejectModal(null); setRejectCatatan(''); };

    const statusColor = (s: string) => ({ submitted: 'blue', in_review: 'yellow', approved: 'green', rejected: 'red', diajukan: 'blue', acc_pembimbing1: 'yellow', acc_semua_pembimbing: 'green', revisi: 'yellow', ditolak: 'red' }[s] || 'gray');
    const statusLabel = (s: string) => ({ submitted: 'Menunggu Review', in_review: 'Dalam Review', approved: 'Disetujui', rejected: 'Ditolak/Revisi', diajukan: 'Menunggu Review', acc_pembimbing1: 'ACC Pembimbing 1', acc_semua_pembimbing: 'Selesai', revisi: 'Perlu Revisi', ditolak: 'Ditolak' }[s] || s);
    const approvalIcon = (s: string) => s === 'approved' || s === 'acc' ? '✓' : s === 'rejected' || s === 'ditolak' ? '✕' : s === 'pending' ? '○' : '○';
    const approvalStatusIcon = (s: string) => s === 'approved' ? 'bg-green-100 text-green-600' : s === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400';
    const approvalBadgeColor = (s: string) => s === 'approved' ? 'green' : s === 'rejected' ? 'red' : 'gray';
    const approvalStatusLabel = (s: string) => s === 'approved' ? 'ACC' : s === 'rejected' ? 'Ditolak' : s === 'pending' ? 'Menunggu' : s || 'Menunggu';

    const countPendingBimbingan = pembimbings.reduce((acc, p) => acc + (p.judulPengajuan?.bimbingan?.filter(b => b.approvals.some(a => a.pembimbing_id === p.id && a.status === 'pending')).length || 0), 0);

    return (
        <AppLayout title="Bimbingan Mahasiswa">
            <PageHeader
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Bimbingan' }]}
            />
            <FlashMessage message={flash?.success} />

            {countPendingBimbingan > 0 && (
                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3 text-indigo-800">
                    <div className="flex-shrink-0 animate-pulse">
                        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </div>
                    <div>
                        <p className="font-semibold">Ada {countPendingBimbingan} bimbingan menunggu aksi Anda</p>
                        <p className="text-sm opacity-80">Segera tinjau permintaan bimbingan mahasiswa untuk mempercepat proses akademik.</p>
                    </div>
                </div>
            )}

            {pembimbings.length === 0 ? (
                <Card><EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} title="Belum ada mahasiswa bimbingan" description="Anda belum memiliki mahasiswa bimbingan saat ini" /></Card>
            ) : (
                <div className="space-y-4">
                    {pembimbings.filter(p => p.judulPengajuan).map(p => {
                        const hasPendingBimbingan = p.judulPengajuan.bimbingan?.some(b => b.approvals.some(a => a.pembimbing_id === p.id && a.status === 'pending'));
                        return (
                            <div key={p.id} className={`bg-white rounded-2xl shadow-sm border ${hasPendingBimbingan ? 'border-indigo-200 ring-1 ring-indigo-50' : 'border-gray-100/80'} overflow-hidden hover:shadow-md transition-all duration-300`}>
                                {/* Header */}
                                <div className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors" onClick={() => setActiveJudul(activeJudul === p.judulPengajuan.id ? null : p.judulPengajuan.id)}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <Avatar name={p.judulPengajuan.mahasiswa?.nama || 'M'} size="md" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge color="indigo">Pembimbing {p.urutan}</Badge>
                                                    <Badge color={p.status === 'approved' ? 'green' : p.status === 'rejected' ? 'red' : 'yellow'}>{p.status === 'approved' ? 'Diterima' : p.status === 'rejected' ? 'Ditolak' : p.status}</Badge>
                                                    {hasPendingBimbingan && <Badge color="indigo" dot>Menunggu Aksi</Badge>}
                                                </div>
                                                <h3 className="font-semibold text-gray-900 line-clamp-1">{p.judulPengajuan.judul}</h3>
                                                <p className="text-sm text-gray-400">{p.judulPengajuan.mahasiswa?.nama} • {p.judulPengajuan.mahasiswa?.nim}{p.judulPengajuan.konsentrasi ? ` • ${p.judulPengajuan.konsentrasi.nama}` : ''}</p>
                                            </div>
                                        </div>
                                        <svg className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${activeJudul === p.judulPengajuan.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>

                                {activeJudul === p.judulPengajuan.id && (
                                    <div className="px-5 pb-5 border-t border-gray-50">
                                        {dosenPendingSteps.includes(p.status) && (
                                            <div className="mt-4 p-4 bg-amber-50/70 rounded-xl flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                                    <span className="text-sm text-amber-700 font-medium">Permintaan pembimbing menunggu konfirmasi Anda</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="success" onClick={() => handleAcceptPembimbing(p.id)}>Terima</Button>
                                                    <Button size="sm" variant="danger" onClick={() => setRejectModal({ type: 'pembimbing', id: p.id })}>Tolak</Button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 space-y-3">
                                            {(!p.judulPengajuan.bimbingan || p.judulPengajuan.bimbingan.length === 0) && (
                                                <p className="text-sm text-gray-400 text-center py-6">Belum ada bimbingan dari mahasiswa ini.</p>
                                            )}
                                            {p.judulPengajuan.bimbingan?.map(b => {
                                                const isPending = b.approvals.some(a => a.pembimbing_id === p.id && a.status === 'pending');
                                                return (
                                                    <div key={b.id} className={`border ${isPending ? 'border-indigo-200 bg-indigo-50/20' : 'border-gray-100'} rounded-xl overflow-hidden`}>
                                                        <div className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors flex items-center justify-between" onClick={() => setActiveBimbingan(activeBimbingan === b.id ? null : b.id)}>
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${b.tipe === 'revisi' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>{b.tipe === 'revisi' ? 'R' : 'B'}{b.versi}</div>
                                                                <div>
                                                                    <span className="text-sm font-medium text-gray-800">{b.tahapan_config?.nama}</span>
                                                                    <span className="text-xs text-gray-400 ml-2">{new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {isPending && <Badge color="indigo">Butuh Review</Badge>}
                                                                <Badge color={statusColor(b.status)} dot>{statusLabel(b.status)}</Badge>
                                                                <svg className={`w-4 h-4 text-gray-400 transition-transform ${activeBimbingan === b.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                            </div>
                                                        </div>

                                                        {activeBimbingan === b.id && (
                                                            <div className="px-4 pb-4 border-t border-gray-50 bg-gray-50/30">
                                                                <div className="mt-3">
                                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">File</p>
                                                                    <div className="space-y-1">
                                                                        {b.files.map(f => (
                                                                            <a key={f.id} href={`/storage/${f.path_file}`} target="_blank" className="flex items-center gap-2 p-2 bg-red-50/50 rounded-lg text-sm text-red-700 hover:bg-red-50 transition-colors">
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                                                {f.nama_file}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="mt-3">
                                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Approval</p>
                                                                    <div className="space-y-1">
                                                                        {b.approvals.map(a => (
                                                                            <div key={a.id} className="flex items-center justify-between p-2 bg-white/70 rounded-lg">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${approvalStatusIcon(a.status)}`}>{approvalIcon(a.status)}</span>
                                                                                    <span className="text-xs text-gray-600">Pembimbing {a.pembimbing?.urutan || '-'} <span className="text-gray-400">· {a.pembimbing?.dosen?.nama || '-'}</span></span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <Badge color={approvalBadgeColor(a.status)}>{approvalStatusLabel(a.status)}</Badge>
                                                                                    {a.catatan && <span className="text-xs text-gray-400 max-w-[150px] truncate">"{a.catatan}"</span>}
                                                                                    {a.file_revisi && (
                                                                                        <a href={a.file_revisi} target="_blank" className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-md text-[10px] font-medium hover:bg-red-100 transition-colors">
                                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                                                            File Revisi
                                                                                        </a>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {isPending && (
                                                                    <div className="mt-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                                        <input value={catatanForm[b.id] || ''} onChange={e => setCatatanForm(prev => ({ ...prev, [b.id]: e.target.value }))} placeholder="Catatan (opsional untuk ACC, wajib untuk revisi)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white outline-none transition-all mb-2" />
                                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                            <label className="text-xs font-medium text-gray-500">File Revisi (opsional untuk ACC, wajib untuk Revisi):</label>
                                                                            <input type="file" accept=".pdf" onChange={e => setFileForm(prev => ({ ...prev, [b.id]: e.target.files?.[0] || null }))} className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Button size="sm" variant="success" onClick={() => handleApprove(b.id)} icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}>ACC</Button>
                                                                            <Button size="sm" variant="primary" onClick={() => handleRevisi(b.id)} disabled={!fileForm[b.id]} icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}>Revisi</Button>
                                                                            <Button size="sm" variant="danger" onClick={() => setRejectModal({ type: 'bimbingan', id: b.id })} icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}>Tolak</Button>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="mt-3">
                                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Komentar</p>
                                                                    <div className="space-y-1.5 mb-2 max-h-48 overflow-y-auto">
                                                                        {b.komentar.length === 0 && <p className="text-xs text-gray-400 text-center py-3">Belum ada komentar</p>}
                                                                        {b.komentar.map(k => (
                                                                            <div key={k.id} className={`p-2.5 rounded-lg ${k.user.role === 'dosen' ? 'bg-indigo-50/70 ml-4' : 'bg-white mr-4'}`}>
                                                                                <div className="flex justify-between items-center mb-0.5">
                                                                                    <span className={`text-xs font-semibold ${k.user.role === 'dosen' ? 'text-indigo-600' : 'text-gray-600'}`}>{k.user.name}</span>
                                                                                    <span className="text-[10px] text-gray-400">{new Date(k.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                                                                                </div>
                                                                                <p className="text-xs text-gray-600">{k.komentar}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <input value={komentarText[b.id] || ''} onChange={e => setKomentarText(prev => ({ ...prev, [b.id]: e.target.value }))} placeholder="Tulis komentar..." className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" onKeyDown={e => { if (e.key === 'Enter') handleAddKomentar(b.id); }} />
                                                                        <Button size="sm" onClick={() => handleAddKomentar(b.id)}>Kirim</Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal show={!!rejectModal} onClose={() => { setRejectModal(null); setRejectCatatan(''); }} title="Tolak" maxWidth="max-w-md">
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Berikan alasan penolakan.</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan</label>
                        <textarea value={rejectCatatan} onChange={e => setRejectCatatan(e.target.value)} rows={3} placeholder="Alasan penolakan..." className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-200 outline-none resize-none" required />
                    </div>
                    {rejectModal?.type === 'bimbingan' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">File Revisi (Wajib)</label>
                            <input type="file" accept=".pdf" onChange={e => setRejectFile(e.target.files?.[0] || null)} required className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                            <p className="mt-1 text-xs text-gray-500">Maksimal ukuran file 10MB (PDF).</p>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => { setRejectModal(null); setRejectCatatan(''); setRejectFile(null); }}>Batal</Button>
                        <Button variant="danger" onClick={() => rejectModal?.type === 'pembimbing' ? handleRejectPembimbing() : handleReject(rejectModal.id)} disabled={rejectModal?.type === 'bimbingan' && !rejectFile}>Tolak</Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}