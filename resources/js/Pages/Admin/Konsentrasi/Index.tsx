import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { router, usePage } from '@inertiajs/react';

interface Konsentrasi { id: string; nama: string; kode: string; deskripsi: string | null; status: string; }
interface Props { konsentrasi: Konsentrasi[]; }

const B = {
    orange: '#E8541A', orangeDark: '#C94210', orangeLight: '#F26B35',
    orangeBg: '#FEF0EA', orangeBorder: '#FBBFA6',
    gold: '#F5A623', goldBg: '#FFF3DC',
    black: '#1A1A1A', dark: '#2D2D2D', mid: '#6B6B6B',
    light: '#F5F5F5', border: '#E8E8E8', white: '#FFFFFF',
};

const s = {
    page: { fontFamily: "'Segoe UI', sans-serif", color: B.black },

    hdr: {
        background: `linear-gradient(135deg, ${B.orange} 0%, ${B.orangeDark} 100%)`,
        borderRadius: 16, padding: '18px 22px', marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 4px 20px rgba(232,84,26,0.25)',
    },
    hdrLeft: {} as React.CSSProperties,
    bc: { fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'flex', gap: 5, marginBottom: 3 },
    bcActive: { color: B.gold, fontWeight: 600 },
    hdrTitle: { color: B.white, fontSize: 18, fontWeight: 700, margin: 0 },
    hdrSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },

    btnNew: {
        background: B.white, color: B.orange, border: 'none', borderRadius: 9,
        padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 5,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' as const,
    },

    flash: {
        background: B.orangeBg, border: `1px solid ${B.orangeBorder}`,
        borderLeft: `4px solid ${B.orange}`, borderRadius: 10,
        padding: '10px 14px', fontSize: 13, color: B.orangeDark,
        marginBottom: 14, fontWeight: 500,
    },

    searchWrap: {
        position: 'relative' as const, marginBottom: 14,
    },
    searchIcon: {
        position: 'absolute' as const, left: 12, top: '50%',
        transform: 'translateY(-50%)', color: B.mid, pointerEvents: 'none' as const,
    },
    searchInput: {
        width: '100%', border: `1.5px solid ${B.border}`, borderRadius: 10,
        padding: '9px 12px 9px 36px', fontSize: 13, background: B.white,
        outline: 'none', color: B.black, boxSizing: 'border-box' as const,
        transition: 'border-color 0.2s',
    },

    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 10,
    },

    card: {
        background: B.white, borderRadius: 14,
        border: `1px solid ${B.border}`, padding: '14px 16px',
        transition: 'all 0.2s', position: 'relative' as const,
        overflow: 'hidden' as const,
    },

    cardAccent: {
        position: 'absolute' as const, top: 0, left: 0,
        width: 3, height: '100%', background: B.orange, borderRadius: '14px 0 0 14px',
    },

    kodeChip: {
        display: 'inline-flex', alignItems: 'center',
        background: B.orangeBg, color: B.orange, borderRadius: 7,
        padding: '3px 8px', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.5px', marginBottom: 6,
    },
    cardName: { fontWeight: 600, fontSize: 14, color: B.black, margin: '0 0 4px' },
    cardDesc: {
        fontSize: 12, color: B.mid, lineHeight: 1.45, margin: '0 0 10px',
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical' as any, overflow: 'hidden',
    },

    cardFooter: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 10, borderTop: `1px solid ${B.border}`,
    },
    statusBadge: (aktif: boolean) => ({
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
        ...(aktif
            ? { background: '#EAF7EE', color: '#1E7E3A' }
            : { background: '#FDECEC', color: '#C0392B' }),
    }),
    statusDot: (aktif: boolean) => ({
        width: 5, height: 5, borderRadius: '50%',
        background: aktif ? '#1E7E3A' : '#C0392B',
    }),

    actionRow: { display: 'flex', gap: 4 },
    actionBtn: (color: string) => ({
        width: 28, height: 28, borderRadius: 8, border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: 13, transition: 'all 0.15s',
        background: color === 'orange' ? B.orangeBg : '#FDECEC',
        color: color === 'orange' ? B.orange : '#C0392B',
    }),

    // Modal
    overlay: {
        position: 'fixed' as const, inset: 0,
        background: 'rgba(0,0,0,0.45)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 50,
    },
    modalBox: {
        background: B.white, borderRadius: 18, width: '100%',
        maxWidth: 420, overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', margin: '0 16px',
    },
    modalHdr: {
        background: `linear-gradient(135deg, ${B.orange}, ${B.orangeDark})`,
        padding: '16px 20px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
    },
    modalTitle: { color: B.white, fontSize: 15, fontWeight: 700, margin: 0 },
    modalClose: {
        background: 'rgba(255,255,255,0.2)', border: 'none',
        borderRadius: 8, width: 28, height: 28, cursor: 'pointer',
        color: B.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    modalBody: { padding: '18px 20px' },
    modalFooter: {
        padding: '12px 20px', borderTop: `1px solid ${B.border}`,
        background: B.light, display: 'flex', justifyContent: 'flex-end', gap: 8,
    },

    label: { display: 'block', fontSize: 12, fontWeight: 600, color: B.dark, marginBottom: 5 },
    formInput: {
        width: '100%', border: `1.5px solid ${B.border}`, borderRadius: 10,
        padding: '8px 12px', fontSize: 13, background: B.light, outline: 'none',
        color: B.black, boxSizing: 'border-box' as const, transition: 'border-color 0.2s',
        marginBottom: 12,
    },
    formSelect: {
        width: '100%', border: `1.5px solid ${B.border}`, borderRadius: 10,
        padding: '8px 12px', fontSize: 13, background: B.light, outline: 'none',
        color: B.black, boxSizing: 'border-box' as const, marginBottom: 12,
    },
    btnCancel: {
        background: 'transparent', color: B.mid,
        border: `1.5px solid ${B.border}`, borderRadius: 9,
        padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    },
    btnSave: {
        background: B.orange, color: B.white, border: 'none',
        borderRadius: 9, padding: '8px 18px', fontSize: 13,
        fontWeight: 600, cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(232,84,26,0.3)',
    },

    // Empty
    empty: {
        background: B.white, border: `1.5px dashed ${B.orangeBorder}`,
        borderRadius: 14, padding: '36px 20px', textAlign: 'center' as const,
    },
    emptyIcon: {
        width: 52, height: 52, borderRadius: 14, background: B.orangeBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px',
    },
};

export default function KonsentrasiIndex({ konsentrasi }: Props) {
    const { flash } = usePage().props as any;
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ nama: '', kode: '', deskripsi: '', status: 'aktif' });

    const openCreate = () => {
        setEditMode(false); setSelectedId(null);
        setForm({ nama: '', kode: '', deskripsi: '', status: 'aktif' });
        setShowModal(true);
    };
    const openEdit = (k: Konsentrasi) => {
        setEditMode(true); setSelectedId(k.id);
        setForm({ nama: k.nama, kode: k.kode, deskripsi: k.deskripsi || '', status: k.status });
        setShowModal(true);
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editMode && selectedId ? `/admin/konsentrasi/${selectedId}` : '/admin/konsentrasi';
        const method = editMode ? router.put : router.post;
        method(url, form, { onSuccess: () => setShowModal(false) });
    };
    const handleDelete = (id: string) => {
        if (confirm('Yakin ingin menghapus konsentrasi ini?')) router.delete(`/admin/konsentrasi/${id}`);
    };

    const filtered = konsentrasi.filter(k =>
        k.nama.toLowerCase().includes(search.toLowerCase()) ||
        k.kode.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout title="Konsentrasi">
            <div style={s.page}>
                {/* Header */}
                <div style={s.hdr}>
                    <div>
                        <div style={s.bc}>
                            <span>Dashboard</span><span>›</span>
                            <span style={s.bcActive}>Konsentrasi</span>
                        </div>
                        <h1 style={s.hdrTitle}>Konsentrasi</h1>
                        <p style={s.hdrSub}>Kelola konsentrasi / program keahlian</p>
                    </div>
                    <button style={s.btnNew} onClick={openCreate}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah
                    </button>
                </div>

                {/* Flash */}
                {flash?.success && <div style={s.flash}>✓ {flash.success}</div>}

                {/* Search */}
                <div style={s.searchWrap}>
                    <span style={s.searchIcon}>
                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari konsentrasi atau kode..." style={s.searchInput}
                        onFocus={e => (e.target.style.borderColor = B.orangeBorder)}
                        onBlur={e => (e.target.style.borderColor = B.border)}
                    />
                </div>

                {/* Grid / Empty */}
                {filtered.length === 0 ? (
                    <div style={s.empty}>
                        <div style={s.emptyIcon}>
                            <svg width="24" height="24" fill="none" stroke={B.orange} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 5px', color: B.black }}>Belum ada konsentrasi</p>
                        <p style={{ fontSize: 13, color: B.mid, margin: '0 0 14px' }}>Mulai dengan menambahkan konsentrasi pertama</p>
                        <button style={s.btnSave} onClick={openCreate}>Tambah Konsentrasi</button>
                    </div>
                ) : (
                    <div style={s.grid}>
                        {filtered.map(k => (
                            <div
                                key={k.id} style={s.card}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(232,84,26,0.12)';
                                    (e.currentTarget as HTMLDivElement).style.borderColor = B.orangeBorder;
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                                    (e.currentTarget as HTMLDivElement).style.borderColor = B.border;
                                }}
                            >
                                <div style={s.cardAccent} />
                                <div style={{ paddingLeft: 8 }}>
                                    <span style={s.kodeChip}>{k.kode}</span>
                                    <p style={s.cardName}>{k.nama}</p>
                                    {k.deskripsi && <p style={s.cardDesc}>{k.deskripsi}</p>}
                                    <div style={s.cardFooter}>
                                        <span style={s.statusBadge(k.status === 'aktif')}>
                                            <span style={s.statusDot(k.status === 'aktif')} />
                                            {k.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                        <div style={s.actionRow}>
                                            <button style={s.actionBtn('orange')} onClick={() => openEdit(k)} title="Edit">
                                                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button style={s.actionBtn('red')} onClick={() => handleDelete(k.id)} title="Hapus">
                                                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div style={s.overlay} onClick={() => setShowModal(false)}>
                        <div style={s.modalBox} onClick={e => e.stopPropagation()}>
                            <div style={s.modalHdr}>
                                <h2 style={s.modalTitle}>
                                    {editMode ? 'Edit Konsentrasi' : 'Tambah Konsentrasi Baru'}
                                </h2>
                                <button style={s.modalClose} onClick={() => setShowModal(false)}>✕</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div style={s.modalBody}>
                                    <label style={s.label}>Nama Konsentrasi</label>
                                    <input
                                        style={s.formInput} value={form.nama} required
                                        placeholder="Contoh: Machine Learning"
                                        onChange={e => setForm({ ...form, nama: e.target.value })}
                                        onFocus={e => (e.target.style.borderColor = B.orangeBorder)}
                                        onBlur={e => (e.target.style.borderColor = B.border)}
                                    />
                                    <label style={s.label}>Kode</label>
                                    <input
                                        style={s.formInput} value={form.kode} required
                                        placeholder="Contoh: ML"
                                        onChange={e => setForm({ ...form, kode: e.target.value })}
                                        onFocus={e => (e.target.style.borderColor = B.orangeBorder)}
                                        onBlur={e => (e.target.style.borderColor = B.border)}
                                    />
                                    <label style={s.label}>Deskripsi</label>
                                    <textarea
                                        value={form.deskripsi} rows={3}
                                        placeholder="Deskripsi singkat..."
                                        onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                                        style={{ ...s.formInput, resize: 'none', lineHeight: 1.5 }}
                                        onFocus={e => (e.target.style.borderColor = B.orangeBorder)}
                                        onBlur={e => (e.target.style.borderColor = B.border)}
                                    />
                                    <label style={s.label}>Status</label>
                                    <select
                                        style={s.formSelect} value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                    >
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Nonaktif</option>
                                    </select>
                                </div>
                                <div style={s.modalFooter}>
                                    <button type="button" style={s.btnCancel} onClick={() => setShowModal(false)}>Batal</button>
                                    <button type="submit" style={s.btnSave}>
                                        {editMode ? 'Update' : 'Simpan'}
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