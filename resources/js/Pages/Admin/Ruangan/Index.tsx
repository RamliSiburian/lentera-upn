import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { router, usePage } from '@inertiajs/react';

interface Ruangan { id: string; nama: string; gedung: string; lantai: number; kapasitas: number; status: string; }
interface Props { ruangan: Ruangan[]; }

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root {
    --or: #F26522; --or-d: #E85000;
    --or-l: rgba(242,101,34,0.08); --or-b: rgba(242,101,34,0.2);
    --sf: #faf8f5; --sf2: #f2ede6; --bd: #e8e3dc;
    --t1: #1a1714; --t2: #6b6560; --t3: #a09890;
}
.rg { font-family:'Plus Jakarta Sans',sans-serif; background:var(--sf); min-height:100vh; }

/* header */
.rg-hd { background:#fff; border-bottom:1px solid var(--bd); padding:1.25rem 1.75rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
.rg-bc { display:flex; align-items:center; gap:.375rem; font-size:.75rem; color:var(--t3); margin-bottom:.375rem; }
.rg-bc a { color:var(--t3); text-decoration:none; } .rg-bc a:hover { color:var(--or); }
.rg-ttl { font-size:1.25rem; font-weight:800; color:var(--t1); letter-spacing:-.025em; }
.rg-sub { font-size:.8125rem; color:var(--t2); margin-top:1px; }

.btn-p { display:inline-flex; align-items:center; gap:.5rem; padding:.625rem 1.125rem; background:linear-gradient(135deg,var(--or),var(--or-d)); color:#fff; font-size:.875rem; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; border:none; border-radius:10px; cursor:pointer; transition:transform .15s,box-shadow .15s; box-shadow:0 4px 14px rgba(242,101,34,.32); white-space:nowrap; }
.btn-p:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(242,101,34,.42); }
.btn-p svg { width:15px; height:15px; }

.flash { margin:1rem 1.75rem 0; padding:.75rem 1rem; background:#f0fdf4; border:1px solid #86efac; border-radius:10px; font-size:.8125rem; color:#166534; display:flex; align-items:center; gap:.5rem; }

.rg-ct { padding:1.5rem 1.75rem; }

/* stat cards */
.stat-g { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.5rem; }
@media(max-width:640px){ .stat-g { grid-template-columns:1fr; } }

.sc { background:#fff; border:1px solid var(--bd); border-radius:16px; padding:1.25rem 1.375rem; display:flex; align-items:center; gap:1rem; position:relative; overflow:hidden; transition:box-shadow .2s; }
.sc:hover { box-shadow:0 4px 16px rgba(0,0,0,.07); }
.sc::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; }
.sc-or::before { background:linear-gradient(180deg,var(--or),var(--or-d)); }
.sc-gr::before { background:linear-gradient(180deg,#22c55e,#16a34a); }
.sc-vi::before { background:linear-gradient(180deg,#a855f7,#7c3aed); }

.sc-ic { width:44px; height:44px; flex-shrink:0; border-radius:12px; display:flex; align-items:center; justify-content:center; }
.ic-or { background:var(--or-l); } .ic-or svg { stroke:var(--or); }
.ic-gr { background:rgba(34,197,94,.1); } .ic-gr svg { stroke:#16a34a; }
.ic-vi { background:rgba(168,85,247,.1); } .ic-vi svg { stroke:#a855f7; }
.sc-ic svg { width:20px; height:20px; }
.sc-lbl { font-size:.75rem; color:var(--t2); font-weight:500; }
.sc-val { font-size:1.5rem; font-weight:800; color:var(--t1); letter-spacing:-.03em; line-height:1.1; }

/* search */
.srch { position:relative; margin-bottom:1rem; }
.srch-ic { position:absolute; left:.875rem; top:50%; transform:translateY(-50%); color:var(--t3); pointer-events:none; }
.srch-ic svg { width:15px; height:15px; stroke:currentColor; }
.srch-inp { width:100%; max-width:380px; padding:.75rem .875rem .75rem 2.5rem; border:1.5px solid var(--bd); border-radius:11px; font-size:.875rem; font-family:'Plus Jakarta Sans',sans-serif; color:var(--t1); background:#fff; outline:none; transition:border-color .15s,box-shadow .15s; }
.srch-inp::placeholder { color:var(--t3); }
.srch-inp:focus { border-color:var(--or); box-shadow:0 0 0 3px rgba(242,101,34,.1); }

/* card grid */
.card-g { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem; }

.rc { background:#fff; border:1px solid var(--bd); border-radius:16px; overflow:hidden; transition:box-shadow .2s,transform .2s; }
.rc:hover { box-shadow:0 6px 24px rgba(0,0,0,.08); transform:translateY(-2px); }

.rc-top { padding:1.125rem 1.25rem .875rem; display:flex; align-items:flex-start; justify-content:space-between; gap:.75rem; }

.rc-icon { width:46px; height:46px; border-radius:13px; background:var(--or-l); border:1.5px solid var(--or-b); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.rc-icon svg { width:22px; height:22px; stroke:var(--or); }

.rc-name { font-size:.9375rem; font-weight:700; color:var(--t1); line-height:1.3; }
.rc-loc { font-size:.75rem; color:var(--t3); margin-top:.2rem; display:flex; align-items:center; gap:.3rem; }
.rc-loc svg { width:11px; height:11px; stroke:currentColor; flex-shrink:0; }

/* status pill */
.sp { display:inline-flex; align-items:center; gap:.3rem; padding:.2rem .625rem; border-radius:999px; font-size:.6875rem; font-weight:700; white-space:nowrap; }
.sp-dot { width:6px; height:6px; border-radius:50%; }
.sp-g { background:#f0fdf4; color:#16a34a; } .sp-g .sp-dot { background:#22c55e; }
.sp-r { background:#fef2f2; color:#dc2626; } .sp-r .sp-dot { background:#ef4444; }

/* divider */
.rc-div { height:1px; background:var(--sf2); margin:0 1.25rem; }

/* info row */
.rc-info { display:flex; padding:.875rem 1.25rem; gap:.5rem; }
.ri { flex:1; text-align:center; }
.ri-val { font-size:1.0625rem; font-weight:800; color:var(--t1); letter-spacing:-.02em; }
.ri-lbl { font-size:.6875rem; color:var(--t3); margin-top:1px; font-weight:500; }
.ri-sep { width:1px; background:var(--sf2); }

/* actions */
.rc-act { padding:.75rem 1.25rem; border-top:1px solid var(--sf2); display:flex; gap:.5rem; }
.ab { flex:1; display:flex; align-items:center; justify-content:center; gap:.375rem; padding:.4375rem 0; border-radius:8px; font-size:.8125rem; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; border:none; cursor:pointer; transition:all .15s; }
.ab svg { width:13px; height:13px; stroke:currentColor; }
.ab-edit { background:var(--sf); color:var(--t2); border:1px solid var(--bd); }
.ab-edit:hover { background:var(--or-l); color:var(--or-d); border-color:var(--or-b); }
.ab-del  { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
.ab-del:hover  { background:#fee2e2; }

/* empty */
.empty { background:#fff; border:1.5px dashed var(--bd); border-radius:18px; padding:3.5rem 2rem; text-align:center; }
.em-ic { width:60px; height:60px; margin:0 auto 1.25rem; border-radius:16px; background:var(--or-l); border:1px solid var(--or-b); display:flex; align-items:center; justify-content:center; }
.em-ic svg { width:26px; height:26px; stroke:var(--or); }
.em-t { font-size:1rem; font-weight:700; color:var(--t1); margin-bottom:.375rem; }
.em-d { font-size:.875rem; color:var(--t2); margin-bottom:1.5rem; }

/* modal */
.mo { position:fixed; inset:0; z-index:50; background:rgba(15,15,15,.55); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:1.5rem; animation:fi .15s ease; }
@keyframes fi { from{opacity:0} to{opacity:1} }
.mb { background:#fff; border-radius:20px; box-shadow:0 25px 60px rgba(0,0,0,.2); width:100%; max-width:480px; max-height:90vh; overflow-y:auto; animation:su .2s ease; }
@keyframes su { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
.mh { padding:1.375rem 1.5rem 1rem; border-bottom:1px solid var(--bd); display:flex; align-items:center; justify-content:space-between; gap:1rem; position:sticky; top:0; background:#fff; z-index:1; border-radius:20px 20px 0 0; }
.mt { font-size:1rem; font-weight:800; color:var(--t1); letter-spacing:-.02em; }
.mts { font-size:.75rem; color:var(--t2); margin-top:1px; }
.mc { width:32px; height:32px; border-radius:8px; background:var(--sf); border:1px solid var(--bd); cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--t2); transition:all .15s; flex-shrink:0; }
.mc:hover { background:#fee2e2; color:#dc2626; border-color:#fecaca; }
.mc svg { width:14px; height:14px; }
.mbdy { padding:1.375rem 1.5rem; }
.mf { padding:1rem 1.5rem; border-top:1px solid var(--bd); display:flex; justify-content:flex-end; gap:.625rem; background:var(--sf); border-radius:0 0 20px 20px; }

/* form */
.fg { margin-bottom:1rem; }
.fl { display:block; font-size:.8125rem; font-weight:600; color:var(--t1); margin-bottom:.5rem; }
.fl-r::after { content:' *'; color:var(--or); }
.fi-inp, .fi-sel { width:100%; padding:.75rem .9375rem; border:1.5px solid var(--bd); border-radius:11px; font-size:.875rem; font-family:'Plus Jakarta Sans',sans-serif; color:var(--t1); background:var(--sf); outline:none; transition:border-color .15s,box-shadow .15s,background .15s; }
.fi-inp::placeholder { color:var(--t3); }
.fi-inp:focus, .fi-sel:focus { border-color:var(--or); box-shadow:0 0 0 3px rgba(242,101,34,.1); background:#fff; }
.fi-sel { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23a09890' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right .75rem center; background-size:14px; padding-right:2.25rem; }
.fg3 { display:grid; grid-template-columns:repeat(3,1fr); gap:.75rem; }
@media(max-width:480px){ .fg3 { grid-template-columns:1fr; } }

.btn-g { display:inline-flex; align-items:center; gap:.375rem; padding:.5rem 1rem; background:#fff; color:var(--t2); font-size:.875rem; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; border:1.5px solid var(--bd); border-radius:9px; cursor:pointer; transition:all .15s; }
.btn-g:hover { background:var(--sf2); color:var(--t1); }
.btn-s { display:inline-flex; align-items:center; gap:.375rem; padding:.5rem 1.25rem; background:linear-gradient(135deg,var(--or),var(--or-d)); color:#fff; font-size:.875rem; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; border:none; border-radius:9px; cursor:pointer; transition:all .15s; box-shadow:0 3px 10px rgba(242,101,34,.3); }
.btn-s:hover { box-shadow:0 5px 14px rgba(242,101,34,.4); transform:translateY(-1px); }
.btn-s svg, .btn-g svg { width:14px; height:14px; }
`;

export default function RuanganIndex({ ruangan }: Props) {
    const { flash } = usePage().props as any;
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ nama: '', gedung: '', lantai: 1, kapasitas: 30, status: 'tersedia' });

    const openCreate = () => { setEditMode(false); setSelectedId(null); setForm({ nama: '', gedung: '', lantai: 1, kapasitas: 30, status: 'tersedia' }); setShowModal(true); };
    const openEdit = (r: Ruangan) => { setEditMode(true); setSelectedId(r.id); setForm({ nama: r.nama, gedung: r.gedung || '', lantai: r.lantai || 1, kapasitas: r.kapasitas || 30, status: r.status }); setShowModal(true); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editMode && selectedId) { router.put(`/admin/ruangan/${selectedId}`, form, { onSuccess: () => setShowModal(false) }); } else { router.post('/admin/ruangan', form, { onSuccess: () => setShowModal(false) }); } };
    const handleDelete = (id: string) => { if (confirm('Yakin ingin menghapus ruangan ini?')) router.delete(`/admin/ruangan/${id}`); };

    const filtered = ruangan.filter(r =>
        r.nama.toLowerCase().includes(search.toLowerCase()) ||
        (r.gedung || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout title="Ruangan">
            <style>{S}</style>
            <div className="rg">

                {/* Header */}
                <div className="rg-hd">
                    <div>
                        <div className="rg-bc">
                            <a href="/dashboard">Dashboard</a><span>›</span><span>Ruangan</span>
                        </div>
                        <div className="rg-ttl">Manajemen Ruangan</div>
                        <div className="rg-sub">Kelola ruangan untuk ujian dan bimbingan</div>
                    </div>
                    <button className="btn-p" onClick={openCreate}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Tambah Ruangan
                    </button>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="flash">
                        <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {flash.success}
                    </div>
                )}

                <div className="rg-ct">

                    {/* Stats */}
                    <div className="stat-g">
                        <div className="sc sc-or">
                            <div className="sc-ic ic-or"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>
                            <div><div className="sc-lbl">Total Ruangan</div><div className="sc-val">{ruangan.length}</div></div>
                        </div>
                        <div className="sc sc-gr">
                            <div className="sc-ic ic-gr"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                            <div><div className="sc-lbl">Tersedia</div><div className="sc-val">{ruangan.filter(r => r.status === 'tersedia').length}</div></div>
                        </div>
                        <div className="sc sc-vi">
                            <div className="sc-ic ic-vi"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                            <div><div className="sc-lbl">Total Kapasitas</div><div className="sc-val">{ruangan.reduce((a, r) => a + (r.kapasitas || 0), 0)}</div></div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="srch">
                        <div className="srch-ic"><svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                        <input className="srch-inp" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau gedung..." />
                    </div>

                    {/* Cards */}
                    {filtered.length === 0 ? (
                        <div className="empty">
                            <div className="em-ic"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" /></svg></div>
                            <div className="em-t">Tidak ada ruangan</div>
                            <div className="em-d">Belum ada data ruangan atau tidak cocok dengan pencarian</div>
                            <button className="btn-p" style={{ margin: '0 auto' }} onClick={openCreate}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Tambah Ruangan
                            </button>
                        </div>
                    ) : (
                        <div className="card-g">
                            {filtered.map(r => (
                                <div key={r.id} className="rc">
                                    <div className="rc-top">
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                                            <div className="rc-icon">
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            </div>
                                            <div>
                                                <div className="rc-name">{r.nama}</div>
                                                {r.gedung && (
                                                    <div className="rc-loc">
                                                        <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                        Gedung {r.gedung}{r.lantai ? `, Lt. ${r.lantai}` : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`sp ${r.status === 'tersedia' ? 'sp-g' : 'sp-r'}`}>
                                            <span className="sp-dot" />
                                            {r.status === 'tersedia' ? 'Tersedia' : 'Tutup'}
                                        </span>
                                    </div>

                                    <div className="rc-div" />

                                    <div className="rc-info">
                                        <div className="ri">
                                            <div className="ri-val">{r.lantai || '—'}</div>
                                            <div className="ri-lbl">Lantai</div>
                                        </div>
                                        <div className="ri-sep" />
                                        <div className="ri">
                                            <div className="ri-val">{r.kapasitas}</div>
                                            <div className="ri-lbl">Kapasitas</div>
                                        </div>
                                        <div className="ri-sep" />
                                        <div className="ri">
                                            <div className="ri-val" style={{ fontSize: '0.875rem' }}>{r.gedung || '—'}</div>
                                            <div className="ri-lbl">Gedung</div>
                                        </div>
                                    </div>

                                    <div className="rc-act">
                                        <button className="ab ab-edit" onClick={() => openEdit(r)}>
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Edit
                                        </button>
                                        <button className="ab ab-del" onClick={() => handleDelete(r.id)}>
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="mo" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
                        <div className="mb">
                            <div className="mh">
                                <div>
                                    <div className="mt">{editMode ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}</div>
                                    <div className="mts">{editMode ? 'Perbarui informasi ruangan' : 'Isi detail ruangan yang akan ditambahkan'}</div>
                                </div>
                                <button className="mc" onClick={() => setShowModal(false)}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="mbdy">
                                    <div className="fg">
                                        <label className="fl fl-r">Nama Ruangan</label>
                                        <input className="fi-inp" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Ruang 101" required />
                                    </div>
                                    <div className="fg3">
                                        <div className="fg">
                                            <label className="fl">Gedung</label>
                                            <input className="fi-inp" value={form.gedung} onChange={e => setForm({ ...form, gedung: e.target.value })} placeholder="Gedung A" />
                                        </div>
                                        <div className="fg">
                                            <label className="fl">Lantai</label>
                                            <input className="fi-inp" type="number" value={form.lantai} onChange={e => setForm({ ...form, lantai: parseInt(e.target.value) || 1 })} />
                                        </div>
                                        <div className="fg">
                                            <label className="fl fl-r">Kapasitas</label>
                                            <input className="fi-inp" type="number" value={form.kapasitas} onChange={e => setForm({ ...form, kapasitas: parseInt(e.target.value) || 30 })} />
                                        </div>
                                    </div>
                                    <div className="fg">
                                        <label className="fl">Status</label>
                                        <select className="fi-sel" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                            <option value="tersedia">Tersedia</option>
                                            <option value="tidak_tersedia">Tidak Tersedia</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mf">
                                    <button type="button" className="btn-g" onClick={() => setShowModal(false)}>
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        Batal
                                    </button>
                                    <button type="submit" className="btn-s">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
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