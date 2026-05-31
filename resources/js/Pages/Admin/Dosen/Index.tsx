import React, { useState, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { router, usePage } from '@inertiajs/react';
import { Modal, SearchInput, Button, Input, PageHeader, FlashMessage, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, Badge, Avatar, EmptyState, StatCard, ProgressBar } from '@/Components/UI';

interface User { id: string; name: string; email: string; }
interface Konsentrasi { id: string; nama: string; }
interface Dosen {
  id: string; nidn: string; bidang_keahlian: string; kuota_bimbingan: number;
  current_load: number; available_slots: number; foto: string | null; paraf: string | null;
  is_kaprodi: boolean; is_pimpinan: boolean; status: string; user: User; konsentrasi: Konsentrasi[];
  kategori: string | null;
}
interface Props { dosen?: Dosen[]; konsentrasiList?: Konsentrasi[]; }

const S = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    :root {
        --orange: #F26522;
        --orange-dark: #E85000;
        --orange-light: rgba(242,101,34,0.08);
        --orange-border: rgba(242,101,34,0.2);
        --black: #0f0f0f;
        --surface: #faf8f5;
        --surface-2: #f2ede6;
        --border: #e8e3dc;
        --text-1: #1a1714;
        --text-2: #6b6560;
        --text-3: #a09890;
    }

    .do-wrap { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--surface); min-height: 100vh; }

    /* ── HEADER ── */
    .do-header {
        background: white;
        border-bottom: 1px solid var(--border);
        padding: 1.25rem 1.75rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .do-breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.75rem;
        color: var(--text-3);
        margin-bottom: 0.375rem;
    }
    .do-breadcrumb a { color: var(--text-3); text-decoration: none; }
    .do-breadcrumb a:hover { color: var(--orange); }

    .do-title { font-size: 1.25rem; font-weight: 800; color: var(--text-1); letter-spacing: -0.025em; }
    .do-subtitle { font-size: 0.8125rem; color: var(--text-2); margin-top: 1px; }

    .btn-primary {
        display: inline-flex; align-items: center; gap: 0.5rem;
        padding: 0.625rem 1.125rem;
        background: linear-gradient(135deg, var(--orange), var(--orange-dark));
        color: white; font-size: 0.875rem; font-weight: 700;
        font-family: 'Plus Jakarta Sans', sans-serif;
        border: none; border-radius: 10px; cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
        box-shadow: 0 4px 14px rgba(242,101,34,0.32);
        white-space: nowrap;
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(242,101,34,0.42); }
    .btn-primary svg { width: 15px; height: 15px; }

    /* ── FLASH ── */
    .flash {
        margin: 1rem 1.75rem 0;
        padding: 0.75rem 1rem;
        background: #f0fdf4; border: 1px solid #86efac;
        border-radius: 10px; font-size: 0.8125rem; color: #166534;
        display: flex; align-items: center; gap: 0.5rem;
    }

    /* ── CONTENT ── */
    .do-content { padding: 1.5rem 1.75rem; }

    /* ── STAT CARDS ── */
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    @media (max-width: 768px) { .stat-grid { grid-template-columns: 1fr; } }

    .stat-card {
        background: white;
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 1.25rem 1.375rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: box-shadow 0.2s;
        position: relative;
        overflow: hidden;
    }
    .stat-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 3px; height: 100%;
    }
    .stat-card-orange::before { background: linear-gradient(180deg, var(--orange), var(--orange-dark)); }
    .stat-card-green::before  { background: linear-gradient(180deg, #22c55e, #16a34a); }
    .stat-card-indigo::before { background: linear-gradient(180deg, #6366f1, #4f46e5); }

    .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }

    .stat-icon {
        width: 44px; height: 44px; flex-shrink: 0;
        border-radius: 12px; display: flex; align-items: center; justify-content: center;
    }
    .stat-icon-orange { background: var(--orange-light); color: var(--orange); }
    .stat-icon-orange svg { stroke: var(--orange); }
    .stat-icon-green  { background: rgba(34,197,94,0.1); color: #16a34a; }
    .stat-icon-green svg { stroke: #16a34a; }
    .stat-icon-indigo { background: rgba(99,102,241,0.1); color: #4f46e5; }
    .stat-icon-indigo svg { stroke: #4f46e5; }

    .stat-icon svg { width: 20px; height: 20px; }
    .stat-label { font-size: 0.75rem; color: var(--text-2); font-weight: 500; margin-bottom: 0.1875rem; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--text-1); letter-spacing: -0.03em; line-height: 1; }

    /* ── SEARCH ── */
    .search-bar {
        margin-bottom: 1rem;
        position: relative;
    }
    .search-bar-icon {
        position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%);
        color: var(--text-3); pointer-events: none;
    }
    .search-bar-icon svg { width: 15px; height: 15px; stroke: currentColor; }
    .search-input {
        width: 100%; padding: 0.75rem 0.875rem 0.75rem 2.5rem;
        border: 1.5px solid var(--border); border-radius: 11px;
        font-size: 0.875rem; font-family: 'Plus Jakarta Sans', sans-serif;
        color: var(--text-1); background: white; outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        max-width: 380px;
    }
    .search-input::placeholder { color: var(--text-3); }
    .search-input:focus { border-color: var(--orange); box-shadow: 0 0 0 3px rgba(242,101,34,0.1); }

    /* ── TABLE ── */
    .tbl-wrap {
        background: white;
        border: 1px solid var(--border);
        border-radius: 16px;
        overflow: hidden;
    }

    .tbl { width: 100%; border-collapse: collapse; }

    .tbl thead { background: var(--surface); border-bottom: 1px solid var(--border); }
    .tbl th {
        padding: 0.75rem 1rem;
        text-align: left;
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-2);
        white-space: nowrap;
    }

    .tbl tbody tr {
        border-bottom: 1px solid var(--surface-2);
        transition: background 0.12s;
    }
    .tbl tbody tr:last-child { border-bottom: none; }
    .tbl tbody tr:hover { background: #fffaf7; }

    .tbl td { padding: 0.875rem 1rem; vertical-align: middle; }

    /* avatar */
    .dosen-avatar {
        width: 38px; height: 38px; border-radius: 10px;
        background: var(--orange-light);
        border: 1.5px solid var(--orange-border);
        color: var(--orange-dark);
        font-size: 0.8125rem; font-weight: 800;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
    }
    .dosen-avatar img { width: 100%; height: 100%; object-fit: cover; }

    .dosen-name { font-size: 0.875rem; font-weight: 600; color: var(--text-1); }
    .dosen-email { font-size: 0.75rem; color: var(--text-3); margin-top: 1px; }

    .nidn-pill {
        display: inline-block;
        font-family: 'Courier New', monospace;
        font-size: 0.75rem;
        background: var(--surface-2);
        color: var(--text-2);
        padding: 0.25rem 0.625rem;
        border-radius: 6px;
        letter-spacing: 0.03em;
    }

    /* progress */
    .load-track { height: 4px; background: var(--surface-2); border-radius: 999px; overflow: hidden; margin-bottom: 0.25rem; }
    .load-fill { height: 100%; border-radius: 999px; transition: width 0.4s; }
    .load-fill-green  { background: linear-gradient(90deg, #22c55e, #16a34a); }
    .load-fill-yellow { background: linear-gradient(90deg, #eab308, #ca8a04); }
    .load-fill-red    { background: linear-gradient(90deg, #ef4444, #dc2626); }
    .load-fill-orange { background: linear-gradient(90deg, var(--orange), var(--orange-dark)); }
    .load-text { font-size: 0.6875rem; color: var(--text-3); }

    /* konsentrasi pills */
    .k-pill {
        display: inline-flex; align-items: center;
        padding: 0.1875rem 0.5rem;
        border-radius: 999px;
        font-size: 0.6875rem; font-weight: 600;
        background: var(--orange-light);
        color: var(--orange-dark);
        border: 1px solid var(--orange-border);
        margin: 1px;
        white-space: nowrap;
    }

    /* status badge */
    .s-badge {
        display: inline-flex; align-items: center; gap: 0.35rem;
        padding: 0.25rem 0.625rem;
        border-radius: 999px; font-size: 0.6875rem; font-weight: 700;
    }
    .s-badge-dot { width: 6px; height: 6px; border-radius: 50%; }
    .s-badge-green  { background: #f0fdf4; color: #16a34a; } .s-badge-green  .s-badge-dot { background: #22c55e; }
    .s-badge-red    { background: #fef2f2; color: #dc2626; } .s-badge-red    .s-badge-dot { background: #ef4444; }

    /* kaprodi badge */
    .kaprodi-badge {
        display: inline-flex; align-items: center; gap: 0.25rem;
        padding: 0.125rem 0.5rem;
        border-radius: 999px; font-size: 0.625rem; font-weight: 800;
        background: linear-gradient(135deg, #7c3aed, #6d28d9);
        color: white; letter-spacing: 0.04em; text-transform: uppercase;
        margin-left: 0.375rem; vertical-align: middle;
    }
    .kaprodi-badge svg { width: 10px; height: 10px; }

    /* pimpinan badge */
    .pimpinan-badge {
        display: inline-flex; align-items: center; gap: 0.25rem;
        padding: 0.125rem 0.5rem;
        border-radius: 999px; font-size: 0.625rem; font-weight: 800;
        background: linear-gradient(135deg, #0284c7, #0369a1);
        color: white; letter-spacing: 0.04em; text-transform: uppercase;
        margin-left: 0.375rem; vertical-align: middle;
    }
    .pimpinan-badge svg { width: 10px; height: 10px; }

    /* kategori badge */
    .kategori-pill {
        display: inline-flex; align-items: center;
        padding: 0.25rem 0.625rem;
        border-radius: 8px;
        font-size: 0.75rem; font-weight: 700;
        text-transform: capitalize;
        white-space: nowrap;
        letter-spacing: 0.01em;
    }
    .kat-asisten { background: #e0f2fe; color: #0369a1; border: 1px solid rgba(3,105,161,0.15); }
    .kat-lektor { background: #e0e7ff; color: #4338ca; border: 1px solid rgba(67,56,202,0.15); }
    .kat-lektor-kepala { background: #f3e8ff; color: #7e22ce; border: 1px solid rgba(126,34,206,0.15); }
    .kat-profesor { background: #fef3c7; color: #b45309; border: 1px solid rgba(180,83,9,0.15); }
    .kat-default { background: #f3f4f6; color: #4b5563; border: 1px solid rgba(75,85,99,0.15); }

    /* toggles */
    .act-icon-kaprodi:hover { background: rgba(124,58,237,0.1); color: #7c3aed; border-color: rgba(124,58,237,0.3); }
    .act-icon-kaprodi.is-kaprodi { background: rgba(124,58,237,0.1); color: #7c3aed; border-color: rgba(124,58,237,0.3); }

    .act-icon-pimpinan:hover { background: rgba(2,132,199,0.1); color: #0284c7; border-color: rgba(2,132,199,0.3); }
    .act-icon-pimpinan.is-pimpinan { background: rgba(2,132,199,0.1); color: #0284c7; border-color: rgba(2,132,199,0.3); }

    /* action buttons */
    .act-wrap { display: flex; align-items: center; gap: 0.25rem; }
    .act-icon {
        width: 32px; height: 32px; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        border: 1px solid transparent;
        cursor: pointer; background: none;
        transition: all 0.15s;
        color: var(--text-3);
    }
    .act-icon svg { width: 15px; height: 15px; stroke: currentColor; }
    .act-icon-edit:hover  { background: var(--orange-light); color: var(--orange-dark); border-color: var(--orange-border); }
    .act-icon-del:hover   { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

    /* empty */
    .empty-row td { padding: 3rem 1rem; text-align: center; }
    .empty-icon {
        width: 52px; height: 52px; margin: 0 auto 1rem;
        border-radius: 14px;
        background: var(--orange-light); border: 1px solid var(--orange-border);
        display: flex; align-items: center; justify-content: center;
    }
    .empty-icon svg { width: 22px; height: 22px; stroke: var(--orange); }
    .empty-title { font-size: 0.9375rem; font-weight: 700; color: var(--text-1); margin-bottom: 0.25rem; }
    .empty-desc  { font-size: 0.8125rem; color: var(--text-2); }

    /* ── MODAL ── */
    .modal-overlay {
        position: fixed; inset: 0; z-index: 50;
        background: rgba(15,15,15,0.55); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        padding: 1.5rem; animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal-box {
        background: white; border-radius: 20px;
        box-shadow: 0 25px 60px rgba(0,0,0,0.2);
        width: 100%; max-width: 560px; max-height: 90vh;
        overflow-y: auto; animation: slideUp 0.2s ease;
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    .modal-head {
        padding: 1.375rem 1.5rem 1rem;
        border-bottom: 1px solid var(--border);
        display: flex; align-items: center; justify-content: space-between; gap: 1rem;
        position: sticky; top: 0; background: white; z-index: 1;
        border-radius: 20px 20px 0 0;
    }
    .modal-title { font-size: 1rem; font-weight: 800; color: var(--text-1); letter-spacing: -0.02em; }
    .modal-title-sub { font-size: 0.75rem; color: var(--text-2); margin-top: 1px; }

    .modal-close {
        width: 32px; height: 32px; border-radius: 8px;
        background: var(--surface); border: 1px solid var(--border);
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        color: var(--text-2); transition: all 0.15s; flex-shrink: 0;
    }
    .modal-close:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }
    .modal-close svg { width: 14px; height: 14px; }

    .modal-body { padding: 1.375rem 1.5rem; }
    .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border);
        display: flex; justify-content: flex-end; gap: 0.625rem;
        background: var(--surface);
        border-radius: 0 0 20px 20px;
    }

    /* form elements */
    .f-group { margin-bottom: 1rem; }
    .f-label { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text-1); margin-bottom: 0.5rem; }
    .f-label-req::after { content: ' *'; color: var(--orange); }
    .f-input, .f-select {
        width: 100%; padding: 0.75rem 0.9375rem;
        border: 1.5px solid var(--border); border-radius: 11px;
        font-size: 0.875rem; font-family: 'Plus Jakarta Sans', sans-serif;
        color: var(--text-1); background: var(--surface); outline: none;
        transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    }
    .f-input::placeholder { color: var(--text-3); }
    .f-input:focus, .f-select:focus {
        border-color: var(--orange); box-shadow: 0 0 0 3px rgba(242,101,34,0.1); background: white;
    }
    .f-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
    @media (max-width: 480px) { .f-grid-2 { grid-template-columns: 1fr; } }

    /* konsentrasi checkboxes */
    .k-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .k-chip {
        padding: 0.375rem 0.875rem;
        border-radius: 999px;
        border: 1.5px solid var(--border);
        background: var(--surface);
        font-size: 0.8125rem; font-weight: 500;
        color: var(--text-2);
        cursor: pointer;
        transition: all 0.15s;
        user-select: none;
    }
    .k-chip:hover { border-color: var(--orange-border); color: var(--orange-dark); background: white; }
    .k-chip-active { background: var(--orange-light) !important; border-color: var(--orange) !important; color: var(--orange-dark) !important; font-weight: 700; }

    .btn-ghost {
        display: inline-flex; align-items: center; gap: 0.375rem;
        padding: 0.5rem 1rem;
        background: white; color: var(--text-2);
        font-size: 0.875rem; font-weight: 600;
        font-family: 'Plus Jakarta Sans', sans-serif;
        border: 1.5px solid var(--border); border-radius: 9px;
        cursor: pointer; transition: all 0.15s;
    }
    .btn-ghost:hover { background: var(--surface-2); color: var(--text-1); }

    .btn-submit {
        display: inline-flex; align-items: center; gap: 0.375rem;
        padding: 0.5rem 1.25rem;
        background: linear-gradient(135deg, var(--orange), var(--orange-dark));
        color: white; font-size: 0.875rem; font-weight: 700;
        font-family: 'Plus Jakarta Sans', sans-serif;
        border: none; border-radius: 9px; cursor: pointer;
        transition: all 0.15s;
        box-shadow: 0 3px 10px rgba(242,101,34,0.3);
    }
    .btn-submit:hover { box-shadow: 0 5px 14px rgba(242,101,34,0.4); transform: translateY(-1px); }
    .btn-submit svg { width: 14px; height: 14px; }
`;

export default function DosenIndex({ dosen = [], konsentrasiList = [] }: Props) {
    const { flash } = usePage().props as any;
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        name: '', email: '', nidn: '', bidang_keahlian: '', kategori: '', kuota_bimbingan: 10,
        password: '', konsentrasi_ids: [] as string[]
    });

    const openCreate = () => {
        setEditMode(false); setSelectedId(null);
        setForm({ name: '', email: '', nidn: '', bidang_keahlian: '', kategori: '', kuota_bimbingan: 10, password: '', konsentrasi_ids: [] });
        setShowModal(true);
    };

    const openEdit = (d: Dosen) => {
        setEditMode(true); setSelectedId(d.id);
        setForm({
            name: d.user?.name || '',
            email: d.user?.email || '',
            nidn: d.nidn,
            bidang_keahlian: d.bidang_keahlian || '',
            kategori: d.kategori || '',
            kuota_bimbingan: d.kuota_bimbingan,
            password: '',
            konsentrasi_ids: d.konsentrasi?.map(k => k.id) || []
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editMode && selectedId) { router.put(`/admin/dosen/${selectedId}`, form, { onSuccess: () => setShowModal(false) }); }
        else { router.post('/admin/dosen', form, { onSuccess: () => setShowModal(false) }); }
    };

    const openDeleteConfirm = (d: Dosen) => {
        setDeleteTarget({ id: d.id, name: d.user?.name || 'Dosen' });
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deleteTarget) {
            router.delete(`/admin/dosen/${deleteTarget.id}`, {
                onSuccess: () => { setShowDeleteModal(false); setDeleteTarget(null); }
            });
        }
    };

    const toggleKonsentrasi = (id: string) => {
        setForm(f => ({ ...f, konsentrasi_ids: f.konsentrasi_ids.includes(id) ? f.konsentrasi_ids.filter(x => x !== id) : [...f.konsentrasi_ids, id] }));
    };

    const filtered = useMemo(() =>
        dosen.filter(d => d.user?.name?.toLowerCase().includes(search.toLowerCase()) || d.nidn.toLowerCase().includes(search.toLowerCase())),
        [dosen, search]
    );

    const totalKuota = dosen.reduce((a, d) => a + d.kuota_bimbingan, 0);
    const totalTerisi = dosen.reduce((a, d) => a + d.current_load, 0);

    const loadColor = (current: number, max: number) => {
        const pct = max > 0 ? current / max : 0;
        if (pct >= 1) return 'load-fill-red';
        if (pct >= 0.8) return 'load-fill-yellow';
        return 'load-fill-green';
    };

    const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <AppLayout title="Data Dosen">
            <style>{S}</style>
            <div className="do-wrap">

                {/* Header */}
                <div className="do-header">
                    <div>
                        <div className="do-breadcrumb">
                            <a href="/dashboard">Dashboard</a>
                            <span>›</span>
                            <span>Dosen</span>
                        </div>
                        <div className="do-title">Data Dosen</div>
                        <div className="do-subtitle">Kelola data dosen pembimbing dan penguji</div>
                    </div>
                    <button className="btn-primary" onClick={openCreate}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Tambah Dosen
                    </button>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="flash">
                        <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {flash.success}
                    </div>
                )}

                <div className="do-content">

                    {/* Stat Cards */}
                    <div className="stat-grid">
                        <div className="stat-card stat-card-orange">
                            <div className="stat-icon stat-icon-orange">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div>
                                <div className="stat-label">Total Dosen</div>
                                <div className="stat-value">{dosen.length}</div>
                            </div>
                        </div>
                        <div className="stat-card stat-card-green">
                            <div className="stat-icon stat-icon-green">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <div className="stat-label">Dosen Aktif</div>
                                <div className="stat-value">{dosen.filter(d => d.status === 'aktif').length}</div>
                            </div>
                        </div>
                        <div className="stat-card stat-card-indigo">
                            <div className="stat-icon stat-icon-indigo">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div>
                                <div className="stat-label">Beban Bimbingan</div>
                                <div className="stat-value">{totalTerisi}<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-3)' }}>/{totalKuota}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="search-bar">
                        <div className="search-bar-icon">
                            <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            className="search-input"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari nama atau NIDN dosen..."
                        />
                    </div>

                    {/* Table */}
                    <div className="tbl-wrap">
                        <table className="tbl">
                            <thead>
                                <tr>
                                    <th>Dosen</th>
                                    <th>NIDN</th>
                                    <th>Kategori</th>
                                    <th>Bidang Keahlian</th>
                                    <th>Beban Bimbingan</th>
                                    <th>Konsentrasi</th>
                                    <th>Status</th>
                                    <th style={{ width: 120 }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr className="empty-row">
                                        <td colSpan={8}>
                                            <div className="empty-icon">
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            </div>
                                            <div className="empty-title">Tidak ada data dosen</div>
                                            <div className="empty-desc">Belum ada dosen yang terdaftar atau tidak cocok dengan pencarian</div>
                                        </td>
                                    </tr>
                                ) : filtered.map(d => (
                                    <tr key={d.id}>
                                        {/* Dosen */}
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="dosen-avatar">
                                                    {d.foto ? <img src={d.foto} alt={d.user?.name} /> : initials(d.user?.name || '?')}
                                                </div>
                                                <div>
                                                    <div className="dosen-name">
                                                        {d.user?.name || '-'}
                                                        {d.is_kaprodi && (
                                                            <span className="kaprodi-badge">
                                                                <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                                                KAPRODI
                                                            </span>
                                                        )}
                                                        {d.is_pimpinan && (
                                                            <span className="pimpinan-badge">
                                                                <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                                PIMPINAN
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="dosen-email">{d.user?.email || '-'}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* NIDN */}
                                        <td><span className="nidn-pill">{d.nidn}</span></td>

                                        {/* Kategori */}
                                        <td>
                                            {d.kategori ? (
                                                <span className={`kategori-pill ${
                                                    d.kategori === 'asisten ahli' ? 'kat-asisten' :
                                                    d.kategori === 'lektor' ? 'kat-lektor' :
                                                    d.kategori === 'lektor kepala' ? 'kat-lektor-kepala' :
                                                    d.kategori === 'profesor' ? 'kat-profesor' : 'kat-default'
                                                }`}>
                                                    {d.kategori}
                                                </span>
                                            ) : (
                                                <span className="kategori-pill kat-default">—</span>
                                            )}
                                        </td>

                                        {/* Bidang */}
                                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-2)' }}>{d.bidang_keahlian || '—'}</td>

                                        {/* Load */}
                                        <td>
                                            <div style={{ minWidth: 110 }}>
                                                <div className="load-track">
                                                    <div
                                                        className={`load-fill ${loadColor(d.current_load, d.kuota_bimbingan)}`}
                                                        style={{ width: `${Math.min(100, d.kuota_bimbingan > 0 ? (d.current_load / d.kuota_bimbingan) * 100 : 0)}%` }}
                                                    />
                                                </div>
                                                <div className="load-text">{d.current_load}/{d.kuota_bimbingan} slot terisi</div>
                                            </div>
                                        </td>

                                        {/* Konsentrasi */}
                                        <td>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                                {d.konsentrasi?.map(k => <span key={k.id} className="k-pill">{k.nama}</span>)}
                                                {(!d.konsentrasi || d.konsentrasi.length === 0) && <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>—</span>}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <span className={`s-badge ${d.status === 'aktif' ? 's-badge-green' : 's-badge-red'}`}>
                                                <span className="s-badge-dot" />
                                                {d.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>

                                        {/* Actions - Kaprodi kini dikelola dari menu Program Studi */}
                                        <td>
                                            <div className="act-wrap">
                                                <button
                                                    className={`act-icon act-icon-pimpinan${d.is_pimpinan ? ' is-pimpinan' : ''}`}
                                                    onClick={() => router.post(`/admin/dosen/${d.id}/toggle-pimpinan`)}
                                                    title={d.is_pimpinan ? 'Cabut Status Pimpinan' : 'Jadikan Pimpinan'}
                                                >
                                                    <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                </button>
                                                <button className="act-icon act-icon-edit" onClick={() => openEdit(d)} title="Edit">
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button className="act-icon act-icon-del" onClick={() => openDeleteConfirm(d)} title="Hapus">
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── DELETE CONFIRM MODAL ── */}
                {showDeleteModal && (
                    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setDeleteTarget(null); } }}>
                        <div className="modal-box" style={{ maxWidth: '420px' }}>
                            <div className="modal-head">
                                <div className="modal-title" style={{ color: '#dc2626' }}>Konfirmasi Hapus</div>
                                <button className="modal-close" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                                <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                    <svg style={{ width: 24, height: 24, stroke: '#dc2626' }} fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </div>
                                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.375rem' }}>Hapus Data Dosen?</div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                                    Anda yakin ingin menghapus data dosen <strong style={{ color: 'var(--text-1)' }}>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                                </div>
                            </div>
                            <div className="modal-footer" style={{ justifyContent: 'center' }}>
                                <button className="btn-ghost" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>Batal</button>
                                <button
                                    className="btn-submit"
                                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 3px 10px rgba(220,38,38,0.3)' }}
                                    onClick={confirmDelete}
                                >
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Hapus Dosen
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MODAL ── */}
                {showModal && (
                    <div className="modal-overlay " onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
                        <div className="modal-box">
                            <div className="modal-head">
                                <div>
                                    <div className="modal-title">{editMode ? 'Edit Data Dosen' : 'Tambah Dosen Baru'}</div>
                                    <div className="modal-title-sub">{editMode ? 'Perbarui informasi dosen' : 'Isi form berikut untuk mendaftarkan dosen baru'}</div>
                                </div>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="f-group">
                                        <label className="f-label f-label-req">Nama Lengkap</label>
                                        <input className="f-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap dosen" required />
                                    </div>
                                    <div className="f-grid-2">
                                        <div className="f-group">
                                            <label className="f-label f-label-req">NIDN</label>
                                            <input className="f-input" value={form.nidn} onChange={e => setForm({ ...form, nidn: e.target.value })} placeholder="Nomor Induk Dosen Nasional" required />
                                        </div>
                                        <div className="f-group">
                                            <label className="f-label f-label-req">Email</label>
                                            <input className="f-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" required />
                                        </div>
                                    </div>
                                    <div className="f-grid-2">
                                        <div className="f-group">
                                            <label className="f-label">Bidang Keahlian</label>
                                            <input className="f-input" value={form.bidang_keahlian} onChange={e => setForm({ ...form, bidang_keahlian: e.target.value })} placeholder="Bidang keahlian" />
                                        </div>
                                        <div className="f-group">
                                            <label className="f-label">Kategori Dosen</label>
                                            <select className="f-select" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
                                                <option value="">-- Pilih Kategori --</option>
                                                <option value="asisten ahli">Asisten Ahli</option>
                                                <option value="lektor">Lektor</option>
                                                <option value="lektor kepala">Lektor Kepala</option>
                                                <option value="profesor">Profesor</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="f-group">
                                        <label className="f-label f-label-req">Kuota Bimbingan (Maks)</label>
                                        <input className="f-input" type="number" value={form.kuota_bimbingan} onChange={e => setForm({ ...form, kuota_bimbingan: parseInt(e.target.value) || 0 })} required />
                                    </div>
                                    {!editMode && (
                                        <div className="f-group">
                                            <label className="f-label f-label-req">Password</label>
                                            <input className="f-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Minimal 6 karakter" required />
                                        </div>
                                    )}
                                    <div className="f-group">
                                        <label className="f-label">Konsentrasi</label>
                                        <div className="k-chips">
                                            {konsentrasiList.map(k => (
                                                <div
                                                    key={k.id}
                                                    className={`k-chip${form.konsentrasi_ids.includes(k.id) ? ' k-chip-active' : ''}`}
                                                    onClick={() => toggleKonsentrasi(k.id)}
                                                >
                                                    {k.nama}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
                                    <button type="submit" className="btn-submit">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        {editMode ? 'Update Dosen' : 'Simpan'}
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