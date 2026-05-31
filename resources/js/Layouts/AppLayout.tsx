import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

interface Props {
  children: React.ReactNode;
  title?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  name: string;
  section?: string; // optional group header shown above item
}

const icons = {
  dashboard: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  mahasiswa: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  dosen: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  konsentrasi: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  ruangan: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  tahapan: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  approval: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  prodi: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  judul: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  jadwal: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  laporan: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  bimbingan: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  ujian: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  profil: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  penilaian: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  check: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  statistik: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  master: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  logout: (
    <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  menu: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8m-8 6h16" />
    </svg>
  ),
};

// ─── FIK UPNVJ Color Scheme ───────────────────────────────────────────────────
// Primary:   #E8500A  (orange utama FIK)
// Secondary: #F0820A  (oranye terang / gradient)
// Accent:    #FBB726  (kuning keemasan)
// Dark:      #1A1A1A  (sidebar background)
// Surface:   #F5F3EE  (page background warm off-white)
// ─────────────────────────────────────────────────────────────────────────────

function getSidebarMenu(role: string, isKaprodi?: boolean, originalRole?: string): NavItem[] {
  const adminMenu: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: icons.dashboard, name: 'dashboard' },
    { label: 'Data Mahasiswa', href: '/admin/mahasiswa', icon: icons.mahasiswa, name: 'admin.mahasiswa' },
    { label: 'Data Dosen', href: '/admin/dosen', icon: icons.dosen, name: 'admin.dosen' },
    { label: 'Program Studi', href: '/admin/prodi', icon: icons.prodi, name: 'admin.prodi' },
    { label: 'Konsentrasi', href: '/admin/konsentrasi', icon: icons.konsentrasi, name: 'admin.konsentrasi' },
    { label: 'Ruangan', href: '/admin/ruangan', icon: icons.ruangan, name: 'admin.ruangan' },
    { label: 'Tahapan Bimbingan', href: '/admin/tahapan', icon: icons.tahapan, name: 'admin.tahapan' },
    { label: 'Approval Config', href: '/admin/approval', icon: icons.approval, name: 'admin.approval' },
    { label: 'Pengajuan Judul', href: '/admin/judul', icon: icons.judul, name: 'admin.judul' },
    { label: 'Manajemen Ujian', href: '/admin/ujian', icon: icons.ujian, name: 'admin.ujian' },
    { label: 'Laporan', href: '/admin/laporan', icon: icons.laporan, name: 'admin.laporan' },
  ];

  const mahasiswaMenu: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: icons.dashboard, name: 'dashboard' },
    { label: 'Pengajuan Judul', href: '/mahasiswa/judul', icon: icons.judul, name: 'mahasiswa.judul' },
    { label: 'Bimbingan', href: '/mahasiswa/bimbingan', icon: icons.bimbingan, name: 'mahasiswa.bimbingan' },
    { label: 'Pengajuan Ujian', href: '/mahasiswa/ujian', icon: icons.ujian, name: 'mahasiswa.ujian' },
    { label: 'Laporan', href: '/mahasiswa/laporan', icon: icons.laporan, name: 'mahasiswa.laporan' },
    { label: 'Profil Saya', href: '/profil', icon: icons.profil, name: 'profil' },
  ];

  const dosenMenu: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: icons.dashboard, name: 'dashboard' },
    { label: 'Mahasiswa Bimbingan', href: '/dosen/bimbingan', icon: icons.bimbingan, name: 'dosen.bimbingan' },
    { label: 'Jadwal Ujian', href: '/dosen/ujian', icon: icons.jadwal, name: 'dosen.ujian' },
    { label: 'Penilaian', href: '/dosen/penilaian', icon: icons.penilaian, name: 'dosen.penilaian' },
    { label: 'Profil Saya', href: '/profil', icon: icons.profil, name: 'profil' },
  ];

  // Menu dosen yang juga dimiliki kaprodi (kaprodi bisa membimbing & menguji)
  const dosenSharedItems: NavItem[] = [
    { label: 'Mahasiswa Bimbingan', href: '/dosen/bimbingan', icon: icons.bimbingan, name: 'dosen.bimbingan', section: 'Sebagai Dosen' },
    { label: 'Jadwal Ujian', href: '/dosen/ujian', icon: icons.jadwal, name: 'dosen.ujian' },
    { label: 'Penilaian', href: '/dosen/penilaian', icon: icons.penilaian, name: 'dosen.penilaian' },
  ];

  const kaprodiMenu: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: icons.dashboard, name: 'dashboard' },
    // ── Fungsi Kaprodi ──
    { label: 'Persetujuan Judul', href: '/kaprodi/judul', icon: icons.check, name: 'kaprodi.judul', section: 'Fungsi Kaprodi' },
    { label: 'Pengajuan Ujian', href: '/kaprodi/ujian', icon: icons.ujian, name: 'kaprodi.ujian' },
    { label: 'Persetujuan Nilai', href: '/kaprodi/nilai', icon: icons.penilaian, name: 'kaprodi.nilai' },
    { label: 'Laporan', href: '/kaprodi/laporan', icon: icons.laporan, name: 'kaprodi.laporan' },
    // ── Fungsi Dosen (kaprodi bisa membimbing & menguji) ──
    ...dosenSharedItems,
  ];

  const pimpinanMenu: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: icons.dashboard, name: 'dashboard' },
    { label: 'Statistik', href: '/pimpinan/statistik', icon: icons.statistik, name: 'pimpinan.statistik' },
    { label: 'Laporan', href: '/pimpinan/laporan', icon: icons.laporan, name: 'pimpinan.laporan' },
    { label: 'Master Data', href: '/admin/mahasiswa', icon: icons.master, name: 'admin.mahasiswa' },
  ];

  const map: Record<string, NavItem[]> = {
    admin: adminMenu,
    mahasiswa: mahasiswaMenu,
    dosen: dosenMenu,
    'k.prodi': kaprodiMenu,
    pimpinan: pimpinanMenu,
  };

  let menu = map[role] || adminMenu;

  // Pimpinan yang juga kaprodi mendapat menu kaprodi
  if (role === 'pimpinan' && isKaprodi) {
    const kMenu = kaprodiMenu.filter(m => m.name !== 'dashboard');
    menu = [...menu, ...kMenu];
  }

  return menu;
}

// Role label mapping
const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  pimpinan: 'Pimpinan',
  'k.prodi': 'Kepala Prodi',
  dosen: 'Dosen',
  mahasiswa: 'Mahasiswa',
};

export default function AppLayout({ children, title }: Props) {
  const { auth } = usePage().props as any;
  const user = auth?.user;
  const isKaprodi = auth?.is_kaprodi || false;
  const role = user?.role || 'admin';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menus = getSidebarMenu(role, isKaprodi, user?.original_role);
  const currentPath = window.location.pathname;

  const handleLogout = () => {
    router.post('/logout');
  };

  const initials = user?.name?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F5F3EE' }}>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className="flex flex-col transition-all duration-300 ease-in-out"
        style={{
          backgroundColor: '#1A1A1A',
          position: mobileOpen ? 'fixed' : undefined,
          top: mobileOpen ? 0 : undefined,
          left: mobileOpen ? 0 : undefined,
          zIndex: mobileOpen ? 50 : undefined,
          height: '100%',
          width: sidebarOpen ? 240 : 68,
          flexShrink: 0,
          transform: mobileOpen ? 'translateX(0)' : undefined,
        }}
      >
        {/* Orange accent bar top */}
        <div
          className="h-[3px] w-full flex-shrink-0"
          style={{ background: 'linear-gradient(90deg, #E8500A, #F0820A, #FBB726)' }}
        />

        {/* Logo */}
        <div
          className={`flex items-center h-[60px] border-b flex-shrink-0 ${
            sidebarOpen ? 'px-5 gap-3' : 'px-4 justify-center'
          }`}
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }}
          >
            <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-white font-bold text-[14px] tracking-widest leading-tight">LENTERA</div>
              <div className="text-[10px] tracking-[0.14em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Tugas Akhir
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        {sidebarOpen && (
          <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div
              className="flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{ backgroundColor: 'rgba(232,80,10,0.14)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-white truncate">{user?.name}</div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {isKaprodi ? 'Kepala Prodi' : roleLabels[role]}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-[2px]">
          {menus.map((item, idx) => {
            const isActive =
              currentPath === item.href || currentPath.startsWith(item.href + '/');

            return (
              <React.Fragment key={item.name}>
                {/* Section header */}
                {sidebarOpen && item.section && (
                  <div className="pt-3 pb-1 px-2">
                    <span
                      className="text-[9.5px] font-bold uppercase tracking-[0.12em]"
                      style={{ color: 'rgba(255,255,255,0.25)' }}
                    >
                      {item.section}
                    </span>
                  </div>
                )}
                {!sidebarOpen && item.section && (
                  <div className="border-t my-1 mx-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                )}

                <Link
                  href={item.href}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-[9px] rounded-xl text-[12.5px] font-medium
                    transition-all duration-200 group
                    ${!sidebarOpen ? 'justify-center' : ''}
                  `}
                  style={{
                    backgroundColor: isActive ? 'rgba(232,80,10,0.20)' : 'transparent',
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.45)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.backgroundColor = 'rgba(232,80,10,0.10)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span
                    className="flex-shrink-0"
                    style={{
                      color: isActive ? '#E8500A' : 'rgba(255,255,255,0.30)',
                    }}
                  >
                    {item.icon}
                  </span>

                  {sidebarOpen && <span className="flex-1 truncate">{item.label}</span>}

                  {/* Active indicator dot */}
                  {sidebarOpen && isActive && (
                    <span
                      className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#E8500A' }}
                    />
                  )}
                </Link>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2.5 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-3 py-[9px] rounded-xl text-[12.5px] font-medium
              transition-all duration-200
              ${!sidebarOpen ? 'justify-center' : ''}
            `}
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
            }}
          >
            <span className="flex-shrink-0">{icons.logout}</span>
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header
          className="flex items-center justify-between px-5 h-[60px] flex-shrink-0 sticky top-0 z-30"
          style={{
            backgroundColor: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Toggle sidebar on desktop / open mobile drawer */}
            <button
              className="p-2 rounded-lg transition-colors"
              style={{ color: '#555' }}
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  setSidebarOpen(!sidebarOpen);
                } else {
                  setMobileOpen(!mobileOpen);
                }
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {icons.menu}
            </button>

            {title && (
              <div>
                <h1 className="text-[14px] font-semibold" style={{ color: '#1A1A1A' }}>
                  {title}
                </h1>
                {/* <p className="text-[11px] font-medium" style={{ color: '#E8500A' }}>
                  FIK UPN Veteran Jakarta
                </p> */}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              className="relative p-2 rounded-lg transition-colors"
              style={{ color: '#666' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {icons.bell}
              {/* Red dot */}
              <span
                className="absolute top-[7px] right-[7px] w-[7px] h-[7px] rounded-full border-[1.5px] border-white"
                style={{ backgroundColor: '#E8500A' }}
              />
            </button>

            {/* User info */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[12px] font-semibold" style={{ color: '#1A1A1A' }}>
                {user?.name}
              </span>
              <span className="text-[10px]" style={{ color: '#999' }}>
                {user?.email}
              </span>
            </div>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shadow-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #E8500A, #F0820A)' }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}