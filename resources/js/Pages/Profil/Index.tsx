import React, { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

interface MahasiswaData {
  nim: string;
  program_studi: string;
  angkatan: number;
  status: string;
  no_hp: string | null;
}

interface DosenData {
  nidn: string;
  bidang_keahlian: string;
  kuota_bimbingan: number;
  is_kaprodi: boolean;
  no_hp: string | null;
  foto_profil_path: string | null;
  paraf_path: string | null;
  konsentrasi: { id: string; nama: string }[];
}

interface ProfilData {
  id: string;
  name: string;
  email: string;
  role: string;
  role_name: string;
  last_login_at: string | null;
  created_at: string | null;
  mahasiswa?: MahasiswaData;
  dosen?: DosenData;
}

export default function ProfilIndex() {
  const { profil, flash } = usePage().props as any;
  const data = profil as ProfilData;
  const [activeTab, setActiveTab] = useState<'info' | 'edit' | 'password'>('info');

  // Edit profile form
  const profileForm = useForm({
    name: data.name,
    no_hp: data.mahasiswa?.no_hp || data.dosen?.no_hp || '',
    foto_profil: null as File | null,
    paraf: null as File | null,
  });

  // Change password form
  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', profileForm.data.name);
    if (data.mahasiswa || data.dosen) {
      formData.append('no_hp', profileForm.data.no_hp);
    }
    if (profileForm.data.foto_profil) {
      formData.append('foto_profil', profileForm.data.foto_profil);
    }
    if (profileForm.data.paraf) {
      formData.append('paraf', profileForm.data.paraf);
    }
    formData.append('_method', 'POST');

    router.post('/profil/update', formData, {
      forceFormData: true,
      onSuccess: () => {
        profileForm.reset('foto_profil', 'paraf');
        setActiveTab('info');
      },
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    passwordForm.post('/profil/password', {
      onSuccess: () => {
        passwordForm.reset();
        setActiveTab('info');
      },
    });
  };

  const InfoRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
      <span className="text-[13px] font-medium" style={{ color: '#666' }}>{label}</span>
      <span className="text-[13px] font-semibold" style={{ color: '#1A1A1A' }}>{value || '-'}</span>
    </div>
  );

  const Badge = ({ children, color }: { children: React.ReactNode; color: string }) => (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: color + '18', color: color }}
    >
      {children}
    </span>
  );

  return (
    <AppLayout title="Profil Saya">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Success Message */}
        {flash?.success && (
          <div
            className="px-4 py-3 rounded-xl text-[13px] font-medium"
            style={{ backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}
          >
            ✓ {flash.success}
          </div>
        )}

        {/* Header Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        >
          <div className="h-24" style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }} />
          <div className="px-6 pb-5 -mt-10">
            <div className="flex items-end gap-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-white"
                style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }}
              >
                {data.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 pb-1">
                <h2 className="text-[16px] font-bold" style={{ color: '#1A1A1A' }}>{data.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge color="#E8500A">{data.role_name}</Badge>
                  {data.dosen?.is_kaprodi && <Badge color="#7C3AED">Kaprodi</Badge>}
                  {data.mahasiswa?.status && <Badge color={data.mahasiswa.status === 'aktif' ? '#059669' : '#DC2626'}>{data.mahasiswa.status}</Badge>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ backgroundColor: '#F3F4F6' }}
        >
          {[
            { key: 'info', label: 'Informasi' },
            { key: 'edit', label: 'Edit Profil' },
            { key: 'password', label: 'Ganti Password' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="flex-1 py-2.5 px-4 rounded-lg text-[12.5px] font-semibold transition-all duration-200"
              style={{
                backgroundColor: activeTab === tab.key ? '#fff' : 'transparent',
                color: activeTab === tab.key ? '#E8500A' : '#6B7280',
                boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="space-y-5">
            {/* Akun */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h3 className="text-[13px] font-bold mb-3" style={{ color: '#E8500A' }}>Informasi Akun</h3>
              <InfoRow label="Nama Lengkap" value={data.name} />
              <InfoRow label="Email" value={data.email} />
              <InfoRow label="Peran" value={data.role_name} />
              <InfoRow label="Terdaftar Sejak" value={data.created_at} />
              <InfoRow label="Login Terakhir" value={data.last_login_at} />
            </div>

            {/* Mahasiswa Info */}
            {data.mahasiswa && (
              <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 className="text-[13px] font-bold mb-3" style={{ color: '#E8500A' }}>Data Mahasiswa</h3>
                <InfoRow label="NIM" value={data.mahasiswa.nim} />
                <InfoRow label="Program Studi" value={data.mahasiswa.program_studi} />
                <InfoRow label="Angkatan" value={data.mahasiswa.angkatan} />
                <InfoRow label="Status" value={data.mahasiswa.status} />
                <InfoRow label="No. HP" value={data.mahasiswa.no_hp} />
              </div>
            )}

            {/* Dosen Info */}
            {data.dosen && (
              <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 className="text-[13px] font-bold mb-3" style={{ color: '#E8500A' }}>Data Dosen</h3>
                <InfoRow label="NIDN" value={data.dosen.nidn} />
                <InfoRow label="Bidang Keahlian" value={data.dosen.bidang_keahlian} />
                <InfoRow label="Kuota Bimbingan" value={data.dosen.kuota_bimbingan} />
                <InfoRow label="No. HP" value={data.dosen.no_hp} />
                <InfoRow
                  label="Konsentrasi"
                  value={data.dosen.konsentrasi?.map((k) => k.nama).join(', ') || '-'}
                />
              </div>
            )}
          </div>
        )}

        {/* Edit Profile Tab */}
        {activeTab === 'edit' && (
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 className="text-[13px] font-bold mb-4" style={{ color: '#E8500A' }}>Edit Profil</h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#555' }}>Nama Lengkap</label>
                <input
                  type="text"
                  value={profileForm.data.name}
                  onChange={(e) => profileForm.setData('name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border outline-none transition-all"
                  style={{ borderColor: '#E5E7EB' }}
                  onFocus={(e) => { e.target.style.borderColor = '#E8500A'; e.target.style.boxShadow = '0 0 0 3px rgba(232,80,10,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                />
                {profileForm.errors.name && (
                  <p className="text-[11px] mt-1" style={{ color: '#DC2626' }}>{profileForm.errors.name}</p>
                )}
              </div>

              {/* No HP */}
              {(data.mahasiswa || data.dosen) && (
                <div>
                  <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#555' }}>No. HP</label>
                  <input
                    type="text"
                    value={profileForm.data.no_hp}
                    onChange={(e) => profileForm.setData('no_hp', e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border outline-none transition-all"
                    style={{ borderColor: '#E5E7EB' }}
                    onFocus={(e) => { e.target.style.borderColor = '#E8500A'; e.target.style.boxShadow = '0 0 0 3px rgba(232,80,10,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                  />
                  {profileForm.errors.no_hp && (
                    <p className="text-[11px] mt-1" style={{ color: '#DC2626' }}>{profileForm.errors.no_hp}</p>
                  )}
                </div>
              )}

              {/* Dosen-specific: Foto Profil & Paraf */}
              {data.dosen && (
                <>
                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#555' }}>Foto Profil</label>
                    {data.dosen.foto_profil_path && (
                      <div className="mb-2">
                        <img
                          src={`/storage/${data.dosen.foto_profil_path}`}
                          alt="Foto Profil"
                          className="w-16 h-16 rounded-xl object-cover border"
                          style={{ borderColor: '#E5E7EB' }}
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => profileForm.setData('foto_profil', e.target.files?.[0] || null)}
                      className="w-full text-[12px] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:cursor-pointer"
                      style={{ color: '#666' }}
                    />
                    {profileForm.errors.foto_profil && (
                      <p className="text-[11px] mt-1" style={{ color: '#DC2626' }}>{profileForm.errors.foto_profil}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#555' }}>Paraf (Tanda Tangan)</label>
                    {data.dosen.paraf_path && (
                      <div className="mb-2">
                        <img
                          src={`/storage/${data.dosen.paraf_path}`}
                          alt="Paraf"
                          className="h-12 rounded-lg object-contain border px-2"
                          style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' }}
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => profileForm.setData('paraf', e.target.files?.[0] || null)}
                      className="w-full text-[12px] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:cursor-pointer"
                      style={{ color: '#666' }}
                    />
                    {profileForm.errors.paraf && (
                      <p className="text-[11px] mt-1" style={{ color: '#DC2626' }}>{profileForm.errors.paraf}</p>
                    )}
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={profileForm.processing}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }}
              >
                {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 className="text-[13px] font-bold mb-4" style={{ color: '#E8500A' }}>Ganti Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#555' }}>Password Saat Ini</label>
                <input
                  type="password"
                  value={passwordForm.data.current_password}
                  onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border outline-none transition-all"
                  style={{ borderColor: '#E5E7EB' }}
                  onFocus={(e) => { e.target.style.borderColor = '#E8500A'; e.target.style.boxShadow = '0 0 0 3px rgba(232,80,10,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                />
                {passwordForm.errors.current_password && (
                  <p className="text-[11px] mt-1" style={{ color: '#DC2626' }}>{passwordForm.errors.current_password}</p>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#555' }}>Password Baru</label>
                <input
                  type="password"
                  value={passwordForm.data.password}
                  onChange={(e) => passwordForm.setData('password', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border outline-none transition-all"
                  style={{ borderColor: '#E5E7EB' }}
                  onFocus={(e) => { e.target.style.borderColor = '#E8500A'; e.target.style.boxShadow = '0 0 0 3px rgba(232,80,10,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                />
                {passwordForm.errors.password && (
                  <p className="text-[11px] mt-1" style={{ color: '#DC2626' }}>{passwordForm.errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#555' }}>Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={passwordForm.data.password_confirmation}
                  onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border outline-none transition-all"
                  style={{ borderColor: '#E5E7EB' }}
                  onFocus={(e) => { e.target.style.borderColor = '#E8500A'; e.target.style.boxShadow = '0 0 0 3px rgba(232,80,10,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                />
                {passwordForm.errors.password_confirmation && (
                  <p className="text-[11px] mt-1" style={{ color: '#DC2626' }}>{passwordForm.errors.password_confirmation}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={passwordForm.processing}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }}
              >
                {passwordForm.processing ? 'Menyimpan...' : 'Ganti Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
}