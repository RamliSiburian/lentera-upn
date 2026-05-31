import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { router, usePage } from '@inertiajs/react';

interface Step { step: string; label: string; role: string; required: boolean; }
interface Config { id: string; module_key: string; label: string; steps: Step[]; is_active: boolean; updated_by: string | null; updated_at: string | null; }
interface Props { configs: Config[]; }

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root{--or:#F26522;--or-d:#E85000;--or-l:rgba(242,101,34,0.08);--or-b:rgba(242,101,34,0.2);--sf:#faf8f5;--sf2:#f2ede6;--bd:#e8e3dc;--t1:#1a1714;--t2:#6b6560;--t3:#a09890;}
.ap{font-family:'Plus Jakarta Sans',sans-serif;background:var(--sf);min-height:100vh;}
.ap-hd{background:#fff;border-bottom:1px solid var(--bd);padding:1.25rem 1.75rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;}
.ap-bc{display:flex;align-items:center;gap:.375rem;font-size:.75rem;color:var(--t3);margin-bottom:.375rem;}
.ap-bc a{color:var(--t3);text-decoration:none;}.ap-bc a:hover{color:var(--or);}
.ap-ttl{font-size:1.25rem;font-weight:800;color:var(--t1);letter-spacing:-.025em;}
.ap-sub{font-size:.8125rem;color:var(--t2);margin-top:1px;}
.btn-p{display:inline-flex;align-items:center;gap:.5rem;padding:.625rem 1.125rem;background:linear-gradient(135deg,var(--or),var(--or-d));color:#fff;font-size:.875rem;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:none;border-radius:10px;cursor:pointer;transition:transform .15s,box-shadow .15s;box-shadow:0 4px 14px rgba(242,101,34,.32);white-space:nowrap;}
.btn-p:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(242,101,34,.42);}
.btn-p svg{width:15px;height:15px;}
.flash{margin:1rem 1.75rem 0;padding:.75rem 1rem;background:#f0fdf4;border:1px solid #86efac;border-radius:10px;font-size:.8125rem;color:#166534;display:flex;align-items:center;gap:.5rem;}
.ap-ct{padding:1.5rem 1.75rem;}
.empty{background:#fff;border:1.5px dashed var(--bd);border-radius:18px;padding:3.5rem 2rem;text-align:center;}
.em-ic{width:60px;height:60px;margin:0 auto 1.25rem;border-radius:16px;background:var(--or-l);border:1px solid var(--or-b);display:flex;align-items:center;justify-content:center;}
.em-ic svg{width:26px;height:26px;stroke:var(--or);}
.em-t{font-size:1rem;font-weight:700;color:var(--t1);margin-bottom:.375rem;}
.em-d{font-size:.875rem;color:var(--t2);margin-bottom:1.5rem;}
.ap-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:1.25rem;}
.ap-card{background:#fff;border:1px solid var(--bd);border-radius:16px;overflow:hidden;transition:box-shadow .2s,border-color .2s;}
.ap-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.07);border-color:var(--or-b);}
.ap-card-hd{padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;gap:.75rem;border-bottom:1px solid var(--sf2);}
.ap-card-ttl{font-size:.9375rem;font-weight:700;color:var(--t1);}
.ap-card-key{font-size:.6875rem;font-weight:600;color:var(--t3);background:var(--sf);padding:.175rem .5rem;border-radius:6px;font-family:monospace;}
.ap-card-bd{padding:1rem 1.25rem;}
.ap-steps{display:flex;flex-direction:column;gap:0;}
.ap-step{display:flex;align-items:flex-start;gap:.75rem;position:relative;padding-bottom:.75rem;}
.ap-step:last-child{padding-bottom:0;}
.ap-step-dot{width:28px;height:28px;border-radius:50%;background:var(--or-l);border:2px solid var(--or-b);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.625rem;font-weight:800;color:var(--or-d);position:relative;z-index:1;}
.ap-step:not(:last-child)::after{content:'';position:absolute;left:13px;top:28px;width:2px;height:calc(100% - 20px);background:var(--sf2);}
.ap-step-info{flex:1;}
.ap-step-lbl{font-size:.8125rem;font-weight:600;color:var(--t1);}
.ap-step-role{font-size:.6875rem;font-weight:600;padding:.125rem .375rem;border-radius:4px;display:inline-block;margin-top:2px;}
.role-admin{background:#dbeafe;color:#1d4ed8;}
.role-pimpinan{background:#fce7f3;color:#be185d;}
.role-dosen{background:#d1fae5;color:#065f46;}
.role-mahasiswa{background:#fef3c7;color:#92400e;}
.ap-card-ft{padding:.75rem 1.25rem;border-top:1px solid var(--sf2);display:flex;align-items:center;justify-content:space-between;background:var(--sf);}
.ap-status{font-size:.6875rem;font-weight:700;padding:.2rem .625rem;border-radius:999px;}
.st-on{background:#f0fdf4;color:#166534;border:1px solid #86efac;}
.st-off{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;}
.ap-actions{display:flex;gap:.25rem;}
.act-ic{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;border:1px solid transparent;cursor:pointer;background:none;transition:all .15s;color:var(--t3);}
.act-ic svg{width:13px;height:13px;stroke:currentColor;}
.act-ic-e:hover{background:var(--or-l);color:var(--or-d);border-color:var(--or-b);}
.act-ic-d:hover{background:#fef2f2;color:#dc2626;border-color:#fecaca;}
.mo{position:fixed;inset:0;z-index:50;background:rgba(15,15,15,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1.5rem;animation:fi .15s ease;}
@keyframes fi{from{opacity:0}to{opacity:1}}
.mb{background:#fff;border-radius:20px;box-shadow:0 25px 60px rgba(0,0,0,.2);width:100%;max-width:540px;max-height:90vh;overflow-y:auto;animation:su .2s ease;}
@keyframes su{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.mh{padding:1.375rem 1.5rem 1rem;border-bottom:1px solid var(--bd);display:flex;align-items:center;justify-content:space-between;gap:1rem;position:sticky;top:0;background:#fff;z-index:1;border-radius:20px 20px 0 0;}
.mt{font-size:1rem;font-weight:800;color:var(--t1);letter-spacing:-.02em;}
.mts{font-size:.75rem;color:var(--t2);margin-top:1px;}
.mc{width:32px;height:32px;border-radius:8px;background:var(--sf);border:1px solid var(--bd);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--t2);transition:all .15s;flex-shrink:0;}
.mc:hover{background:#fee2e2;color:#dc2626;border-color:#fecaca;}
.mc svg{width:14px;height:14px;}
.mbdy{padding:1.375rem 1.5rem;}
.mf{padding:1rem 1.5rem;border-top:1px solid var(--bd);display:flex;justify-content:flex-end;gap:.625rem;background:var(--sf);border-radius:0 0 20px 20px;}
.fg{margin-bottom:1rem;}
.fl{display:block;font-size:.8125rem;font-weight:600;color:var(--t1);margin-bottom:.5rem;}
.fl-r::after{content:' *';color:var(--or);}
.fi{width:100%;padding:.75rem .9375rem;border:1.5px solid var(--bd);border-radius:11px;font-size:.875rem;font-family:'Plus Jakarta Sans',sans-serif;color:var(--t1);background:var(--sf);outline:none;transition:border-color .15s,box-shadow .15s,background .15s;}
.fi::placeholder{color:var(--t3);}
.fi:focus{border-color:var(--or);box-shadow:0 0 0 3px rgba(242,101,34,.1);background:#fff;}
.fi-sel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23a09890' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .75rem center;background-size:14px;padding-right:2.25rem;}
.fg2{display:grid;grid-template-columns:1fr 1fr;gap:.875rem;}
.btn-g{display:inline-flex;align-items:center;gap:.375rem;padding:.5rem 1rem;background:#fff;color:var(--t2);font-size:.875rem;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;border:1.5px solid var(--bd);border-radius:9px;cursor:pointer;transition:all .15s;}
.btn-g:hover{background:var(--sf2);color:var(--t1);}
.btn-s{display:inline-flex;align-items:center;gap:.375rem;padding:.5rem 1.25rem;background:linear-gradient(135deg,var(--or),var(--or-d));color:#fff;font-size:.875rem;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:none;border-radius:9px;cursor:pointer;transition:all .15s;box-shadow:0 3px 10px rgba(242,101,34,.3);}
.btn-s:hover{box-shadow:0 5px 14px rgba(242,101,34,.4);transform:translateY(-1px);}
.btn-s svg,.btn-g svg{width:14px;height:14px;}
.step-item{border:1px solid var(--bd);border-radius:11px;padding:.875rem;background:var(--sf);margin-bottom:.625rem;position:relative;}
.step-item-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:.625rem;}
.step-num{font-size:.75rem;font-weight:700;color:var(--or-d);background:var(--or-l);padding:.125rem .5rem;border-radius:6px;border:1px solid var(--or-b);}
.step-rm{width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;background:none;border:none;color:var(--t3);cursor:pointer;transition:all .15s;}
.step-rm:hover{background:#fef2f2;color:#dc2626;}
.step-rm svg{width:12px;height:12px;}
.step-fg2{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;}
.btn-add-step{display:flex;align-items:center;gap:.375rem;padding:.5rem .875rem;font-size:.8125rem;font-weight:600;color:var(--or-d);background:var(--or-l);border:1.5px dashed var(--or-b);border-radius:9px;cursor:pointer;width:100%;justify-content:center;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;}
.btn-add-step:hover{background:#fff;border-color:var(--or);}
.btn-add-step svg{width:14px;height:14px;}
@media(max-width:480px){.fg2,.step-fg2{grid-template-columns:1fr;}.ap-grid{grid-template-columns:1fr;}}
`;

const roleOpts = [
    { value: 'admin', label: 'Admin' },
    { value: 'pimpinan', label: 'Pimpinan' },
    { value: 'k.prodi', label: 'Kaprodi' },
    { value: 'dosen', label: 'Dosen' },
    { value: 'mahasiswa', label: 'Mahasiswa' },
];

const stepOptsByModule: Record<string, { value: string; label: string; defaultLabel: string; defaultRole: string; }[]> = {
    judul_pengajuan: [
        { value: 'submitted', label: 'Diajukan (submitted)', defaultLabel: 'Diajukan', defaultRole: 'admin' },
        { value: 'verified_admin', label: 'Verifikasi Admin (verified_admin)', defaultLabel: 'Verifikasi Admin', defaultRole: 'admin' },
        { value: 'approved_kaprodi', label: 'Disetujui Kaprodi (approved_kaprodi)', defaultLabel: 'Persetujuan Kaprodi', defaultRole: 'pimpinan' },
        { value: 'approved', label: 'Disetujui (approved)', defaultLabel: 'Disetujui', defaultRole: 'pimpinan' },
        { value: 'rejected', label: 'Ditolak (rejected)', defaultLabel: 'Ditolak', defaultRole: 'admin' }
    ],
    pembimbing: [
        { value: 'requested', label: 'Diajukan (requested)', defaultLabel: 'Diajukan', defaultRole: 'admin' },
        { value: 'verified_admin', label: 'Verifikasi Admin (verified_admin)', defaultLabel: 'Verifikasi Admin', defaultRole: 'admin' },
        { value: 'approved', label: 'Disetujui (approved)', defaultLabel: 'Disetujui', defaultRole: 'pimpinan' },
        { value: 'rejected', label: 'Ditolak (rejected)', defaultLabel: 'Ditolak', defaultRole: 'admin' }
    ],
    bimbingan: [
        { value: 'submitted', label: 'Diajukan (submitted)', defaultLabel: 'Diajukan', defaultRole: 'dosen' },
        { value: 'in_review', label: 'Review (in_review)', defaultLabel: 'Review Pembimbing', defaultRole: 'dosen' },
        { value: 'approved', label: 'Disetujui (approved)', defaultLabel: 'Disetujui', defaultRole: 'dosen' },
        { value: 'rejected', label: 'Ditolak (rejected)', defaultLabel: 'Ditolak', defaultRole: 'dosen' }
    ],
    ujian: [
        { value: 'submitted', label: 'Diajukan (submitted)', defaultLabel: 'Diajukan', defaultRole: 'admin' },
        { value: 'reviewed', label: 'Direview (reviewed)', defaultLabel: 'Direview', defaultRole: 'admin' },
        { value: 'approved', label: 'Disetujui (approved)', defaultLabel: 'Disetujui', defaultRole: 'pimpinan' },
        { value: 'rejected', label: 'Ditolak (rejected)', defaultLabel: 'Ditolak', defaultRole: 'admin' }
    ],
    penilaian: [
        { value: 'penguji_input', label: 'Input Penguji (penguji_input)', defaultLabel: 'Input Nilai Penguji', defaultRole: 'dosen' },
        { value: 'approved', label: 'Disetujui (approved)', defaultLabel: 'Disetujui', defaultRole: 'pimpinan' },
        { value: 'rejected', label: 'Ditolak (rejected)', defaultLabel: 'Ditolak', defaultRole: 'pimpinan' }
    ]
};

const roleClass = (r: string) => {
    if (r === 'admin') return 'role-admin';
    if (r === 'pimpinan' || r === 'k.prodi') return 'role-pimpinan';
    if (r === 'dosen') return 'role-dosen';
    return 'role-mahasiswa';
};

const defaultStep = (): Step => ({ step: '', label: '', role: 'admin', required: true });

export default function ApprovalIndex({ configs }: Props) {
    const { flash } = usePage().props as any;
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [form, setForm] = useState({ module_key: '', label: '', steps: [defaultStep()], is_active: true });

    const openCreate = () => {
        setEditMode(false); setSelectedId(null);
        setForm({ module_key: '', label: '', steps: [defaultStep()], is_active: true });
        setShowModal(true);
    };
    const openEdit = (c: Config) => {
        setEditMode(true); setSelectedId(c.id);
        setForm({ module_key: c.module_key, label: c.label, steps: c.steps.length ? c.steps : [defaultStep()], is_active: c.is_active });
        setShowModal(true);
    };
    const confirmDelete = (c: Config) => { setDeleteTarget({ id: c.id, label: c.label }); setShowDeleteModal(true); };
    const handleDelete = () => { if (deleteTarget) { router.delete(`/admin/approval/${deleteTarget.id}`, { onSuccess: () => { setShowDeleteModal(false); setDeleteTarget(null); } }); } };

    const updateStep = (idx: number, field: keyof Step, value: any) => {
        const steps = [...form.steps];
        steps[idx] = { ...steps[idx], [field]: value };
        setForm({ ...form, steps });
    };
    const handleStepKeyChange = (idx: number, stepVal: string) => {
        const steps = [...form.steps];
        const opts = stepOptsByModule[form.module_key] || [];
        const matchedOpt = opts.find(opt => opt.value === stepVal);
        steps[idx] = {
            ...steps[idx],
            step: stepVal,
            label: matchedOpt ? matchedOpt.defaultLabel : (steps[idx].label || ''),
            role: matchedOpt ? matchedOpt.defaultRole : (steps[idx].role || 'admin')
        };
        setForm({ ...form, steps });
    };
    const addStep = () => setForm({ ...form, steps: [...form.steps, defaultStep()] });
    const removeStep = (idx: number) => { const steps = form.steps.filter((_, i) => i !== idx); setForm({ ...form, steps: steps.length ? steps : [defaultStep()] }); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...form, steps: form.steps.map(s => ({ ...s })) } as Record<string, any>;
        if (editMode && selectedId) {
            router.put(`/admin/approval/${selectedId}`, payload, { onSuccess: () => setShowModal(false) });
        } else {
            router.post('/admin/approval', payload, { onSuccess: () => setShowModal(false) });
        }
    };

    return (
        <AppLayout title="Approval Config">
            <style>{S}</style>
            <div className="ap">
                <div className="ap-hd">
                    <div>
                        <div className="ap-bc"><a href="/dashboard">Dashboard</a><span>›</span><span>Approval Config</span></div>
                        <div className="ap-ttl">Approval Configuration</div>
                        <div className="ap-sub">Atur alur approval untuk setiap modul</div>
                    </div>
                    <button className="btn-p" onClick={openCreate}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Tambah Config
                    </button>
                </div>

                {flash?.success && (
                    <div className="flash">
                        <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {flash.success}
                    </div>
                )}

                <div className="ap-ct">
                    {configs.length === 0 ? (
                        <div className="empty">
                            <div className="em-ic"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
                            <div className="em-t">Belum ada approval config</div>
                            <div className="em-d">Tambahkan konfigurasi approval pertama Anda</div>
                            <button className="btn-p" style={{ margin: '0 auto' }} onClick={openCreate}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Tambah Config
                            </button>
                        </div>
                    ) : (
                        <div className="ap-grid">
                            {configs.map(c => (
                                <div key={c.id} className="ap-card">
                                    <div className="ap-card-hd">
                                        <div>
                                            <div className="ap-card-ttl">{c.label}</div>
                                            <div className="ap-card-key">{c.module_key}</div>
                                        </div>
                                    </div>
                                    <div className="ap-card-bd">
                                        <div className="ap-steps">
                                            {(c.steps || []).map((s, i) => (
                                                <div key={i} className="ap-step">
                                                    <div className="ap-step-dot">{i + 1}</div>
                                                    <div className="ap-step-info">
                                                        <div className="ap-step-lbl">{s.label}</div>
                                                        <span className={`ap-step-role ${roleClass(s.role)}`}>{s.role}</span>
                                                        {!s.required && <span style={{ fontSize: '.625rem', color: 'var(--t3)', marginLeft: '.375rem' }}>(opsional)</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="ap-card-ft">
                                        <span className={`ap-status ${c.is_active ? 'st-on' : 'st-off'}`}>
                                            {c.is_active ? '● Aktif' : '● Nonaktif'}
                                        </span>
                                        <div className="ap-actions">
                                            <button className="act-ic act-ic-e" onClick={() => openEdit(c)} title="Edit">
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button className="act-ic act-ic-d" onClick={() => confirmDelete(c)} title="Hapus">
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Delete Modal */}
                {showDeleteModal && deleteTarget && (
                    <div className="mo" onClick={e => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setDeleteTarget(null); } }}>
                        <div className="mb" style={{ maxWidth: '400px' }}>
                            <div className="mh">
                                <div className="mt" style={{ color: '#dc2626' }}>Hapus Config</div>
                                <button className="mc" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1.75rem 1.5rem' }}>
                                <div style={{ fontSize: '.9375rem', fontWeight: 600, color: 'var(--t1)', marginBottom: '.5rem' }}>Yakin ingin menghapus config ini?</div>
                                <div style={{ fontSize: '.875rem', color: 'var(--t2)', background: 'var(--sf)', padding: '.5rem .75rem', borderRadius: '8px', display: 'inline-block' }}><strong style={{ color: 'var(--t1)' }}>{deleteTarget.label}</strong></div>
                            </div>
                            <div className="mf">
                                <button type="button" className="btn-g" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>Batal</button>
                                <button type="button" onClick={handleDelete} style={{ display: 'inline-flex', alignItems: 'center', gap: '.375rem', padding: '.5rem 1.25rem', background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff', fontSize: '.875rem', fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", border: 'none', borderRadius: '9px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(220,38,38,.3)' }}>Ya, Hapus</button>
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
                                    <div className="mt">{editMode ? 'Edit Approval Config' : 'Tambah Approval Config'}</div>
                                    <div className="mts">{editMode ? 'Perbarui konfigurasi approval' : 'Isi detail konfigurasi approval'}</div>
                                </div>
                                <button className="mc" onClick={() => setShowModal(false)}><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="mbdy">
                                    <div className="fg">
                                        <label className="fl fl-r">Module Key</label>
                                        <input className="fi" value={form.module_key} onChange={e => setForm({ ...form, module_key: e.target.value })} placeholder="contoh: judul_pengajuan" required disabled={editMode} />
                                    </div>
                                    <div className="fg">
                                        <label className="fl fl-r">Label</label>
                                        <input className="fi" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="contoh: Approval Pengajuan Judul" required />
                                    </div>

                                    <div className="fg">
                                        <label className="fl fl-r">Langkah Approval</label>
                                        {form.steps.map((s, i) => (
                                            <div key={i} className="step-item">
                                                <div className="step-item-hd">
                                                    <span className="step-num">Step {i + 1}</span>
                                                    {form.steps.length > 1 && (
                                                        <button type="button" className="step-rm" onClick={() => removeStep(i)}>
                                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                                <div style={{ marginBottom: '.5rem' }}>
                                                    <input className="fi" style={{ marginBottom: '.375rem' }} value={s.step} onChange={e => updateStep(i, 'step', e.target.value)} placeholder="Step key (contoh: verified_admin)" required />
                                                    <input className="fi" value={s.label} onChange={e => updateStep(i, 'label', e.target.value)} placeholder="Label (contoh: Verifikasi Admin)" required />
                                                </div>
                                                <div className="step-fg2">
                                                    <select className="fi fi-sel" value={s.role} onChange={e => updateStep(i, 'role', e.target.value)}>
                                                        {roleOpts.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                                    </select>
                                                    <select className="fi fi-sel" value={s.required ? 'true' : 'false'} onChange={e => updateStep(i, 'required', e.target.value === 'true')}>
                                                        <option value="true">Wajib</option>
                                                        <option value="false">Opsional</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" className="btn-add-step" onClick={addStep}>
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Tambah Langkah
                                        </button>
                                    </div>

                                    <div className="fg">
                                        <label className="fl">Status</label>
                                        <select className="fi fi-sel" value={form.is_active ? 'true' : 'false'} onChange={e => setForm({ ...form, is_active: e.target.value === 'true' })}>
                                            <option value="true">Aktif</option>
                                            <option value="false">Nonaktif</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mf">
                                    <button type="button" className="btn-g" onClick={() => setShowModal(false)}>Batal</button>
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