import { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Modal, Button, Input, Select, PageHeader, FlashMessage, Badge, EmptyState, Card, ProgressBar } from '@/Components/UI';

interface Konsentrasi { id: string; nama: string; kode: string; }
interface Dosen { id: string; nama: string; nidn: string; beban_kerja: number; active_bimbingan: number; sisa_kuota: number; }
interface Pembimbing { id: string; urutan: string; status: string; dosen: { id: string; nidn: string; user: { name: string } }; }
interface Judul {
    id: string; judul: string; deskripsi: string | null; konsentrasi_id: string;
    status: string; keterangan_tolak: string | null; catatan_admin: string | null; catatan_kaprodi: string | null;
    dokumen: string | null; dokumen_url: string | null;
    konsentrasi: Konsentrasi; pembimbing: Pembimbing[]; created_at: string;
    revision_status: string | null; alasan_revisi: string | null; catatan_revisi_kaprodi: string | null;
    revision_submitted_at: string | null; revision_reviewed_at: string | null;
}
interface Props { juduls: Judul[]; konsentrasis: Konsentrasi[]; [key: string]: any; }

const S = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    :root {
        --orange: #F26522;
        --orange-dark: #E85000;
        --orange-light: rgba(242,101,34,0.1);
        --orange-border: rgba(242,101,34,0.2);
        --black: #0f0f0f;
        --surface: #faf8f5;
        --surface-2: #f2ede6;
        --border: #e8e3dc;
        --text-1: #1a1714;
        --text-2: #6b6560;
        --text-3: #a09890;
    }

    .ju-wrap { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--surface); min-height: 100vh; }

    /* ── PAGE HEADER ── */
    .ju-header {
        background: white;
        border-bottom: 1px solid var(--border);
        padding: 1.25rem 1.75rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .ju-breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.75rem;
        color: var(--text-3);
        margin-bottom: 0.375rem;
    }

    .ju-breadcrumb a { color: var(--text-3); text-decoration: none; }
    .ju-breadcrumb a:hover { color: var(--orange); }
    .ju-breadcrumb-sep { opacity: 0.4; }

    .ju-title-row { display: flex; flex-direction: column; gap: 0.125rem; }
    .ju-title { font-size: 1.25rem; font-weight: 800; color: var(--text-1); letter-spacing: -0.025em; }
    .ju-subtitle { font-size: 0.8125rem; color: var(--text-2); }

    /* ── NEW BUTTON ── */
    .btn-new {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 1.125rem;
        background: linear-gradient(135deg, var(--orange), var(--orange-dark));
        color: white;
        font-size: 0.875rem;
        font-weight: 700;
        font-family: 'Plus Jakarta Sans', sans-serif;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
        box-shadow: 0 4px 14px rgba(242,101,34,0.35);
        white-space: nowrap;
        text-decoration: none;
    }
    .btn-new:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(242,101,34,0.42); }
    .btn-new svg { width: 15px; height: 15px; }

    /* ── FLASH ── */
    .flash {
        margin: 1rem 1.75rem 0;
        padding: 0.75rem 1rem;
        background: #f0fdf4;
        border: 1px solid #86efac;
        border-radius: 10px;
        font-size: 0.8125rem;
        color: #166534;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    /* ── MAIN CONTENT ── */
    .ju-content { padding: 1.5rem 1.75rem; }

    /* ── EMPTY STATE ── */
    .empty-card {
        background: white;
        border: 1.5px dashed var(--border);
        border-radius: 18px;
        padding: 3.5rem 2rem;
        text-align: center;
    }

    .empty-icon {
        width: 60px; height: 60px;
        margin: 0 auto 1.25rem;
        border-radius: 16px;
        background: var(--orange-light);
        border: 1px solid var(--orange-border);
        display: flex; align-items: center; justify-content: center;
    }
    .empty-icon svg { width: 26px; height: 26px; stroke: var(--orange); }
    .empty-title { font-size: 1.0625rem; font-weight: 700; color: var(--text-1); margin-bottom: 0.375rem; }
    .empty-desc { font-size: 0.875rem; color: var(--text-2); margin-bottom: 1.5rem; }

    /* ── JUDUL CARD ── */
    .judul-list { display: flex; flex-direction: column; gap: 1rem; }

    .judul-card {
        background: white;
        border: 1px solid var(--border);
        border-radius: 18px;
        overflow: hidden;
        transition: box-shadow 0.2s, transform 0.2s;
    }
    .judul-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); transform: translateY(-1px); }

    .judul-card-top {
        padding: 1.25rem 1.375rem 0;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
    }

    .judul-card-title { font-size: 1rem; font-weight: 700; color: var(--text-1); line-height: 1.4; }

    .judul-card-meta {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        margin-top: 0.5rem;
        flex-wrap: wrap;
    }

    .konsentrasi-pill {
        display: inline-flex;
        align-items: center;
        padding: 0.2rem 0.625rem;
        border-radius: 999px;
        font-size: 0.6875rem;
        font-weight: 600;
        background: var(--orange-light);
        color: var(--orange-dark);
        border: 1px solid var(--orange-border);
    }

    .date-text { font-size: 0.75rem; color: var(--text-3); }

    /* STATUS BADGE */
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.275rem 0.75rem;
        border-radius: 999px;
        font-size: 0.6875rem;
        font-weight: 700;
        white-space: nowrap;
        flex-shrink: 0;
    }
    .status-badge-dot { width: 6px; height: 6px; border-radius: 50%; }

    .badge-gray   { background: #f3f4f6; color: #6b7280; } .badge-gray   .status-badge-dot { background: #9ca3af; }
    .badge-blue   { background: #eff6ff; color: #2563eb; } .badge-blue   .status-badge-dot { background: #3b82f6; }
    .badge-yellow { background: #fefce8; color: #ca8a04; } .badge-yellow .status-badge-dot { background: #eab308; }
    .badge-red    { background: #fef2f2; color: #dc2626; } .badge-red    .status-badge-dot { background: #ef4444; }
    .badge-green  { background: #f0fdf4; color: #16a34a; } .badge-green  .status-badge-dot { background: #22c55e; }
    .badge-indigo { background: #eef2ff; color: #4f46e5; } .badge-indigo .status-badge-dot { background: #6366f1; }
    .badge-purple { background: #faf5ff; color: #7c3aed; } .badge-purple .status-badge-dot { background: #a855f7; }
    .badge-orange { background: var(--orange-light); color: var(--orange-dark); } .badge-orange .status-badge-dot { background: var(--orange); }

    /* PROGRESS */
    .judul-progress { padding: 1rem 1.375rem 0; }

    .progress-track {
        height: 5px;
        border-radius: 999px;
        background: var(--surface-2);
        overflow: hidden;
        margin-bottom: 0.375rem;
    }
    .progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--orange), var(--orange-dark));
        transition: width 0.5s ease;
    }
    .progress-fill-green { background: linear-gradient(90deg, #22c55e, #16a34a); }

    .progress-steps {
        display: flex;
        justify-content: space-between;
    }
    .progress-step-label { font-size: 0.6rem; color: var(--text-3); }

    /* DESCRIPTION */
    .judul-desc {
        padding: 0.75rem 1.375rem 0;
        font-size: 0.8125rem;
        color: var(--text-2);
        line-height: 1.55;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* CATATAN */
    .judul-catatan { padding: 0.75rem 1.375rem 0; display: flex; flex-direction: column; gap: 0.5rem; }

    .catatan-block {
        display: flex;
        align-items: flex-start;
        gap: 0.625rem;
        padding: 0.625rem 0.875rem;
        border-radius: 10px;
        font-size: 0.8125rem;
        line-height: 1.45;
    }
    .catatan-block svg { width: 14px; height: 14px; flex-shrink: 0; margin-top: 1px; }
    .catatan-admin { background: #eff6ff; color: #1d4ed8; }
    .catatan-kaprodi { background: #fef2f2; color: #b91c1c; }

    /* PEMBIMBING */
    .judul-pembimbing { padding: 0.875rem 1.375rem 0; }
    .pembimbing-label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-3); margin-bottom: 0.625rem; }

    .pembimbing-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.75rem;
        background: var(--surface);
        border-radius: 10px;
        margin-bottom: 0.375rem;
    }

    .pembimbing-avatar {
        width: 26px; height: 26px;
        border-radius: 8px;
        background: var(--orange-light);
        color: var(--orange-dark);
        font-size: 0.625rem;
        font-weight: 800;
        display: flex; align-items: center; justify-content: center;
        border: 1px solid var(--orange-border);
        flex-shrink: 0;
    }

    .pembimbing-name { font-size: 0.8125rem; color: var(--text-1); font-weight: 500; }

    /* ACTIONS */
    .judul-actions {
        padding: 0.875rem 1.375rem;
        margin-top: 0.875rem;
        border-top: 1px solid var(--surface-2);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .act-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.4375rem 0.875rem;
        border-radius: 8px;
        font-size: 0.8125rem;
        font-weight: 600;
        font-family: 'Plus Jakarta Sans', sans-serif;
        border: none;
        cursor: pointer;
        transition: all 0.15s;
        white-space: nowrap;
        text-decoration: none;
    }
    .act-btn svg { width: 13px; height: 13px; }

    .act-btn-ghost { background: var(--surface); color: var(--text-2); border: 1px solid var(--border); }
    .act-btn-ghost:hover { background: var(--surface-2); color: var(--text-1); }

    .act-btn-primary { background: linear-gradient(135deg, var(--orange), var(--orange-dark)); color: white; box-shadow: 0 2px 8px rgba(242,101,34,0.3); }
    .act-btn-primary:hover { box-shadow: 0 4px 12px rgba(242,101,34,0.4); transform: translateY(-1px); }

    .act-btn-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .act-btn-success:hover { background: #dcfce7; }

    .act-btn-danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .act-btn-danger:hover { background: #fee2e2; }

    /* ── MODAL OVERLAY ── */
    .modal-overlay {
        position: fixed; inset: 0; z-index: 50;
        background: rgba(15,15,15,0.55);
        backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        padding: 1.5rem;
        animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal-box {
        background: white;
        border-radius: 20px;
        box-shadow: 0 25px 60px rgba(0,0,0,0.2);
        width: 100%; max-height: 90vh;
        overflow-y: auto;
        animation: slideUp 0.2s ease;
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    .modal-md { max-width: 640px; }
    .modal-sm { max-width: 520px; }

    .modal-head {
        padding: 1.375rem 1.5rem 1rem;
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        position: sticky; top: 0; background: white; z-index: 1;
        border-radius: 20px 20px 0 0;
    }

    .modal-title { font-size: 1rem; font-weight: 800; color: var(--text-1); letter-spacing: -0.02em; }
    .modal-title-sub { font-size: 0.75rem; color: var(--text-2); margin-top: 1px; }

    .modal-close {
        width: 32px; height: 32px;
        border-radius: 8px;
        background: var(--surface);
        border: 1px solid var(--border);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: var(--text-2);
        transition: all 0.15s;
        flex-shrink: 0;
    }
    .modal-close:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }
    .modal-close svg { width: 14px; height: 14px; }

    .modal-body { padding: 1.375rem 1.5rem; }

    /* ── FORM ELEMENTS ── */
    .f-group { margin-bottom: 1rem; }
    .f-label { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text-1); margin-bottom: 0.5rem; }
    .f-label-req::after { content: ' *'; color: var(--orange); }

    .f-input, .f-select, .f-textarea {
        width: 100%;
        padding: 0.75rem 0.9375rem;
        border: 1.5px solid var(--border);
        border-radius: 11px;
        font-size: 0.875rem;
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: var(--text-1);
        background: var(--surface);
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    }
    .f-input::placeholder, .f-textarea::placeholder { color: var(--text-3); }
    .f-input:focus, .f-select:focus, .f-textarea:focus {
        border-color: var(--orange);
        box-shadow: 0 0 0 3px rgba(242,101,34,0.12);
        background: white;
    }
    .f-textarea { resize: vertical; }
    .f-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23a09890' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; background-size: 14px; padding-right: 2.25rem; }

    .f-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
    @media (max-width: 640px) { .f-grid-2 { grid-template-columns: 1fr; } }

    .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border);
        display: flex;
        justify-content: flex-end;
        gap: 0.625rem;
        background: var(--surface);
        border-radius: 0 0 20px 20px;
    }

    /* DOSEN OPTION */
    .dosen-option {
        padding: 0.75rem;
        border: 1.5px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: all 0.15s;
    }
    .dosen-option:hover { border-color: var(--orange-border); background: white; }
`;

export default function Index({ juduls, konsentrasis }: Props) {
    console.log({juduls});
    
    const { flash } = usePage().props as any;
    const [showForm, setShowForm] = useState(false);
    const [showPembimbingModal, setShowPembimbingModal] = useState<string | null>(null);
    const [showRevisiModal, setShowRevisiModal] = useState<Judul | null>(null);
    const [availableDosens, setAvailableDosens] = useState<Dosen[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { data, setData, post, put, processing, reset } = useForm({ judul: '', konsentrasi_id: '', deskripsi: '', dokumen: null as File | null });
    const pembimbingForm = useForm({ dosen_id_1: '', dosen_id_2: '' });
    const revisiForm = useForm({ judul_baru: '', alasan_revisi: '', dokumen: null as File | null });
    const replaceForm = useForm({ dosen_id: '', urutan: '' });
    // { judulId, urutan, dosenLama } — mana pembimbing yang akan diganti
    const [replaceModal, setReplaceModal] = useState<{ judulId: string; urutan: string; dosenLama: string; konsentrasiId: string } | null>(null);

    const handleOpenRevisi = (j: Judul) => {
        revisiForm.setData({
            judul_baru: j.judul,
            alasan_revisi: '',
            dokumen: null
        });
        setShowRevisiModal(j);
    };

    const handleRevisiSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!showRevisiModal) return;
        revisiForm.post(route('mahasiswa.judul.revisi', showRevisiModal.id), {
            onSuccess: () => {
                setShowRevisiModal(null);
                revisiForm.reset();
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) { put(route('mahasiswa.judul.update', editingId), { onSuccess: () => { reset(); setShowForm(false); setEditingId(null); } }); }
        else { post(route('mahasiswa.judul.store'), { onSuccess: () => { reset(); setShowForm(false); } }); }
    };
    const handleEdit = (j: Judul) => { setData({ judul: j.judul, konsentrasi_id: j.konsentrasi_id || j.konsentrasi?.id || '', deskripsi: j.deskripsi || '', dokumen: null }); setEditingId(j.id); setShowForm(true); };
    const handleLoadDosen = async (konsentrasiId: string) => { const res = await fetch(route('mahasiswa.judul.available-dosen', konsentrasiId)); const d = await res.json(); setAvailableDosens(d); };

    const handleOpenReplaceModal = async (judulId: string, urutan: string, dosenLama: string, konsentrasiId: string) => {
        setReplaceModal({ judulId, urutan, dosenLama, konsentrasiId });
        replaceForm.setData({ dosen_id: '', urutan });
        await handleLoadDosen(konsentrasiId);
    };

    const handleReplaceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replaceModal) return;
        replaceForm.post(route('mahasiswa.judul.pembimbing.replace', replaceModal.judulId), {
            onSuccess: () => { setReplaceModal(null); replaceForm.reset(); }
        });
    };

    const hasActiveJudul = juduls.some(j => !['rejected', 'rejected_kaprodi'].includes(j.status));
    const getPembimbingProgress = (j: Judul) => {
        if (!j.pembimbing || j.pembimbing.length === 0) return 0;
        const approved = j.pembimbing.filter(p => p.status === 'approved').length;
        const total = j.pembimbing.length;
        return approved === total ? 100 : (approved > 0 ? 80 : 60);
    };
    const statusBadgeClass = (s: string) => ({ draft: 'badge-gray', submitted: 'badge-blue', verified_admin: 'badge-yellow', kaprodi_approval: 'badge-indigo', rejected: 'badge-red', approved: 'badge-green', rejected_kaprodi: 'badge-red' }[s] || 'badge-gray');
    const statusLabel = (s: string) => ({ draft: 'Draft', submitted: 'Diajukan', verified_admin: 'Diverifikasi Admin', kaprodi_approval: 'Menunggu Kaprodi', rejected: 'Ditolak', approved: 'Disetujui Kaprodi', rejected_kaprodi: 'Ditolak Kaprodi' }[s] || s);
    const pembimbingBadgeClass = (s: string) => ({ requested: 'badge-yellow', verified_admin: 'badge-blue', kaprodi_approval: 'badge-indigo', approved: 'badge-green', rejected: 'badge-red' }[s] || 'badge-gray');
    const pembimbingStatusLabel = (s: string) => ({ requested: 'Diajukan', verified_admin: 'Diverifikasi', kaprodi_approval: 'Menunggu Kaprodi', approved: 'Diterima', rejected: 'Ditolak' }[s] || s);
    const stepProgress = (j: Judul) => {
        const base = ({ draft: 0, submitted: 20, verified_admin: 40, kaprodi_approval: 40, approved: 60, rejected: 0, rejected_kaprodi: 0 }[j.status] || 0);
        if (base >= 60 && j.pembimbing && j.pembimbing.length > 0) return getPembimbingProgress(j);
        return base;
    };

    const StatusBadge = ({ status }: { status: string }) => (
        <span className={`status-badge ${statusBadgeClass(status)}`}>
            <span className="status-badge-dot" />
            {statusLabel(status)}
        </span>
    );

    return (
        <AppLayout title="Pengajuan Judul">
            <style>{S}</style>
            <div className="ju-wrap">

                {/* Header */}
                <div className="ju-header">
                    <div className="ju-title-row">
                        <div className="ju-breadcrumb">
                            <a href="/dashboard">Dashboard</a>
                            <span className="ju-breadcrumb-sep">›</span>
                            <span>Pengajuan Judul</span>
                        </div>
                        <h1 className="ju-title">Pengajuan Judul Skripsi</h1>
                        <p className="ju-subtitle">Ajukan dan kelola judul skripsi Anda</p>
                    </div>
                    {!showForm && !hasActiveJudul && (
                        <button className="btn-new" onClick={() => { reset(); setEditingId(null); setShowForm(true); }}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Ajukan Judul Baru
                        </button>
                    )}
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="flash">
                        <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {flash.success}
                    </div>
                )}

                <div className="ju-content">

                    {/* Empty */}
                    {juduls.length === 0 ? (
                        <div className="empty-card">
                            <div className="empty-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div className="empty-title">Belum ada pengajuan</div>
                            <div className="empty-desc">Klik tombol di bawah untuk memulai pengajuan skripsi</div>
                            <button className="btn-new" style={{ margin: '0 auto' }} onClick={() => setShowForm(true)}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Ajukan Judul
                            </button>
                        </div>
                    ) : (
                        <div className="judul-list">
                            {juduls.map(j => (
                                <div key={j.id} className="judul-card">
                                    {/* Top row */}
                                    <div className="judul-card-top">
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="judul-card-title">{j.judul}</div>
                                            <div className="judul-card-meta">
                                                {j.konsentrasi && <span className="konsentrasi-pill">{j.konsentrasi.nama}</span>}
                                                <span className="date-text">{new Date(j.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <StatusBadge status={j.status} />
                                            {j.revision_status && (
                                                <span className={`status-badge ${
                                                    j.revision_status === 'revision_pending' ? 'badge-yellow' :
                                                    j.revision_status === 'revision_approved' ? 'badge-green' : 'badge-red'
                                                }`} style={{ fontSize: '10px', padding: '0.2rem 0.6rem' }}>
                                                    <span className="status-badge-dot" />
                                                    {j.revision_status === 'revision_pending' ? 'Revisi Pending' :
                                                     j.revision_status === 'revision_approved' ? 'Revisi Disetujui' : 'Revisi Ditolak'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    {!['rejected', 'rejected_kaprodi'].includes(j.status) && (
                                        <div className="judul-progress">
                                            <div className="progress-track">
                                                <div
                                                    className={`progress-fill${j.status === 'approved' ? ' progress-fill-green' : ''}`}
                                                    style={{ width: `${stepProgress(j)}%` }}
                                                />
                                            </div>
                                            <div className="progress-steps">
                                                {['Draft', 'Verifikasi', 'ACC', 'Pembimbing'].map(l => (
                                                    <span key={l} className="progress-step-label">{l}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description & Dokumen */}
                                    <div style={{ padding: '0.75rem 1.375rem 0' }}>
                                        {j.deskripsi && <div className="judul-desc" style={{ padding: 0, marginBottom: '0.5rem' }}>{j.deskripsi}</div>}
                                        {j.dokumen_url && (
                                            <a href={j.dokumen_url} target="_blank" rel="noopener noreferrer" className="act-btn act-btn-ghost" style={{ marginTop: '0.25rem' }}>
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                Lihat Sinopsis (PDF)
                                            </a>
                                        )}
                                    </div>

                                    {/* Catatan Tolak */}
                                    {j.keterangan_tolak && (
                                        <div className="judul-catatan">
                                            <div className="catatan-block catatan-kaprodi">
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                                <span><strong>Alasan:</strong> {j.keterangan_tolak}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Banner Revisi Pending / Rejected / Approved */}
                                    {j.revision_status === 'revision_pending' && (
                                        <div className="judul-catatan">
                                            <div className="catatan-block" style={{ backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                                                <svg style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                                <div>
                                                    <span className="font-semibold block text-[12px]">Revisi Judul Menunggu Persetujuan</span>
                                                    <span className="text-[11px] block mt-0.5 text-[#d97706]">Pengajuan bimbingan ditangguhkan sementara. Menunggu persetujuan Kaprodi.</span>
                                                    <span className="text-[11px] block mt-1 italic">"Alasan Anda: {j.alasan_revisi}"</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {j.revision_status === 'revision_rejected' && (
                                        <div className="judul-catatan">
                                            <div className="catatan-block catatan-kaprodi" style={{ border: '1px solid #fca5a5' }}>
                                                <svg style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <div>
                                                    <span className="font-semibold block text-[12px]">Revisi Judul Ditolak Kaprodi</span>
                                                    <span className="text-[11px] block mt-0.5">Silakan ajukan revisi kembali. Catatan Kaprodi:</span>
                                                    <span className="text-[11px] block mt-1 p-2 bg-white/70 rounded border border-red-100 font-medium text-red-800">
                                                        {j.catatan_revisi_kaprodi}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {j.revision_status === 'revision_approved' && j.catatan_revisi_kaprodi && (
                                        <div className="judul-catatan">
                                            <div className="catatan-block" style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                                                <svg style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <div>
                                                    <span className="font-semibold block text-[12px]">Revisi Judul Terakhir Disetujui</span>
                                                    <span className="text-[11px] block mt-0.5">Catatan Kaprodi: "{j.catatan_revisi_kaprodi}"</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pembimbing */}
                                    {j.pembimbing?.length > 0 && (
                                        <div className="judul-pembimbing">
                                            <div className="pembimbing-label">Dosen Pembimbing</div>
                                            {j.pembimbing.map(p => (
                                                <div key={p.id} className="pembimbing-row">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                        <div className="pembimbing-avatar">{p.urutan === 'pembimbing_utama' ? 'P1' : 'P2'}</div>
                                                        <span className="pembimbing-name">{p.dosen?.user?.name || '-'}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span className={`status-badge ${pembimbingBadgeClass(p.status)}`} style={{ fontSize: '0.625rem' }}>
                                                            <span className="status-badge-dot" />
                                                            {pembimbingStatusLabel(p.status)}
                                                        </span>
                                                        {/* Tombol Ganti — hanya muncul jika pembimbing ditolak & judul approved */}
                                                        {p.status === 'rejected' && j.status === 'approved' && (
                                                            <button
                                                                onClick={() => handleOpenReplaceModal(j.id, p.urutan, p.dosen?.user?.name || '-', j.konsentrasi?.id || '')}
                                                                style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 6, background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', cursor: 'pointer', fontWeight: 600 }}
                                                            >
                                                                Ganti
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="judul-actions">
                                        {j.status === 'draft' && (
                                            <>
                                                <button className="act-btn act-btn-ghost" onClick={() => handleEdit(j)}>
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    Edit
                                                </button>
                                                <button className="act-btn act-btn-success" onClick={() => router.post(route('mahasiswa.judul.submit', j.id))}>
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                                    Ajukan
                                                </button>
                                                <button className="act-btn act-btn-danger" onClick={() => { if (confirm('Hapus judul ini?')) router.delete(route('mahasiswa.judul.destroy', j.id)); }}>
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Hapus
                                                </button>
                                            </>
                                        )}
                                        {/* Pilih Pembimbing: muncul saat belum ada pembimbing ATAU semua pembimbing ditolak */}
                                        {j.status === 'approved' && (
                                            (!j.pembimbing || j.pembimbing.length === 0 ||
                                                j.pembimbing.every(p => p.status === 'rejected')
                                            ) && (
                                            <button className="act-btn act-btn-primary" onClick={() => { setShowPembimbingModal(j.id); handleLoadDosen(j.konsentrasi?.id); }}>
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                Pilih Pembimbing
                                            </button>
                                        ))}
                                        {['rejected', 'rejected_kaprodi'].includes(j.status) && (
                                            <button className="act-btn act-btn-ghost" onClick={() => handleEdit(j)}>
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                Ajukan Ulang
                                            </button>
                                        )}
                                        {j.status === 'approved' && j.revision_status !== 'revision_pending' && (
                                            <button className="act-btn act-btn-ghost" style={{ backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#ffedd5' }} onClick={() => handleOpenRevisi(j)}>
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                {j.revision_status === 'revision_rejected' ? 'Ajukan Revisi Ulang' : 'Ajukan Revisi Judul'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── FORM MODAL ── */}
                {showForm && (
                    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); setEditingId(null); reset(); } }}>
                        <div className="modal-box modal-md">
                            <div className="modal-head">
                                <div>
                                    <div className="modal-title">{editingId ? 'Edit Judul Skripsi' : 'Form Pengajuan Judul'}</div>
                                    <div className="modal-title-sub">{editingId ? 'Perbarui informasi judul Anda' : 'Isi detail judul skripsi yang akan diajukan'}</div>
                                </div>
                                <button className="modal-close" onClick={() => { setShowForm(false); setEditingId(null); reset(); }}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="f-group">
                                        <label className="f-label f-label-req">Judul Skripsi</label>
                                        <input className="f-input" value={data.judul} onChange={e => setData('judul', e.target.value)} placeholder="Masukkan judul skripsi Anda" required />
                                    </div>
                                    <div className="f-group">
                                        <label className="f-label f-label-req">Konsentrasi</label>
                                        <select className="f-select" value={data.konsentrasi_id} onChange={e => setData('konsentrasi_id', e.target.value)} required>
                                            <option value="">Pilih Konsentrasi</option>
                                            {konsentrasis.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                                        </select>
                                    </div>
                                    <div className="f-group">
                                        <label className="f-label">Deskripsi</label>
                                        <textarea className="f-textarea" value={data.deskripsi} onChange={e => setData('deskripsi', e.target.value)} rows={3} placeholder="Deskripsi singkat tentang penelitian Anda" />
                                    </div>
                                    <div className="f-group">
                                        <label className="f-label f-label-req">Dokumen Sinopsis</label>
                                        <input type="file" accept=".pdf" onChange={e => setData('dokumen', e.target.files?.[0] || null)} className="f-input" style={{ padding: '0.6rem' }} required={!editingId} />
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>Upload dokumen sinopsis dalam format PDF (maks. 10MB)</p>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="act-btn act-btn-ghost" onClick={() => { setShowForm(false); setEditingId(null); reset(); }}>Batal</button>
                                    <button type="submit" disabled={processing} className="act-btn act-btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                                        {processing ? 'Menyimpan...' : editingId ? 'Update Judul' : 'Simpan Draft'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── PEMBIMBING MODAL ── */}
                {showPembimbingModal && (
                    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowPembimbingModal(null); }}>
                        <div className="modal-box modal-sm">
                            <div className="modal-head">
                                <div>
                                    <div className="modal-title">Pilih Dosen Pembimbing</div>
                                    <div className="modal-title-sub">Berdasarkan ketersediaan kuota bimbingan</div>
                                </div>
                                <button className="modal-close" onClick={() => setShowPembimbingModal(null)}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="f-group">
                                    <label className="f-label">Pembimbing 1</label>
                                    <select className="f-select" value={pembimbingForm.data.dosen_id_1} onChange={e => pembimbingForm.setData('dosen_id_1', e.target.value)}>
                                        <option value="">Pilih Pembimbing 1</option>
                                        {availableDosens.filter(d => d.sisa_kuota > 0).map(d => (
                                            <option key={d.id} value={d.id}>{d.nama} ({d.nidn}) — Sisa kuota: {d.sisa_kuota}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="f-group">
                                    <label className="f-label">Pembimbing 2</label>
                                    <select className="f-select" value={pembimbingForm.data.dosen_id_2} onChange={e => pembimbingForm.setData('dosen_id_2', e.target.value)}>
                                        <option value="">Pilih Pembimbing 2</option>
                                        {availableDosens.filter(d => d.sisa_kuota > 0 && d.id !== pembimbingForm.data.dosen_id_1).map(d => (
                                            <option key={d.id} value={d.id}>{d.nama} ({d.nidn}) — Sisa kuota: {d.sisa_kuota}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="act-btn act-btn-ghost" onClick={() => setShowPembimbingModal(null)}>Batal</button>
                                <button
                                    className="act-btn act-btn-primary"
                                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                                    disabled={pembimbingForm.processing}
                                    onClick={() => { if (showPembimbingModal) pembimbingForm.post(route('mahasiswa.judul.pembimbing', showPembimbingModal), { onSuccess: () => setShowPembimbingModal(null) }); }}
                                >
                                    {pembimbingForm.processing ? 'Mengajukan...' : 'Ajukan Pembimbing'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── REVISI JUDUL MODAL ── */}
                {showRevisiModal && (
                    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowRevisiModal(null); revisiForm.reset(); } }}>
                        <div className="modal-box modal-md">
                            <div className="modal-head">
                                <div>
                                    <div className="modal-title">Ajukan Revisi Judul</div>
                                    <div className="modal-title-sub">Ajukan revisi judul skripsi Anda yang telah disetujui sebelumnya</div>
                                </div>
                                <button className="modal-close" onClick={() => { setShowRevisiModal(null); revisiForm.reset(); }}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handleRevisiSubmit}>
                                <div className="modal-body">
                                    <div className="f-group">
                                        <label className="f-label f-label-req">Judul Baru</label>
                                        <input
                                            className="f-input"
                                            value={revisiForm.data.judul_baru}
                                            onChange={e => revisiForm.setData('judul_baru', e.target.value)}
                                            placeholder="Masukkan judul baru yang diusulkan"
                                            required
                                        />
                                    </div>
                                    <div className="f-group">
                                        <label className="f-label f-label-req">Alasan Revisi (Deskripsi)</label>
                                        <textarea
                                            className="f-textarea"
                                            value={revisiForm.data.alasan_revisi}
                                            onChange={e => revisiForm.setData('alasan_revisi', e.target.value)}
                                            rows={4}
                                            placeholder="Jelaskan alasan pengajuan revisi judul skripsi Anda secara detail (WAJIB)"
                                            required
                                        />
                                    </div>
                                    <div className="f-group">
                                        <label className="f-label">Dokumen Sinopsis Baru (Opsional)</label>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={e => revisiForm.setData('dokumen', e.target.files?.[0] || null)}
                                            className="f-input"
                                            style={{ padding: '0.6rem' }}
                                        />
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>Upload dokumen sinopsis baru jika ada perubahan konten/metode (format PDF, maks. 10MB)</p>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="act-btn act-btn-ghost" onClick={() => { setShowRevisiModal(null); revisiForm.reset(); }}>Batal</button>
                                    <button type="submit" disabled={revisiForm.processing} className="act-btn act-btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                                        {revisiForm.processing ? 'Mengirim...' : 'Kirim Pengajuan Revisi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Ganti Pembimbing */}
                {replaceModal && (
                    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setReplaceModal(null); replaceForm.reset(); } }}>
                        <div className="modal-box modal-md">
                            <div className="modal-head">
                                <div>
                                    <div className="modal-title">Ganti Pembimbing {replaceModal.urutan === 'pembimbing_utama' ? '1' : '2'}</div>
                                    <div className="modal-title-sub">Mengganti <strong>{replaceModal.dosenLama}</strong> yang menolak. Pilih dosen pengganti.</div>
                                </div>
                                <button className="modal-close" onClick={() => { setReplaceModal(null); replaceForm.reset(); }}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handleReplaceSubmit}>
                                <div className="modal-body">
                                    {availableDosens.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.875rem', padding: '1.5rem 0' }}>Memuat daftar dosen...</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {availableDosens.map(d => (
                                                <label
                                                    key={d.id}
                                                    className="dosen-option"
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        border: replaceForm.data.dosen_id === d.id ? '1.5px solid var(--orange)' : '1.5px solid var(--border)',
                                                        background: replaceForm.data.dosen_id === d.id ? 'rgba(242,101,34,0.04)' : 'var(--surface)',
                                                        cursor: d.sisa_kuota <= 0 ? 'not-allowed' : 'pointer',
                                                        opacity: d.sisa_kuota <= 0 ? 0.5 : 1,
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                        <input
                                                            type="radio"
                                                            name="replace_dosen"
                                                            value={d.id}
                                                            disabled={d.sisa_kuota <= 0}
                                                            checked={replaceForm.data.dosen_id === d.id}
                                                            onChange={() => replaceForm.setData('dosen_id', d.id)}
                                                            style={{ accentColor: 'var(--orange)' }}
                                                        />
                                                        <div>
                                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)' }}>{d.nama}</div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>NIDN: {d.nidn}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right', fontSize: '0.7rem' }}>
                                                        <span style={{ color: d.sisa_kuota > 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                                                            {d.sisa_kuota > 0 ? `${d.sisa_kuota} slot` : 'Penuh'}
                                                        </span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="act-btn act-btn-ghost" onClick={() => { setReplaceModal(null); replaceForm.reset(); }}>Batal</button>
                                    <button
                                        type="submit"
                                        disabled={replaceForm.processing || !replaceForm.data.dosen_id}
                                        className="act-btn act-btn-primary"
                                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                                    >
                                        {replaceForm.processing ? 'Mengirim...' : 'Konfirmasi Ganti'}
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