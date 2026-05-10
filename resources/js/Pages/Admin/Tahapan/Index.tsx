import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { router, usePage } from '@inertiajs/react';

interface Tahapan { id: string; nama: string; tipe: string; urutan: number; min_bab_sebelum: number | null; status: string; deskripsi?: string; }
interface Props { tahapan: Tahapan[]; }

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root {
    --or:#F26522; --or-d:#E85000;
    --or-l:rgba(242,101,34,0.08); --or-b:rgba(242,101,34,0.2);
    --sf:#faf8f5; --sf2:#f2ede6; --bd:#e8e3dc;
    --t1:#1a1714; --t2:#6b6560; --t3:#a09890;
}
.th { font-family:'Plus Jakarta Sans',sans-serif; background:var(--sf); min-height:100vh; }

/* header */
.th-hd { background:#fff; border-bottom:1px solid var(--bd); padding:1.25rem 1.75rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
.th-bc { display:flex; align-items:center; gap:.375rem; font-size:.75rem; color:var(--t3); margin-bottom:.375rem; }
.th-bc a { color:var(--t3); text-decoration:none; } .th-bc a:hover { color:var(--or); }
.th-ttl { font-size:1.25rem; font-weight:800; color:var(--t1); letter-spacing:-.025em; }
.th-sub { font-size:.8125rem; color:var(--t2); margin-top:1px; }

.btn-p { display:inline-flex; align-items:center; gap:.5rem; padding:.625rem 1.125rem; background:linear-gradient(135deg,var(--or),var(--or-d)); color:#fff; font-size:.875rem; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; border:none; border-radius:10px; cursor:pointer; transition:transform .15s,box-shadow .15s; box-shadow:0 4px 14px rgba(242,101,34,.32); white-space:nowrap; }
.btn-p:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(242,101,34,.42); }
.btn-p svg { width:15px; height:15px; }

.flash { margin:1rem 1.75rem 0; padding:.75rem 1rem; background:#f0fdf4; border:1px solid #86efac; border-radius:10px; font-size:.8125rem; color:#166534; display:flex; align-items:center; gap:.5rem; }

.th-ct { padding:1.5rem 1.75rem; }

/* empty */
.empty { background:#fff; border:1.5px dashed var(--bd); border-radius:18px; padding:3.5rem 2rem; text-align:center; }
.em-ic { width:60px; height:60px; margin:0 auto 1.25rem; border-radius:16px; background:var(--or-l); border:1px solid var(--or-b); display:flex; align-items:center; justify-content:center; }
.em-ic svg { width:26px; height:26px; stroke:var(--or); }
.em-t { font-size:1rem; font-weight:700; color:var(--t1); margin-bottom:.375rem; }
.em-d { font-size:.875rem; color:var(--t2); margin-bottom:1.5rem; }

/* timeline list */
.tl { display:flex; flex-direction:column; gap:0; }

.tl-item { display:flex; gap:1.25rem; position:relative; }

/* connector line */
.tl-left { display:flex; flex-direction:column; align-items:center; flex-shrink:0; }
.tl-node {
    width:44px; height:44px; border-radius:13px;
    display:flex; align-items:center; justify-content:center;
    font-size:.75rem; font-weight:800; color:#fff;
    position:relative; flex-shrink:0; z-index:1;
}
.tl-node-bim { background:linear-gradient(135deg,var(--or),var(--or-d)); box-shadow:0 4px 12px rgba(242,101,34,.35); }
.tl-node-uji { background:linear-gradient(135deg,#eab308,#ca8a04); box-shadow:0 4px 12px rgba(234,179,8,.35); }
.tl-node-adm { background:linear-gradient(135deg,#22c55e,#16a34a); box-shadow:0 4px 12px rgba(34,197,94,.3); }

.tl-line { width:2px; flex:1; background:var(--sf2); margin:4px 0; min-height:16px; }
.tl-line-last { display:none; }

.tl-card {
    flex:1; background:#fff; border:1px solid var(--bd);
    border-radius:16px; padding:1.125rem 1.25rem;
    margin-bottom:1rem;
    transition:box-shadow .2s,transform .2s,border-color .2s;
    display:flex; align-items:center; justify-content:space-between; gap:1rem;
}
.tl-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.07); transform:translateX(3px); border-color:var(--or-b); }

.tl-card-l { display:flex; flex-direction:column; gap:.375rem; flex:1; min-width:0; }

.tl-name { font-size:.9375rem; font-weight:700; color:var(--t1); }

.tl-tags { display:flex; align-items:center; gap:.375rem; flex-wrap:wrap; }

.tl-tag { display:inline-flex; align-items:center; padding:.175rem .625rem; border-radius:999px; font-size:.6875rem; font-weight:700; white-space:nowrap; }
.tt-bim { background:var(--or-l); color:var(--or-d); border:1px solid var(--or-b); }
.tt-uji { background:rgba(234,179,8,.1); color:#a16207; border:1px solid rgba(234,179,8,.25); }
.tt-adm { background:rgba(34,197,94,.08); color:#15803d; border:1px solid rgba(34,197,94,.2); }
.tt-off { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }

.tl-req { font-size:.75rem; color:var(--t3); display:flex; align-items:center; gap:.3rem; }
.tl-req svg { width:12px; height:12px; stroke:currentColor; flex-shrink:0; }

.tl-card-r { display:flex; align-items:center; gap:.375rem; flex-shrink:0; opacity:0; transition:opacity .15s; }
.tl-card:hover .tl-card-r { opacity:1; }

.act-ic { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; border:1px solid transparent; cursor:pointer; background:none; transition:all .15s; color:var(--t3); }
.act-ic svg { width:14px; height:14px; stroke:currentColor; }
.act-ic-e:hover { background:var(--or-l); color:var(--or-d); border-color:var(--or-b); }
.act-ic-d:hover { background:#fef2f2; color:#dc2626; border-color:#fecaca; }

/* urutan badge on node */
.tl-node-num { font-size:.8125rem; font-weight:800; }

/* modal */
.mo { position:fixed; inset:0; z-index:50; background:rgba(15,15,15,.55); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:1.5rem; animation:fi .15s ease; }
@keyframes fi { from{opacity:0} to{opacity:1} }
.mb { background:#fff; border-radius:20px; box-shadow:0 25px 60px rgba(0,0,0,.2); width:100%; max-width:460px; max-height:90vh; overflow-y:auto; animation:su .2s ease; }
@keyframes su { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
.mh { padding:1.375rem 1.5rem 1rem; border-bottom:1px solid var(--bd); display:flex; align-items:center; justify-content:space-between; gap:1rem; position:sticky; top:0; background:#fff; z-index:1; border-radius:20px 20px 0 0; }
.mt { font-size:1rem; font-weight:800; color:var(--t1); letter-spacing:-.02em; }
.mts { font-size:.75rem; color:var(--t2); margin-top:1px; }
.mc { width:32px; height:32px; border-radius:8px; background:var(--sf); border:1px solid var(--bd); cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--t2); transition:all .15s; flex-shrink:0; }
.mc:hover { background:#fee2e2; color:#dc2626; border-color:#fecaca; }
.mc svg { width:14px; height:14px; }
.mbdy { padding:1.375rem 1.5rem; }
.mf { padding:1rem 1.5rem; border-top:1px solid var(--bd); display:flex; justify-content:flex-end; gap:.625rem; background:var(--sf); border-radius:0 0 20px 20px; }

.fg { margin-bottom:1rem; }
.fl { display:block; font-size:.8125rem; font-weight:600; color:var(--t1); margin-bottom:.5rem; }
.fl-r::after { content:' *'; color:var(--or); }
.fi { width:100%; padding:.75rem .9375rem; border:1.5px solid var(--bd); border-radius:11px; font-size:.875rem; font-family:'Plus Jakarta Sans',sans-serif; color:var(--t1); background:var(--sf); outline:none; transition:border-color .15s,box-shadow .15s,background .15s; }
.fi::placeholder { color:var(--t3); }
.fi:focus { border-color:var(--or); box-shadow:0 0 0 3px rgba(242,101,34,.1); background:#fff; }
.fi-sel { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23a09890' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right .75rem center; background-size:14px; padding-right:2.25rem; }
.fg2 { display:grid; grid-template-columns:1fr 1fr; gap:.875rem; }
@media(max-width:480px){ .fg2 { grid-template-columns:1fr; } }

.hint { font-size:.75rem; color:var(--t3); margin-top:.375rem; }

.btn-g { display:inline-flex; align-items:center; gap:.375rem; padding:.5rem 1rem; background:#fff; color:var(--t2); font-size:.875rem; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; border:1.5px solid var(--bd); border-radius:9px; cursor:pointer; transition:all .15s; }
.btn-g:hover { background:var(--sf2); color:var(--t1); }
.btn-s { display:inline-flex; align-items:center; gap:.375rem; padding:.5rem 1.25rem; background:linear-gradient(135deg,var(--or),var(--or-d)); color:#fff; font-size:.875rem; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; border:none; border-radius:9px; cursor:pointer; transition:all .15s; box-shadow:0 3px 10px rgba(242,101,34,.3); }
.btn-s:hover { box-shadow:0 5px 14px rgba(242,101,34,.4); transform:translateY(-1px); }
.btn-s svg, .btn-g svg { width:14px; height:14px; }

/* tipe selector */
.tipe-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:.5rem; }
.tipe-opt { padding:.625rem .5rem; border-radius:10px; border:1.5px solid var(--bd); background:var(--sf); text-align:center; cursor:pointer; transition:all .15s; }
.tipe-opt:hover { border-color:var(--or-b); background:#fff; }
.tipe-opt-active { border-color:var(--or) !important; background:var(--or-l) !important; }
.tipe-opt-icon { font-size:1.25rem; margin-bottom:.25rem; }
.tipe-opt-lbl { font-size:.75rem; font-weight:700; color:var(--t2); }
.tipe-opt-active .tipe-opt-lbl { color:var(--or-d); }
`;

export default function TahapanIndex({ tahapan }: Props) {
    const { flash } = usePage().props as any;
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [form, setForm] = useState({ nama: '', tipe: 'bimbingan', urutan: 1, min_bab_sebelum: null as number | null, status: 'aktif', deskripsi: '' });

    const openCreate = () => { setEditMode(false); setSelectedId(null); setForm({ nama: '', tipe: 'bimbingan', urutan: 1, min_bab_sebelum: null, status: 'aktif', deskripsi: '' }); setShowModal(true); };
    const openEdit = (t: Tahapan) => { setEditMode(true); setSelectedId(t.id); setForm({ nama: t.nama, tipe: t.tipe, urutan: t.urutan, min_bab_sebelum: t.min_bab_sebelum, status: t.status, deskripsi: (t as any).deskripsi || '' }); setShowModal(true); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editMode && selectedId) { router.put(`/admin/tahapan/${selectedId}`, form, { onSuccess: () => setShowModal(false) }); } else { router.post('/admin/tahapan', form, { onSuccess: () => setShowModal(false) }); } };
    const confirmDelete = (t: Tahapan) => { setDeleteTarget({ id: t.id, nama: t.nama }); setShowDeleteModal(true); };
    const handleDelete = () => { if (deleteTarget) { router.delete(`/admin/tahapan/${deleteTarget.id}`, { onSuccess: () => { setShowDeleteModal(false); setDeleteTarget(null); } }); } };

    const nodeClass = (t: string) => ({ bimbingan: 'tl-node-bim', ujian: 'tl-node-uji', administrasi: 'tl-node-adm' }[t] || 'tl-node-bim');
    const tagClass = (t: string) => ({ bimbingan: 'tt-bim', ujian: 'tt-uji', administrasi: 'tt-adm' }[t] || 'tt-bim');
    const tipeLabel = (t: string) => ({ bimbingan: 'Bimbingan', ujian: 'Ujian', administrasi: 'Administrasi' }[t] || t);
    const tipeEmoji = (t: string) => ({ bimbingan: '📄', ujian: '📝', administrasi: '📋' }[t] || '📋');

    const sorted = [...tahapan].sort((a, b) => a.urutan - b.urutan);

    const tipeOpts = [
        { val: 'bimbingan', emoji: '📄', label: 'Bimbingan' },
        { val: 'ujian',     emoji: '📝', label: 'Ujian' },
        { val: 'administrasi', emoji: '📋', label: 'Administrasi' },
    ];

    return (
        <AppLayout title="Tahapan Bimbingan">
            <style>{S}</style>
            <div className="th">

                {/* Header */}
                <div className="th-hd">
                    <div>
                        <div className="th-bc">
                            <a href="/dashboard">Dashboard</a><span>›</span><span>Tahapan</span>
                        </div>
                        <div className="th-ttl">Tahapan Bimbingan</div>
                        <div className="th-sub">Atur tahapan dan alur bimbingan skripsi</div>
                    </div>
                    <button className="btn-p" onClick={openCreate}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Tambah Tahapan
                    </button>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="flash">
                        <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {flash.success}
                    </div>
                )}

                <div className="th-ct">
                    {sorted.length === 0 ? (
                        <div className="empty">
                            <div className="em-ic">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                            <div className="em-t">Belum ada tahapan</div>
                            <div className="em-d">Tambahkan tahapan bimbingan pertama Anda</div>
                            <button className="btn-p" style={{ margin: '0 auto' }} onClick={openCreate}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Tambah Tahapan
                            </button>
                        </div>
                    ) : (
                        <div className="tl">
                            {sorted.map((t, idx) => (
                                <div key={t.id} className="tl-item">
                                    {/* Left: node + line */}
                                    <div className="tl-left">
                                        <div className={`tl-node ${nodeClass(t.tipe)}`}>
                                            <span className="tl-node-num">{t.urutan}</span>
                                        </div>
                                        <div className={`tl-line${idx === sorted.length - 1 ? ' tl-line-last' : ''}`} />
                                    </div>

                                    {/* Card */}
                                    <div className="tl-card">
                                        <div className="tl-card-l">
                                            <div className="tl-name">{t.nama}</div>
                                            <div className="tl-tags">
                                                <span className={`tl-tag ${tagClass(t.tipe)}`}>
                                                    {tipeEmoji(t.tipe)} {tipeLabel(t.tipe)}
                                                </span>
                                                {t.status !== 'aktif' && (
                                                    <span className="tl-tag tt-off">Nonaktif</span>
                                                )}
                                                {t.min_bab_sebelum && (
                                                    <div className="tl-req">
                                                        <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        Min. {t.min_bab_sebelum} bab sebelum tahapan ini
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="tl-card-r">
                                            <button className="act-ic act-ic-e" onClick={() => openEdit(t)} title="Edit">
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button className="act-ic act-ic-d" onClick={() => confirmDelete(t)} title="Hapus">
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && deleteTarget && (
                    <div className="mo" onClick={e => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setDeleteTarget(null); } }}>
                        <div className="mb" style={{ maxWidth: '400px' }}>
                            <div className="mh">
                                <div>
                                    <div className="mt" style={{ color: '#dc2626' }}>Hapus Tahapan</div>
                                </div>
                                <button className="mc" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="mbdy" style={{ textAlign: 'center', padding: '1.75rem 1.5rem' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                    <svg style={{ width: '24px', height: '24px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </div>
                                <div style={{ fontSize: '.9375rem', fontWeight: 600, color: 'var(--t1)', marginBottom: '.5rem' }}>
                                    Yakin ingin menghapus tahapan ini?
                                </div>
                                <div style={{ fontSize: '.875rem', color: 'var(--t2)', background: 'var(--sf)', padding: '.5rem .75rem', borderRadius: '8px', display: 'inline-block' }}>
                                    <strong style={{ color: 'var(--t1)' }}>{deleteTarget.nama}</strong>
                                </div>
                                <div style={{ fontSize: '.75rem', color: 'var(--t3)', marginTop: '.75rem' }}>
                                    Data yang dihapus tidak dapat dikembalikan.
                                </div>
                            </div>
                            <div className="mf">
                                <button type="button" className="btn-g" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>
                                    Batal
                                </button>
                                <button type="button" onClick={handleDelete} style={{ display: 'inline-flex', alignItems: 'center', gap: '.375rem', padding: '.5rem 1.25rem', background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff', fontSize: '.875rem', fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", border: 'none', borderRadius: '9px', cursor: 'pointer', transition: 'all .15s', boxShadow: '0 3px 10px rgba(220,38,38,.3)' }}>
                                    <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Modal */}
                {showModal && (
                    <div className="mo" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
                        <div className="mb">
                            <div className="mh">
                                <div>
                                    <div className="mt">{editMode ? 'Edit Tahapan' : 'Tambah Tahapan Baru'}</div>
                                    <div className="mts">{editMode ? 'Perbarui informasi tahapan' : 'Isi detail tahapan yang akan ditambahkan'}</div>
                                </div>
                                <button className="mc" onClick={() => setShowModal(false)}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="mbdy">
                                    <div className="fg">
                                        <label className="fl fl-r">Nama Tahapan</label>
                                        <input className="fi" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Bimbingan Bab 1" required />
                                    </div>

                                    {/* Tipe selector */}
                                    <div className="fg">
                                        <label className="fl fl-r">Tipe Tahapan</label>
                                        <div className="tipe-grid">
                                            {tipeOpts.map(o => (
                                                <div
                                                    key={o.val}
                                                    className={`tipe-opt${form.tipe === o.val ? ' tipe-opt-active' : ''}`}
                                                    onClick={() => setForm({ ...form, tipe: o.val })}
                                                >
                                                    <div className="tipe-opt-icon">{o.emoji}</div>
                                                    <div className="tipe-opt-lbl">{o.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="fg2">
                                        <div className="fg">
                                            <label className="fl fl-r">Urutan</label>
                                            <input className="fi" type="number" value={form.urutan} onChange={e => setForm({ ...form, urutan: parseInt(e.target.value) || 1 })} required min={1} />
                                        </div>
                                        <div className="fg">
                                            <label className="fl">Status</label>
                                            <select className="fi fi-sel" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                                <option value="aktif">Aktif</option>
                                                <option value="nonaktif">Nonaktif</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="fg">
                                        <label className="fl">Min. Bab Sebelum <span style={{ color: 'var(--t3)', fontWeight: 400 }}>(opsional)</span></label>
                                        <input className="fi" type="number" value={form.min_bab_sebelum ?? ''} onChange={e => setForm({ ...form, min_bab_sebelum: e.target.value ? parseInt(e.target.value) : null })} placeholder="Kosongkan jika tidak ada syarat" min={0} />
                                        <div className="hint">Jumlah bab minimum yang harus diselesaikan sebelum tahapan ini</div>
                                    </div>
                                </div>
                                <div className="mf">
                                    <button type="button" className="btn-g" onClick={() => setShowModal(false)}>
                                        Batal
                                    </button>
                                    <button type="submit" className="btn-s">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        {editMode ? 'Update Tahapan' : 'Simpan'}
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