import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge, Avatar, EmptyState, Card, Modal } from '@/Components/UI';

interface User { name: string; }
interface Mahasiswa { id: string; nim: string; user: User; }
interface Tahapan { id: string; nama_tahapan: string; }
interface DosenData { id: string; user: User; }
interface Penguji {
    id: string;
    urutan: number;
    dosen: DosenData;
    penguji_acc: 'pending' | 'accepted' | 'rejected';
    penguji_acc_catatan?: string | null;
}
interface Ruangan { id: string; nama: string; }
interface Jadwal { tanggal: string; jam_mulai: string; jam_selesai: string; ruangan: Ruangan; }
interface PengajuanUjian {
    id: string;
    status: string;
    mahasiswa: Mahasiswa;
    tahapan: Tahapan;
    penguji: Penguji[];
    jadwal: Jadwal | null;
    my_penguji_acc: 'pending' | 'accepted' | 'rejected' | null;
    my_penguji_id: string | null;
}
interface Props {
    jadwalUjian: PengajuanUjian[];
    pendingKonfirmasi?: PengajuanUjian[];
    [key: string]: any;
}

export default function Index({ jadwalUjian = [], pendingKonfirmasi = [] }: Props) {
    const { flash } = usePage().props as any;
    const [rejectModal, setRejectModal] = useState<{ ujianId: string; pengujiId: string } | null>(null);
    const [rejectCatatan, setRejectCatatan] = useState('');

    const statusColor = (s: string) => ({
        submitted: 'blue', menunggu_penguji: 'yellow', reviewed: 'orange',
        approved: 'green', rejected: 'red', selesai: 'purple'
    }[s] || 'gray');

    const statusLabel = (s: string) => ({
        submitted: 'Diajukan', menunggu_penguji: 'Menunggu Konfirmasi Penguji',
        reviewed: 'Menunggu ACC Kaprodi', approved: 'Disetujui', rejected: 'Ditolak', selesai: 'Selesai'
    }[s] || s);

    const handleAccept = (pengujiId: string) => {
        router.post(route('dosen.penguji.accept', pengujiId), {}, {
            preserveScroll: true,
        });
    };

    const handleReject = () => {
        if (!rejectModal) return;
        router.post(route('dosen.penguji.reject', rejectModal.pengujiId), { catatan: rejectCatatan }, {
            preserveScroll: true,
            onSuccess: () => { setRejectModal(null); setRejectCatatan(''); },
        });
    };

    const accBadge = (acc: string | null) => {
        if (acc === 'accepted') return { bg: 'rgba(34,197,94,0.10)', color: '#15803d', label: 'Diterima', icon: '✓' };
        if (acc === 'rejected') return { bg: 'rgba(239,68,68,0.10)', color: '#b91c1c', label: 'Ditolak', icon: '✕' };
        return { bg: 'rgba(251,183,38,0.12)', color: '#92400e', label: 'Menunggu Konfirmasi', icon: '○' };
    };

    return (
        <AppLayout title="Jadwal Ujian">
            <PageHeader
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Jadwal Ujian' }]}
            />

            {/* Flash Messages */}
            {flash?.success && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
                    style={{ background: 'rgba(34,197,94,0.10)', color: '#15803d', border: '1px solid rgba(34,197,94,0.20)' }}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
                    style={{ background: 'rgba(239,68,68,0.09)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.18)' }}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {flash.error}
                </div>
            )}

            {/* ── Pending Konfirmasi Banner ── */}
            {pendingKonfirmasi.length > 0 && (
                <div
                    className="rounded-2xl p-4 mb-6"
                    style={{ background: 'rgba(251,183,38,0.08)', border: '1px solid rgba(251,183,38,0.30)' }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5" style={{ color: '#92400e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-sm font-bold" style={{ color: '#92400e' }}>
                            {pendingKonfirmasi.length} Penugasan Penguji Menunggu Konfirmasi Anda
                        </h3>
                    </div>
                    <p className="text-xs mb-3" style={{ color: '#78350f' }}>
                        Admin telah menugaskan Anda sebagai penguji. Harap konfirmasi kesediaan Anda untuk setiap penugasan berikut:
                    </p>
                    <div className="space-y-2">
                        {pendingKonfirmasi.map(u => (
                            <div
                                key={u.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-white"
                                style={{ border: '1px solid rgba(251,183,38,0.20)' }}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar name={u.mahasiswa?.user?.name || 'M'} size="sm" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{u.mahasiswa?.user?.name}</p>
                                        <p className="text-xs text-gray-400">{u.tahapan?.nama_tahapan} · {u.mahasiswa?.nim}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => u.my_penguji_id && handleAccept(u.my_penguji_id)}
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                                        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Terima
                                    </button>
                                    <button
                                        onClick={() => u.my_penguji_id && setRejectModal({ ujianId: u.id, pengujiId: u.my_penguji_id })}
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                                        style={{ background: 'rgba(239,68,68,0.10)', color: '#b91c1c' }}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Tolak
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Main List ── */}
            {jadwalUjian.length === 0 ? (
                <Card><EmptyState
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    title="Belum ada jadwal ujian"
                    description="Anda belum memiliki jadwal ujian sebagai penguji"
                /></Card>
            ) : (
                <div className="space-y-4">
                    {jadwalUjian.map(u => {
                        const myAcc = accBadge(u.my_penguji_acc);
                        return (
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
                                        <div className="flex items-center gap-2 flex-wrap justify-end">
                                            {/* Status konfirmasi dosen ini */}
                                            <span
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                                                style={{ background: myAcc.bg, color: myAcc.color }}
                                            >
                                                {myAcc.icon} {myAcc.label}
                                            </span>
                                            <Badge color={statusColor(u.status) as any} dot>{statusLabel(u.status)}</Badge>
                                        </div>
                                    </div>

                                    {/* Confirm actions for pending */}
                                    {u.my_penguji_acc === 'pending' && u.my_penguji_id && (
                                        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(251,183,38,0.06)', border: '1px solid rgba(251,183,38,0.20)' }}>
                                            <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#92400e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-xs flex-1" style={{ color: '#78350f' }}>Harap konfirmasi kesediaan Anda sebagai penguji ujian ini.</p>
                                            <button
                                                onClick={() => handleAccept(u.my_penguji_id!)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                                                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Terima
                                            </button>
                                            <button
                                                onClick={() => setRejectModal({ ujianId: u.id, pengujiId: u.my_penguji_id! })}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                                                style={{ background: 'rgba(239,68,68,0.10)', color: '#b91c1c' }}
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Tolak
                                            </button>
                                        </div>
                                    )}

                                    {/* Jadwal */}
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

                                    {/* Tim Penguji + status acc masing-masing */}
                                    {u.penguji?.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-50">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tim Penguji</p>
                                            <div className="flex flex-wrap gap-2">
                                                {u.penguji.map(p => {
                                                    const pAcc = accBadge(p.penguji_acc);
                                                    return (
                                                        <div key={p.id} className="flex items-center gap-2 bg-indigo-50/70 rounded-xl px-3 py-1.5">
                                                            <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">{p.urutan}</div>
                                                            <span className="text-sm text-indigo-700 font-medium">{p.dosen?.user?.name}</span>
                                                            <span
                                                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                                                style={{ background: pAcc.bg, color: pAcc.color }}
                                                            >
                                                                {pAcc.icon} {pAcc.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Modal Tolak Penguji ── */}
            <Modal show={!!rejectModal} onClose={() => { setRejectModal(null); setRejectCatatan(''); }} title="Tolak Penugasan Penguji" maxWidth="max-w-md">
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}>
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-red-700">
                            Dengan menolak, Admin akan diberitahu dan harus menunjuk penguji pengganti. Status pengajuan ujian akan dikembalikan ke Admin.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alasan Penolakan (opsional)</label>
                        <textarea
                            value={rejectCatatan}
                            onChange={e => setRejectCatatan(e.target.value)}
                            rows={3}
                            placeholder="Jelaskan alasan tidak dapat menjadi penguji..."
                            className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 outline-none resize-none"
                            style={{ borderColor: 'rgba(0,0,0,0.12)' }}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                        <button onClick={() => { setRejectModal(null); setRejectCatatan(''); }} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100">
                            Batal
                        </button>
                        <button
                            onClick={handleReject}
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                        >
                            Konfirmasi Tolak
                        </button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}