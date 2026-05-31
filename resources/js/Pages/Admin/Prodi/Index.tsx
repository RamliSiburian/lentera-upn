import React, { useState, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { router, usePage, useForm } from '@inertiajs/react';
import { Modal, SearchInput, Button, Input, PageHeader, FlashMessage, Badge, EmptyState, StatCard } from '@/Components/UI';

interface Prodi {
    id: string;
    kode: string;
    nama: string;
    jenjang: string;
    deskripsi: string | null;
    kaprodi_id: string | null;
    is_active: boolean;
    mahasiswa_count: number;
    kaprodi: { id: string; user: { name: string } } | null;
}
interface DosenOption { id: string; name: string; nidn: string; kategori: string; }
interface Props { prodis: Prodi[]; dosenList: DosenOption[]; }

const jenjangOptions = [
    { value: 'D3', label: 'D3 - Diploma 3' },
    { value: 'S1', label: 'S1 - Sarjana' },
    { value: 'S2', label: 'S2 - Magister' },
    { value: 'S3', label: 'S3 - Doktor' },
];

export default function ProdiIndex({ prodis, dosenList }: Props) {
    const { flash } = usePage().props as any;
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        kode: '',
        nama: '',
        jenjang: 'S1',
        deskripsi: '',
        kaprodi_id: '' as string,
        is_active: true as boolean,
    });

    const openCreate = () => {
        setEditMode(false);
        setSelectedId(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEdit = (p: Prodi) => {
        setEditMode(true);
        setSelectedId(p.id);
        setData({
            kode: p.kode,
            nama: p.nama,
            jenjang: p.jenjang,
            deskripsi: p.deskripsi || '',
            kaprodi_id: p.kaprodi_id || '',
            is_active: p.is_active,
        });
        clearErrors();
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...data, kaprodi_id: data.kaprodi_id || null };
        if (editMode && selectedId) {
            put(`/admin/prodi/${selectedId}`, { onSuccess: () => setShowModal(false) });
        } else {
            post('/admin/prodi', { onSuccess: () => setShowModal(false) });
        }
    };

    const handleDelete = (id: string, mahasiswaCount: number) => {
        if (mahasiswaCount > 0) {
            alert('Program studi ini masih memiliki mahasiswa dan tidak bisa dihapus.');
            return;
        }
        if (confirm('Yakin ingin menghapus program studi ini?')) {
            router.delete(`/admin/prodi/${id}`);
        }
    };

    const filtered = useMemo(() =>
        prodis.filter(p =>
            p.nama.toLowerCase().includes(search.toLowerCase()) ||
            p.kode.toLowerCase().includes(search.toLowerCase()) ||
            p.jenjang.toLowerCase().includes(search.toLowerCase())
        ), [prodis, search]);

    const stats = useMemo(() => ({
        total: prodis.length,
        aktif: prodis.filter(p => p.is_active).length,
        mahasiswa: prodis.reduce((sum, p) => sum + p.mahasiswa_count, 0),
    }), [prodis]);

    const jenjangStyle = (j: string) => ({
        S1: 'bg-emerald-50 text-emerald-700',
        D3: 'bg-blue-50 text-blue-700',
        S2: 'bg-purple-50 text-purple-700',
        S3: 'bg-red-50 text-red-700',
    }[j] || 'bg-gray-50 text-gray-600');

    const jenjangBar = (j: string) => ({
        S1: 'from-emerald-400 to-teal-500',
        D3: 'from-blue-400 to-indigo-500',
        S2: 'from-purple-400 to-violet-500',
        S3: 'from-red-400 to-pink-500',
    }[j] || 'from-gray-400 to-gray-500');

    return (
        <AppLayout title="Program Studi">
            <PageHeader
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Program Studi' }]}
                actions={
                    <Button
                        onClick={openCreate}
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                    >
                        Tambah Program Studi
                    </Button>
                }
            />

            <FlashMessage message={flash?.success} />
            {flash?.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-xl text-sm text-red-700">
                    {flash.error}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} label="Total Prodi" value={stats.total} color="from-indigo-500 to-blue-600" />
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Prodi Aktif" value={stats.aktif} color="from-emerald-500 to-teal-600" />
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} label="Total Mahasiswa" value={stats.mahasiswa} color="from-orange-500 to-amber-600" />
            </div>

            {/* Search */}
            <div className="mb-4">
                <SearchInput value={search} onChange={setSearch} placeholder="Cari nama prodi, kode, atau jenjang..." />
            </div>

            {/* Grid Cards */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8">
                    <EmptyState
                        icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                        title="Belum ada program studi"
                        description="Mulai dengan menambahkan program studi pertama"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(p => (
                        <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 overflow-hidden">
                            {/* Color bar */}
                            <div className={`h-1.5 w-full bg-gradient-to-r ${jenjangBar(p.jenjang)}`} />

                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${jenjangStyle(p.jenjang)}`}>{p.jenjang}</span>
                                        <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{p.kode}</span>
                                    </div>
                                    <Badge color={p.is_active ? 'green' : 'red'} dot>{p.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                                </div>

                                <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{p.nama}</h3>
                                {p.deskripsi && <p className="text-xs text-gray-400 line-clamp-2 mb-2">{p.deskripsi}</p>}

                                {/* Kaprodi info */}
                                <div className="flex items-center gap-1.5 mt-2 mb-3">
                                    <svg className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    <span className="text-xs text-gray-500">
                                        {p.kaprodi ? (
                                            <span className="font-medium text-violet-700">{p.kaprodi.user?.name}</span>
                                        ) : (
                                            <span className="text-gray-300 italic">Belum ada kaprodi</span>
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        <span><strong className="text-gray-700">{p.mahasiswa_count}</strong> mahasiswa</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button onClick={() => handleDelete(p.id, p.mahasiswa_count)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Tambah/Edit */}
            <Modal show={showModal} onClose={() => setShowModal(false)} title={editMode ? 'Edit Program Studi' : 'Tambah Program Studi Baru'} maxWidth="max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenjang <span className="text-red-400">*</span></label>
                            <select
                                value={data.jenjang}
                                onChange={e => setData('jenjang', e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all outline-none"
                                required
                            >
                                {jenjangOptions.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
                            </select>
                            {errors.jenjang && <p className="text-red-500 text-xs mt-1">{errors.jenjang}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode <span className="text-red-400">*</span></label>
                            <input
                                type="text"
                                value={data.kode}
                                onChange={e => setData('kode', e.target.value.toUpperCase())}
                                placeholder="SI, IF, SD…"
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all outline-none"
                                required
                            />
                            {errors.kode && <p className="text-red-500 text-xs mt-1">{errors.kode}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Program Studi <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            value={data.nama}
                            onChange={e => setData('nama', e.target.value)}
                            placeholder="Sistem Informasi"
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all outline-none"
                            required
                        />
                        {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                    </div>

                    {/* Pilih Kaprodi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Ketua Program Studi (Kaprodi)
                            <span className="ml-1 text-xs text-gray-400 font-normal">— min. Lektor</span>
                        </label>
                        <select
                            value={data.kaprodi_id}
                            onChange={e => setData('kaprodi_id', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all outline-none"
                        >
                            <option value="">-- Pilih Kaprodi (opsional) --</option>
                            {dosenList.map(d => (
                                <option key={d.id} value={d.id}>
                                    {d.name} — {d.nidn} ({d.kategori})
                                </option>
                            ))}
                        </select>
                        {errors.kaprodi_id && <p className="text-red-500 text-xs mt-1">{errors.kaprodi_id}</p>}
                        {data.kaprodi_id && (
                            <p className="text-xs text-violet-600 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Dosen ini akan mendapat akses sebagai Kaprodi
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi <span className="text-gray-400 font-normal">(opsional)</span></label>
                        <textarea
                            value={data.deskripsi}
                            onChange={e => setData('deskripsi', e.target.value)}
                            placeholder="Deskripsi singkat program studi..."
                            rows={3}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                        <select
                            value={data.is_active ? 'aktif' : 'nonaktif'}
                            onChange={e => setData('is_active', e.target.value === 'aktif')}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all outline-none"
                        >
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button type="submit" disabled={processing} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}>
                            {processing ? 'Menyimpan...' : (editMode ? 'Update' : 'Simpan')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
