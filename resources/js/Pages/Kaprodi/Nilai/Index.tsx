import { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, PageHeader, FlashMessage, Badge, Avatar, EmptyState, Card } from '@/Components/UI';

interface Penguji  { id: string; urutan: number; dosen: { nama: string }; }
interface Penilaian { id: string; nilai: number; status_hasil: string; catatan: string | null; dinilai_at: string; penguji: { urutan: number; dosen: { nama: string } } | null; }
interface Jadwal    { tanggal: string; jam_mulai: string; jam_selesai: string; ruangan: { nama: string } | null; }
interface Approval  { id: string; status: string; catatan: string | null; approved_at: string; }

interface PengajuanUjian {
    id: string;
    status: string;
    keterangan: string | null;
    submitted_at: string;
    all_nilai_submitted: boolean;
    has_approval: boolean;
    rata_nilai: number | null;
    mahasiswa: { id: string; nim: string; nama: string; prodi: string };
    tahapan: { id: string; nama_tahapan: string } | null;
    penguji: Penguji[];
    jadwal: Jadwal | null;
    penilaian: Penilaian[];
    approvals: Approval[];
}

interface Props { pengajuanUjian: PengajuanUjian[]; [key: string]: any; }

export default function Index({ pengajuanUjian }: Props) {
    const { flash } = usePage().props as any;

    const [actionId, setActionId] = useState<string | null>(null);
    const [actionStatus, setActionStatus] = useState<'approved' | 'rejected'>('approved');
    const form = useForm({ status: 'approved' as 'approved' | 'rejected', catatan: '' });

    const openAction = (id: string, status: 'approved' | 'rejected') => {
        setActionId(id);
        setActionStatus(status);
        form.setData({ status, catatan: '' });
    };

    const submitAction = (ujianId: string) => {
        form.post(route('kaprodi.nilai.approve', ujianId), {
            onSuccess: () => { setActionId(null); form.reset(); },
        });
    };

    const hasilColor  = (h: string) => ({ lulus: 'green', revisi: 'yellow', ngulang: 'red' }[h] || 'gray') as any;
    const hasilLabel  = (h: string) => ({ lulus: 'Lulus', revisi: 'Perlu Revisi', ngulang: 'Mengulang' }[h] || h);
    const statusColor = (s: string) => ({ reviewed: 'yellow', approved: 'green', selesai: 'purple' }[s] || 'gray') as any;
    const statusLabel = (s: string) => ({ reviewed: 'Menunggu Approval', approved: 'Disetujui', selesai: 'Selesai' }[s] || s);

    // Pisah: menunggu approval vs sudah selesai
    const menunggu = pengajuanUjian.filter(u => !u.has_approval && u.all_nilai_submitted);
    const belumLengkap = pengajuanUjian.filter(u => !u.has_approval && !u.all_nilai_submitted);
    const sudahApproved = pengajuanUjian.filter(u => u.has_approval);

    const renderCard = (u: PengajuanUjian, isApproved: boolean) => (
        <div
            key={u.id}
            className="bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-md"
            style={{ borderColor: isApproved ? 'rgba(34,197,94,0.15)' : u.all_nilai_submitted ? 'rgba(232,80,10,0.15)' : 'rgba(0,0,0,0.07)' }}
        >
            {/* Accent bar */}
            <div
                className="h-[3px]"
                style={{
                    background: isApproved
                        ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                        : u.all_nilai_submitted
                        ? 'linear-gradient(90deg,#E8500A,#FBB726)'
                        : 'linear-gradient(90deg,#94a3b8,#cbd5e1)',
                }}
            />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Avatar name={u.mahasiswa.nama} size="md" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                                    {u.tahapan?.nama_tahapan || 'Ujian'}
                                </span>
                                <span className="text-xs text-gray-400">{u.mahasiswa.prodi}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900">{u.mahasiswa.nama}</h3>
                            <p className="text-sm text-gray-400 font-mono">{u.mahasiswa.nim}</p>
                            {u.jadwal && (
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {new Date(u.jadwal.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    &nbsp;{u.jadwal.jam_mulai}–{u.jadwal.jam_selesai}
                                    {u.jadwal.ruangan && <>&nbsp;· {u.jadwal.ruangan.nama}</>}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Rata-rata nilai badge */}
                    {u.rata_nilai !== null && (
                        <div
                            className="flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white shadow-sm"
                            style={{ background: 'linear-gradient(135deg,#E8500A,#F0820A)' }}
                        >
                            <span className="text-[11px] font-semibold opacity-80">Rata</span>
                            <span className="text-lg font-bold leading-tight">{u.rata_nilai}</span>
                        </div>
                    )}
                </div>

                {/* Penilaian per penguji */}
                {u.penilaian.length > 0 && (
                    <div className="mb-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Detail Penilaian</p>
                        <div className="space-y-1.5">
                            {u.penilaian.map((n, i) => (
                                <div
                                    key={n.id}
                                    className="flex items-center justify-between px-3 py-2 rounded-xl"
                                    style={{ background: 'rgba(0,0,0,0.025)' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                            {n.penguji?.urutan ?? i + 1}
                                        </span>
                                        <span className="text-sm text-gray-700">{n.penguji?.dosen?.nama ?? '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-800">{n.nilai}</span>
                                        <Badge color={hasilColor(n.status_hasil)}>{hasilLabel(n.status_hasil)}</Badge>
                                        {n.catatan && (
                                            <span className="text-xs text-gray-400 max-w-[160px] truncate italic">"{n.catatan}"</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Status nilai belum lengkap */}
                {!u.all_nilai_submitted && !isApproved && (
                    <div
                        className="mb-3 px-3 py-2 rounded-xl flex items-center gap-2 text-xs"
                        style={{ background: 'rgba(251,183,38,0.10)', border: '1px solid rgba(251,183,38,0.25)', color: '#92400e' }}
                    >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Belum semua penguji mengisi nilai ({u.penilaian.length}/{u.penguji.length} penguji)
                    </div>
                )}

                {/* Approved banner */}
                {isApproved && u.approvals[0] && (
                    <div
                        className="mb-3 px-3 py-2.5 rounded-xl flex items-center gap-2"
                        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.20)' }}
                    >
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-green-700">
                            <strong>{u.approvals[0].status === 'approved' ? 'Disetujui' : 'Ditolak'}</strong>
                            {' '}pada {new Date(u.approvals[0].approved_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {u.approvals[0].catatan && <span className="italic"> · "{u.approvals[0].catatan}"</span>}
                        </span>
                    </div>
                )}

                {/* Action Buttons */}
                {!isApproved && u.all_nilai_submitted && (
                    <div className="pt-3 border-t border-gray-50">
                        {actionId === u.id ? (
                            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(232,80,10,0.04)', border: '1px solid rgba(232,80,10,0.12)' }}>
                                <input
                                    type="text"
                                    value={form.data.catatan}
                                    onChange={e => form.setData('catatan', e.target.value)}
                                    placeholder="Catatan (opsional)..."
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none"
                                    style={{ borderColor: 'rgba(0,0,0,0.12)' }}
                                />
                                <Button
                                    size="sm"
                                    variant={actionStatus === 'approved' ? 'success' : 'danger'}
                                    onClick={() => submitAction(u.id)}
                                    disabled={form.processing}
                                >
                                    {form.processing ? 'Memproses...' : actionStatus === 'approved' ? 'Setujui' : 'Tolak'}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setActionId(null); form.reset(); }}>
                                    Batal
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => openAction(u.id, 'approved')}
                                    icon={
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                >
                                    Setujui Penilaian
                                </Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => openAction(u.id, 'rejected')}
                                    icon={
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    }
                                >
                                    Tolak
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <AppLayout title="Persetujuan Nilai">
            <PageHeader
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Persetujuan Nilai' },
                ]}
            />
            <FlashMessage message={flash?.success} type="success" />
            {flash?.error && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {flash.error}
                </div>
            )}

            {pengajuanUjian.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        }
                        title="Belum ada penilaian untuk disetujui"
                        description="Penilaian akan muncul di sini setelah ujian selesai dilaksanakan dan penguji mengisi nilai"
                    />
                </Card>
            ) : (
                <div className="space-y-6">

                    {/* ── Menunggu Persetujuan ── */}
                    {menunggu.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <span
                                    className="w-2 h-2 rounded-full animate-pulse"
                                    style={{ background: '#E8500A' }}
                                />
                                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Menunggu Persetujuan
                                </h2>
                                <span
                                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                                    style={{ background: 'rgba(232,80,10,0.10)', color: '#E8500A' }}
                                >
                                    {menunggu.length}
                                </span>
                            </div>
                            <div className="space-y-4">
                                {menunggu.map(u => renderCard(u, false))}
                            </div>
                        </section>
                    )}

                    {/* ── Nilai Belum Lengkap ── */}
                    {belumLengkap.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Nilai Belum Lengkap
                                </h2>
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600">
                                    {belumLengkap.length}
                                </span>
                            </div>
                            <div className="space-y-4">
                                {belumLengkap.map(u => renderCard(u, false))}
                            </div>
                        </section>
                    )}

                    {/* ── Sudah Disetujui ── */}
                    {sudahApproved.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Sudah Diproses
                                </h2>
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-600">
                                    {sudahApproved.length}
                                </span>
                            </div>
                            <div className="space-y-4">
                                {sudahApproved.map(u => renderCard(u, true))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
