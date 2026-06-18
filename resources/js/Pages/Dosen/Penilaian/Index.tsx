import { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

interface Penilaian { id: string; komponen: string; nilai: number; catatan: string | null; status_hasil: string; dinilai_at: string; }
interface Tahapan { id: string; nama_tahapan: string; tipe: string; }
interface Ruangan { id: string; nama: string; }
interface Jadwal { id: string; tanggal: string; jam_mulai: string; jam_selesai: string; ruangan: Ruangan; }
interface Dosen { id: string; nama: string; }
interface PengujiItem { id: string; urutan: number; dosen: Dosen; }
interface MahasiswaUser { name: string; }
interface Mahasiswa { id: string; nim: string; nama: string; user: MahasiswaUser; }
interface PengajuanUjian { id: string; status: string; keterangan: string | null; tahapan: Tahapan; jadwal: Jadwal | null; mahasiswa: Mahasiswa; penguji: PengujiItem[]; }
interface PengujiAssignment { id: string; pengajuanUjian: PengajuanUjian; penilaian: Penilaian | null; is_nilai_locked: boolean; }
interface Props { pengujiAssignments: PengujiAssignment[]; [key: string]: any; }

export default function Index({ pengujiAssignments }: Props) {
    const { flash } = usePage().props as any;
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState<string | null>(null); // penguji assignment id

    const { data, setData, post, processing, reset } = useForm({
        penguji_id: '',
        pengajuan_ujian_id: '',
        status_hasil: 'lulus',
        nilai: '',
        catatan: '',
    });

    const openForm = (pa: PengujiAssignment) => {
        setData({
            penguji_id: pa.id,
            pengajuan_ujian_id: pa.pengajuanUjian.id,
            status_hasil: pa.penilaian?.status_hasil || 'lulus',
            nilai: pa.penilaian?.nilai?.toString() || '',
            catatan: pa.penilaian?.catatan || '',
        });
        setShowForm(pa.id);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dosen.penilaian.store'), {
            onSuccess: () => { setShowForm(null); reset(); },
        });
    };

    const statusHasilStyle = (s: string) => ({
        lulus: { bg: 'rgba(34,197,94,0.10)', text: '#15803d', label: 'Lulus' },
        revisi: { bg: 'rgba(251,183,38,0.12)', text: '#92400e', label: 'Revisi' },
        ngulang: { bg: 'rgba(239,68,68,0.10)', text: '#b91c1c', label: 'Mengulang' },
    }[s] || { bg: 'rgba(0,0,0,0.06)', text: '#555', label: s });

    const ujianStatusStyle = (s: string) => ({
        submitted: { bg: 'rgba(59,130,246,0.10)', text: '#1d4ed8', label: 'Menunggu' },
        scheduled: { bg: 'rgba(251,183,38,0.12)', text: '#92400e', label: 'Terjadwal' },
        selesai: { bg: 'rgba(34,197,94,0.10)', text: '#15803d', label: 'Selesai' },
        approved: { bg: 'rgba(34,197,94,0.10)', text: '#15803d', label: 'Selesai' },
    }[s] || { bg: 'rgba(0,0,0,0.06)', text: '#555', label: s });

    return (
        <AppLayout title="Penilaian Ujian">
            <div className="  mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#E8500A' }}>Dashboard</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">Penilaian Ujian</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Penilaian Ujian</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Input nilai untuk mahasiswa yang ujian Anda perkuji</p>
                    </div>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
                        style={{ background: 'rgba(34,197,94,0.10)', color: '#15803d', border: '1px solid rgba(34,197,94,0.20)' }}>
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
                        style={{ background: 'rgba(239,68,68,0.09)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.18)' }}>
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {flash.error}
                    </div>
                )}

                {/* Empty */}
                {pengujiAssignments.length === 0 ? (
                    <div className="rounded-2xl p-10 text-center" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)' }}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(232,80,10,0.08)' }}>
                            <svg className="w-8 h-8" style={{ color: '#E8500A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-800 text-base mb-1">Belum ada penugasan ujian</h3>
                        <p className="text-sm text-gray-400">Anda belum ditugaskan sebagai penguji ujian</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pengujiAssignments.map(pa => {
                            const ujian = pa.pengajuanUjian;
                            const isOpen = activeId === pa.id;
                            const us = ujianStatusStyle(ujian.status);
                            const hs = pa.penilaian ? statusHasilStyle(pa.penilaian.status_hasil) : null;

                            return (
                                <div key={pa.id} className="rounded-2xl overflow-hidden transition-all duration-300"
                                    style={{ background: 'white', border: isOpen ? '1px solid rgba(232,80,10,0.25)' : '1px solid rgba(0,0,0,0.07)', boxShadow: isOpen ? '0 4px 20px rgba(232,80,10,0.08)' : 'none' }}>
                                    {isOpen && <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #E8500A, #FBB726)' }} />}

                                    {/* Header */}
                                    <div className="p-5 cursor-pointer transition-colors"
                                        style={{ background: isOpen ? 'rgba(232,80,10,0.02)' : 'transparent' }}
                                        onClick={() => setActiveId(isOpen ? null : pa.id)}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                                                    style={{ background: 'rgba(232,80,10,0.10)', color: '#E8500A' }}>
                                                    P{pa.id === ujian.penguji?.[0]?.id ? '1' : '2'}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-[14px]">
                                                        {ujian.mahasiswa?.nama || ujian.mahasiswa?.user?.name || '-'}
                                                        <span className="text-gray-400 font-normal text-xs ml-2">({ujian.mahasiswa?.nim || '-'})</span>
                                                    </h3>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                                        {ujian.tahapan?.nama_tahapan || '-'}
                                                        {ujian.jadwal && (
                                                            <span className="ml-2">
                                                                • {new Date(ujian.jadwal.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                {' '}{ujian.jadwal.jam_mulai?.substring(0, 5)} - {ujian.jadwal.jam_selesai?.substring(0, 5)}
                                                                {ujian.jadwal.ruangan && ` • ${ujian.jadwal.ruangan.nama}`}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                {hs ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                                                        style={{ background: hs.bg, color: hs.text }}>
                                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: hs.text }} />
                                                        {hs.label} — Nilai: {pa.penilaian?.nilai}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                                                        style={{ background: us.bg, color: us.text }}>
                                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: us.text }} />
                                                        {ujian.status === 'scheduled' ? 'Belum Dinilai' : us.label}
                                                    </span>
                                                )}
                                                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isOpen && (
                                        <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(232,80,10,0.08)' }}>
                                            {/* Detail */}
                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <div className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.025)' }}>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tahapan</p>
                                                    <p className="text-sm font-medium text-gray-800">{ujian.tahapan?.nama_tahapan || '-'}</p>
                                                </div>
                                                <div className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.025)' }}>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Jadwal</p>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {ujian.jadwal
                                                            ? `${new Date(ujian.jadwal.tanggal).toLocaleDateString('id-ID')} ${ujian.jadwal.jam_mulai?.substring(0, 5)} - ${ujian.jadwal.jam_selesai?.substring(0, 5)}`
                                                            : 'Belum dijadwalkan'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Penguji List */}
                                            <div className="mt-4">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tim Penguji</p>
                                                <div className="space-y-1.5">
                                                    {ujian.penguji?.map(px => (
                                                        <div key={px.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.025)' }}>
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                                                                    style={{ background: 'rgba(232,80,10,0.10)', color: '#E8500A' }}>P{px.urutan}</span>
                                                                <span className="text-[13px] text-gray-700">{px.dosen?.nama || '-'}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Existing Penilaian */}
                                            {pa.penilaian && (
                                                <div className="mt-4 p-3 rounded-xl" style={{ background: hs ? hs.bg : 'rgba(0,0,0,0.03)' }}>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Penilaian Anda</p>
                                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                                        <div>
                                                            <span className="text-gray-500 text-xs">Nilai</span>
                                                            <p className="font-bold" style={{ color: hs?.text }}>{pa.penilaian.nilai}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 text-xs">Status</span>
                                                            <p className="font-bold" style={{ color: hs?.text }}>{hs?.label}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 text-xs">Catatan</span>
                                                            <p className="text-gray-700">{pa.penilaian.catatan || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action */}
                                            <div className="mt-4 flex justify-end">
                                                {pa.is_nilai_locked ? (
                                                    // ── LOCKED: sudah di-approve kaprodi ──
                                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                                                        style={{ background: 'rgba(34,197,94,0.08)', color: '#15803d', border: '1px solid rgba(34,197,94,0.20)' }}>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                        Penilaian dikunci — sudah disetujui Kaprodi
                                                    </div>
                                                ) : ujian.status !== 'approved' && ujian.status !== 'selesai' ? (
                                                    // ── BLOCKED: ujian belum disetujui Kaprodi ──
                                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-50 border border-gray-200 text-gray-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                        {ujian.status === 'reviewed' ? 'Menunggu ACC Ujian dari Kaprodi' : 'Ujian Belum Disetujui'}
                                                    </div>
                                                ) : (
                                                    <button onClick={() => openForm(pa)}
                                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                                                        style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }}>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        {pa.penilaian ? 'Update Penilaian' : 'Input Penilaian'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,15,15,0.55)', backdropFilter: 'blur(4px)' }}
                        onClick={e => { if (e.target === e.currentTarget) { setShowForm(null); reset(); } }}>
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                            <div className="p-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Form Penilaian</h2>
                                        <p className="text-sm text-gray-400 mt-0.5">Input nilai ujian mahasiswa</p>
                                    </div>
                                    <button onClick={() => { setShowForm(null); reset(); }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                {/* Nilai */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nilai (0-100)</label>
                                    <input type="number" min="0" max="100" step="0.1" value={data.nilai} onChange={e => setData('nilai', e.target.value)} required
                                        className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 outline-none transition-all"
                                        style={{ borderColor: 'rgba(0,0,0,0.12)' }}
                                        onFocus={e => { e.currentTarget.style.borderColor = '#E8500A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,80,10,0.12)'; }}
                                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                                        placeholder="Masukkan nilai" />
                                </div>

                                {/* Status Hasil */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status Hasil</label>
                                    <select value={data.status_hasil} onChange={e => setData('status_hasil', e.target.value)} required
                                        className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 outline-none transition-all"
                                        style={{ borderColor: 'rgba(0,0,0,0.12)' }}
                                        onFocus={e => { e.currentTarget.style.borderColor = '#E8500A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,80,10,0.12)'; }}
                                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                        <option value="lulus">Lulus (tanpa revisi)</option>
                                        <option value="revisi">Revisi (perlu perbaikan)</option>
                                        <option value="ngulang">Mengulang</option>
                                    </select>
                                </div>

                                {/* Catatan */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catatan</label>
                                    <textarea value={data.catatan} onChange={e => setData('catatan', e.target.value)} rows={3}
                                        className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 outline-none transition-all resize-none"
                                        style={{ borderColor: 'rgba(0,0,0,0.12)' }}
                                        onFocus={e => { e.currentTarget.style.borderColor = '#E8500A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,80,10,0.12)'; }}
                                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                                        placeholder="Catatan penilaian..." />
                                </div>

                                <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                    <button type="button" onClick={() => { setShowForm(null); reset(); }}
                                        className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100">Batal</button>
                                    <button type="submit" disabled={processing}
                                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }}>
                                        {processing ? 'Menyimpan...' : 'Simpan Penilaian'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}