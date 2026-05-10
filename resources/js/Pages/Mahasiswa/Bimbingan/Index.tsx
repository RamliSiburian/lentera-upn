import { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Modal, Button, Select, PageHeader, FlashMessage, Badge, EmptyState, Card } from '@/Components/UI';

interface TahapanConfig { id: string; nama: string; nama_tahapan: string; urutan: number; tipe: string; }
interface BimbinganFile { id: string; nama_file: string; path_file: string; }
interface Approval { id: string; status: string; catatan: string | null; pembimbing: { urutan: number; dosen: { nama: string } }; }
interface Komentar { id: string; komentar: string; created_at: string; user: { name: string; role: string }; }
interface Bimbingan { id: string; tipe: string; status: string; catatan_mhs: string | null; versi: number; created_at: string; tahapan_config: TahapanConfig; files: BimbinganFile[]; approvals: Approval[]; komentar: Komentar[]; }
interface PembimbingData { id: string; urutan: number; dosen: { id: string; nama: string; nidn: string }; }
interface JudulData { id: string; judul: string; pembimbing: PembimbingData[]; }
interface Props { bimbingans: Bimbingan[]; judul: JudulData | null; tahapanList: TahapanConfig[]; canCreateBimbingan: boolean; nextTipe: string; [key: string]: any; }

// ─── FIK UPNVJ Color Tokens ──────────────────────────────────────────────────
// Primary orange : #E8500A
// Orange light   : #F0820A
// Gold accent    : #FBB726
// Dark bg        : #1A1A1A
// Surface        : #F5F3EE
// ─────────────────────────────────────────────────────────────────────────────

export default function Index({ bimbingans, judul, tahapanList, canCreateBimbingan, nextTipe }: Props) {    
    const { flash } = usePage().props as any;
    const [showForm, setShowForm] = useState(false);
    const [activeBimbingan, setActiveBimbingan] = useState<string | null>(null);
    const [komentarText, setKomentarText] = useState<Record<string, string>>({});

    const { data, setData, post, processing, reset } = useForm({
        judul_pengajuan_id: judul?.id || '',
        tahapan_config_id: '',
        catatan_mhs: '',
        file: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('mahasiswa.bimbingan.store'), {
            onSuccess: () => { reset(); setShowForm(false); },
            forceFormData: true,
        });
    };

    const handleAddKomentar = (bimbinganId: string) => {
        const komentar = komentarText[bimbinganId];
        if (!komentar) return;
        router.post(route('mahasiswa.bimbingan.komentar', bimbinganId), { komentar }, {
            onSuccess: () => setKomentarText(prev => ({ ...prev, [bimbinganId]: '' })),
        });
    };

    // Status helpers — mapped to FIK orange palette
    const statusStyle = (s: string): { bg: string; text: string; dot: string } => ({
        submitted:            { bg: 'rgba(59,130,246,0.10)',  text: '#1d4ed8', dot: '#3b82f6'  },
        diajukan:             { bg: 'rgba(59,130,246,0.10)',  text: '#1d4ed8', dot: '#3b82f6'  },
        acc_pembimbing1:      { bg: 'rgba(251,183,38,0.12)',  text: '#92400e', dot: '#FBB726'  },
        acc_semua_pembimbing: { bg: 'rgba(34,197,94,0.10)',   text: '#15803d', dot: '#22c55e'  },
        approved:             { bg: 'rgba(34,197,94,0.10)',   text: '#15803d', dot: '#22c55e'  },
        revisi:               { bg: 'rgba(251,183,38,0.12)',  text: '#92400e', dot: '#FBB726'  },
        ditolak:              { bg: 'rgba(239,68,68,0.10)',   text: '#b91c1c', dot: '#ef4444'  },
        rejected:             { bg: 'rgba(239,68,68,0.10)',   text: '#b91c1c', dot: '#ef4444'  },
    }[s] || { bg: 'rgba(0,0,0,0.06)', text: '#555', dot: '#aaa' });

    const statusLabel = (s: string) => ({
        submitted:            'Menunggu Review',
        diajukan:             'Menunggu Review',
        acc_pembimbing1:      'ACC Pembimbing 1',
        acc_semua_pembimbing: 'Selesai',
        approved:             'Selesai',
        revisi:               'Perlu Revisi',
        ditolak:              'Ditolak',
        rejected:             'Ditolak',
    }[s] || s);

    const approvalStyle = (s: string) => ({
        acc:      { bg: 'rgba(34,197,94,0.10)',  text: '#15803d', icon: '✓' },
        approved: { bg: 'rgba(34,197,94,0.10)',  text: '#15803d', icon: '✓' },
        revisi:   { bg: 'rgba(251,183,38,0.12)', text: '#92400e', icon: '↻' },
        ditolak:  { bg: 'rgba(239,68,68,0.10)',  text: '#b91c1c', icon: '✕' },
        rejected: { bg: 'rgba(239,68,68,0.10)',  text: '#b91c1c', icon: '✕' },
    }[s] || { bg: 'rgba(0,0,0,0.06)', text: '#777', icon: '○' });

    return (
        <AppLayout title="Bimbingan Skripsi">
            {/* ── Page Header ── */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#E8500A' }}>
                            Dashboard
                        </span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">Bimbingan</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Bimbingan Skripsi</h1>
                    <p className="text-sm text-gray-400 mt-0.5 max-w-lg truncate">
                        {judul?.judul || 'Kelola bimbingan skripsi Anda'}
                    </p>
                </div>
                {canCreateBimbingan && judul && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Bimbingan Baru
                    </button>
                )}
            </div>

            {/* ── Flash Message ── */}
            {flash?.success && (
                <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
                    style={{ background: 'rgba(34,197,94,0.10)', color: '#15803d', border: '1px solid rgba(34,197,94,0.20)' }}
                >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {flash.success}
                </div>
            )}

            {/* ── No Judul State ── */}
            {!judul ? (
                <div
                    className="rounded-2xl p-10 text-center"
                    style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)' }}
                >
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'rgba(232,80,10,0.08)' }}
                    >
                        <svg className="w-8 h-8" style={{ color: '#E8500A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-gray-800 text-base mb-1">Belum ada judul disetujui</h3>
                    <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto">
                        Anda belum memiliki judul yang disetujui dengan pembimbing. Silakan ajukan judul terlebih dahulu.
                    </p>
                    <button
                        onClick={() => router.visit(route('mahasiswa.judul.index'))}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }}
                    >
                        Ajukan Judul
                    </button>
                </div>
            ) : (
                <>
                    {/* ── Form Modal ── */}
                    <Modal show={showForm} onClose={() => setShowForm(false)} title={nextTipe === 'revisi' ? 'Upload Revisi' : 'Buat Bimbingan Baru'} maxWidth="max-w-lg">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Tipe Indicator */}
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: nextTipe === 'revisi' ? 'rgba(251,183,38,0.10)' : 'rgba(232,80,10,0.08)' }}>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${nextTipe === 'revisi' ? 'bg-amber-200 text-amber-800' : 'bg-orange-200 text-orange-800'}`}>
                                    {nextTipe === 'revisi' ? 'REVISI' : 'BIMBINGAN'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {nextTipe === 'revisi' ? 'Upload perbaikan dari bimbingan sebelumnya' : 'Upload laporan bimbingan baru'}
                                </span>
                            </div>

                            {/* Tahapan Select */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tahapan</label>
                                <select
                                    value={data.tahapan_config_id}
                                    onChange={e => setData('tahapan_config_id', e.target.value)}
                                    required
                                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 outline-none transition-all"
                                    style={{ borderColor: 'rgba(0,0,0,0.12)' }}
                                    onFocus={e => { e.currentTarget.style.borderColor = '#E8500A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,80,10,0.12)'; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <option value="">Pilih Tahapan</option>
                                    {tahapanList.map(t => <option key={t.id} value={t.id}>{t.nama_tahapan}</option>)}
                                </select>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Upload File PDF</label>
                                <div
                                    className="rounded-xl p-6 text-center transition-colors cursor-pointer"
                                    style={{ border: '2px dashed rgba(232,80,10,0.25)', background: 'rgba(232,80,10,0.03)' }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,80,10,0.5)')}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(232,80,10,0.25)')}
                                >
                                    <input type="file" accept=".pdf" onChange={e => setData('file', e.target.files?.[0] || null)} className="hidden" id="file-upload" required />
                                    <label htmlFor="file-upload" className="cursor-pointer block">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                                            style={{ background: 'rgba(232,80,10,0.10)' }}
                                        >
                                            <svg className="w-5 h-5" style={{ color: '#E8500A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">
                                            {data.file ? data.file.name : 'Klik untuk upload file PDF'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Format PDF</p>
                                    </label>
                                </div>
                            </div>

                            {/* Catatan */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catatan</label>
                                <textarea
                                    value={data.catatan_mhs}
                                    onChange={e => setData('catatan_mhs', e.target.value)}
                                    rows={3}
                                    placeholder="Catatan untuk pembimbing..."
                                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 outline-none transition-all resize-none"
                                    style={{ borderColor: 'rgba(0,0,0,0.12)' }}
                                    onFocus={e => { e.currentTarget.style.borderColor = '#E8500A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,80,10,0.12)'; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }}
                                >
                                    {processing ? 'Mengupload...' : 'Upload Bimbingan'}
                                </button>
                            </div>
                        </form>
                    </Modal>

                    {/* ── Empty State ── */}
                    {bimbingans.length === 0 ? (
                        <div
                            className="rounded-2xl p-10 text-center"
                            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)' }}
                        >
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                style={{ background: 'rgba(232,80,10,0.08)' }}
                            >
                                <svg className="w-8 h-8" style={{ color: '#E8500A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-800 text-base mb-1">Belum ada bimbingan</h3>
                            <p className="text-sm text-gray-400 mb-5">Mulai bimbingan pertama Anda dengan mengupload laporan</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                                style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }}
                            >
                                Buat Bimbingan
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {bimbingans.map(b => {
                                const st = statusStyle(b.status);
                                const isOpen = activeBimbingan === b.id;

                                return (
                                    <div
                                        key={b.id}
                                        className="rounded-2xl overflow-hidden transition-all duration-300"
                                        style={{
                                            background: 'white',
                                            border: isOpen ? '1px solid rgba(232,80,10,0.25)' : '1px solid rgba(0,0,0,0.07)',
                                            boxShadow: isOpen ? '0 4px 20px rgba(232,80,10,0.08)' : 'none',
                                        }}
                                    >
                                        {/* Orange top accent when open */}
                                        {isOpen && (
                                            <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #E8500A, #FBB726)' }} />
                                        )}

                                        {/* Header */}
                                        <div
                                            className="p-5 cursor-pointer transition-colors"
                                            style={{ background: isOpen ? 'rgba(232,80,10,0.02)' : 'transparent' }}
                                            onClick={() => setActiveBimbingan(isOpen ? null : b.id)}
                                            onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(0,0,0,0.015)'; }}
                                            onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {/* Version badge */}
                                                    <div
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                                                        style={b.tipe === 'revisi'
                                                            ? { background: 'rgba(251,183,38,0.12)', color: '#92400e' }
                                                            : { background: 'rgba(232,80,10,0.10)', color: '#E8500A' }
                                                        }
                                                    >
                                                        {b.tipe === 'revisi' ? 'R' : 'B'}{b.versi}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 text-[14px]">
                                                            {b.tahapan_config?.nama}
                                                        </h3>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                                            {new Date(b.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2.5">
                                                    {/* Status pill */}
                                                    <span
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                                                        style={{ background: st.bg, color: st.text }}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                                                        {statusLabel(b.status)}
                                                    </span>

                                                    <svg
                                                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {isOpen && (
                                            <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(232,80,10,0.08)' }}>

                                                {/* Files */}
                                                <div className="mt-4">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                                        File Upload
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {b.files.map(f => (
                                                            <a
                                                                key={f.id}
                                                                href={`/storage/${f.path_file}`}
                                                                target="_blank"
                                                                className="flex items-center gap-2.5 p-2.5 rounded-xl text-sm font-medium transition-colors"
                                                                style={{ background: 'rgba(232,80,10,0.06)', color: '#E8500A' }}
                                                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,80,10,0.12)')}
                                                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(232,80,10,0.06)')}
                                                            >
                                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                </svg>
                                                                {f.nama_file}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Approvals */}
                                                <div className="mt-4">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                                        Status Approval
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {b.approvals.map(a => {
                                                            const ap = approvalStyle(a.status);
                                                            return (
                                                                <div
                                                                    key={a.id}
                                                                    className="flex items-center justify-between p-2.5 rounded-xl"
                                                                    style={{ background: 'rgba(0,0,0,0.025)' }}
                                                                >
                                                                    <div className="flex items-center gap-2.5">
                                                                        <span
                                                                            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                                            style={{ background: ap.bg, color: ap.text }}
                                                                        >
                                                                            {ap.icon}
                                                                        </span>
                                                                        <span className="text-[13px] text-gray-700">
                                                                            Pembimbing {a.pembimbing.urutan}
                                                                            <span className="text-gray-400"> · {a.pembimbing.dosen.nama}</span>
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                                                                            style={{ background: ap.bg, color: ap.text }}
                                                                        >
                                                                            {a.status || 'menunggu'}
                                                                        </span>
                                                                        {a.catatan && (
                                                                            <span className="text-[11px] text-gray-400 max-w-[180px] truncate italic">
                                                                                "{a.catatan}"
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Komentar */}
                                                <div className="mt-4">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                                        Komentar
                                                    </p>

                                                    <div className="space-y-2 mb-3 max-h-64 overflow-y-auto pr-1">
                                                        {b.komentar.length === 0 && (
                                                            <p className="text-sm text-gray-400 text-center py-4">
                                                                Belum ada komentar
                                                            </p>
                                                        )}
                                                        {b.komentar.map(k => (
                                                            <div
                                                                key={k.id}
                                                                className={`p-3 rounded-xl ${k.user.role === 'dosen' ? 'ml-4' : 'mr-4'}`}
                                                                style={{
                                                                    background: k.user.role === 'dosen'
                                                                        ? 'rgba(232,80,10,0.06)'
                                                                        : 'rgba(0,0,0,0.03)',
                                                                    borderLeft: k.user.role === 'dosen'
                                                                        ? '2px solid rgba(232,80,10,0.40)'
                                                                        : '2px solid rgba(0,0,0,0.10)',
                                                                }}
                                                            >
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span
                                                                        className="text-[11px] font-bold"
                                                                        style={{ color: k.user.role === 'dosen' ? '#E8500A' : '#555' }}
                                                                    >
                                                                        {k.user.name}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400">
                                                                        {new Date(k.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[13px] text-gray-600">{k.komentar}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Komentar input */}
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={komentarText[b.id] || ''}
                                                            onChange={e => setKomentarText(prev => ({ ...prev, [b.id]: e.target.value }))}
                                                            placeholder="Tulis komentar..."
                                                            className="flex-1 rounded-xl px-3.5 py-2 text-sm bg-gray-50 outline-none transition-all"
                                                            style={{ border: '1px solid rgba(0,0,0,0.12)' }}
                                                            onFocus={e => { e.currentTarget.style.borderColor = '#E8500A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,80,10,0.10)'; }}
                                                            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                            onKeyDown={e => { if (e.key === 'Enter') handleAddKomentar(b.id); }}
                                                        />
                                                        <button
                                                            onClick={() => handleAddKomentar(b.id)}
                                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
                                                            style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                            </svg>
                                                            Kirim
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </AppLayout>
    );
}