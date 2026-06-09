import React, { useState, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { router, usePage } from '@inertiajs/react';
import { Modal, SearchInput, Button, Input, Select, PageHeader, FlashMessage, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, Badge, Avatar, EmptyState, StatCard } from '@/Components/UI';

interface User { id: string; name: string; email: string; }
interface Prodi { id: string; kode: string; nama: string; jenjang: string; }
interface Mahasiswa {
    id: string; nim: string; prodi_id: string | null; angkatan: number;
    no_hp: string; status: string; user: User; prodi: Prodi | null;
}
interface Props { mahasiswa: Mahasiswa[]; prodis: Prodi[]; }

export default function MahasiswaIndex({ mahasiswa, prodis }: Props) {
  const { flash } = usePage().props as any;
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    name: '', email: '', nim: '', prodi_id: '',
    angkatan: new Date().getFullYear(), no_hp: '', password: '', status: 'aktif'
  });

  const openCreate = () => {
    setEditMode(false);
    setSelectedId(null);
    setForm({ name: '', email: '', nim: '', prodi_id: prodis[0]?.id || '', angkatan: new Date().getFullYear(), no_hp: '', password: '', status: 'aktif' });
    setShowModal(true);
  };

  const openEdit = (m: Mahasiswa) => {
    setEditMode(true);
    setSelectedId(m.id);
    setForm({ name: m.user.name, email: m.user.email, nim: m.nim, prodi_id: m.prodi_id || '', angkatan: m.angkatan, no_hp: m.no_hp || '', password: '', status: m.status });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode && selectedId) {
      router.put(`/admin/mahasiswa/${selectedId}`, form, { onSuccess: () => setShowModal(false) });
    } else {
      router.post('/admin/mahasiswa', form, { onSuccess: () => setShowModal(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus mahasiswa ini?')) router.delete(`/admin/mahasiswa/${id}`);
  };

  const filtered = useMemo(() => {
    return mahasiswa.filter(m => {
      const prodiNama = m.prodi ? `${m.prodi.jenjang}. ${m.prodi.nama}` : '';
      const matchSearch =
        m.user.name.toLowerCase().includes(search.toLowerCase()) ||
        m.nim.toLowerCase().includes(search.toLowerCase()) ||
        m.user.email.toLowerCase().includes(search.toLowerCase()) ||
        prodiNama.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [mahasiswa, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: mahasiswa.length, aktif: 0, nonaktif: 0, cuti: 0, lulus: 0 };
    mahasiswa.forEach(m => { if (counts[m.status] !== undefined) counts[m.status]++; });
    return counts;
  }, [mahasiswa]);

  const statusBadge = (s: string) => ({ aktif: 'green', nonaktif: 'red', cuti: 'yellow', lulus: 'blue' }[s] || 'gray');
  const statusLabel = (s: string) => ({ aktif: 'Aktif', nonaktif: 'Nonaktif', cuti: 'Cuti', lulus: 'Lulus' }[s] || s);

  return (
    <AppLayout title="Data Mahasiswa">
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Mahasiswa' }]}
        actions={<Button onClick={openCreate} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>Tambah Mahasiswa</Button>}
      />

      <FlashMessage message={flash?.success} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} label="Total Mahasiswa" value={statusCounts.all} color="from-blue-500 to-indigo-600" />
        <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Aktif" value={statusCounts.aktif} color="from-emerald-500 to-teal-600" />
        <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Cuti" value={statusCounts.cuti} color="from-amber-500 to-orange-600" />
        <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>} label="Lulus" value={statusCounts.lulus} color="from-purple-500 to-pink-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Cari nama, NIM, email, atau prodi..." /></div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none">
          <option value="all">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
          <option value="cuti">Cuti</option>
          <option value="lulus">Lulus</option>
        </select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableHeaderCell>Mahasiswa</TableHeaderCell>
          <TableHeaderCell>NIM</TableHeaderCell>
          <TableHeaderCell>Program Studi</TableHeaderCell>
          <TableHeaderCell>Angkatan</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell width="120px">Aksi</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow><TableCell className="text-center" colSpan={6}>
              <EmptyState icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>} title="Tidak ada data" description="Belum ada mahasiswa yang terdaftar atau sesuai filter" />
            </TableCell></TableRow>
          ) : filtered.map(m => (
            <TableRow key={m.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar name={m.user.name} />
                  <div>
                    <p className="font-medium text-gray-900">{m.user.name}</p>
                    <p className="text-xs text-gray-400">{m.user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell><span className="font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded-lg text-xs">{m.nim}</span></TableCell>
              <TableCell>
                {m.prodi ? (
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${{
                      S1: 'bg-emerald-50 text-emerald-700',
                      D3: 'bg-blue-50 text-blue-700',
                      S2: 'bg-purple-50 text-purple-700',
                    }[m.prodi.jenjang] || 'bg-gray-50 text-gray-600'}`}>{m.prodi.jenjang}</span>
                    <span className="text-sm text-gray-600">{m.prodi.nama}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs italic">Belum diatur</span>
                )}
              </TableCell>
              <TableCell className="text-gray-600">{m.angkatan}</TableCell>
              <TableCell><Badge color={statusBadge(m.status) as any} dot>{statusLabel(m.status)}</Badge></TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(m)} className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filtered.length > 0 && (
        <div className="mt-4 text-sm text-gray-400 text-right">Menampilkan {filtered.length} dari {mahasiswa.length} mahasiswa</div>
      )}

      {/* Modal Tambah/Edit */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title={editMode ? 'Edit Mahasiswa' : 'Tambah Mahasiswa Baru'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Lengkap" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Masukkan nama lengkap" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="NIM" value={form.nim} onChange={e => setForm({ ...form, nim: e.target.value })} placeholder="Nomor Induk Mahasiswa" required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" required />
          </div>

          {/* Program Studi Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Program Studi</label>
            <select
              value={form.prodi_id}
              onChange={e => setForm({ ...form, prodi_id: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-200 outline-none"
              required
            >
              <option value="">-- Pilih Program Studi --</option>
              {prodis.map(p => (
                <option key={p.id} value={p.id}>{p.jenjang}. {p.nama}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Angkatan" type="number" value={form.angkatan} onChange={e => setForm({ ...form, angkatan: parseInt(e.target.value) })} required />
            <Input label="No HP" value={form.no_hp} onChange={e => setForm({ ...form, no_hp: e.target.value })} placeholder="08xxxxxxxxxx" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {editMode ? (
              <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
                <option value="cuti">Cuti</option>
                <option value="lulus">Lulus</option>
              </Select>
            ) : (
              <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Minimal 6 karakter" required={!editMode} />
            )}
          </div>
          {editMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password Baru <span className="text-xs text-gray-400 font-normal">(opsional)</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Kosongkan jika tidak ingin mengubah password"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-200 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Isi hanya jika ingin mereset password mahasiswa ini.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
            <Button type="submit" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}>{editMode ? 'Update' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}