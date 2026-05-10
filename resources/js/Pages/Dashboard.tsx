import React from 'react';
import { usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatCard } from '@/Components/UI';

interface Stats {
    total_mahasiswa?: number; total_dosen?: number; total_judul_pending?: number; total_bimbingan_aktif?: number;
    total_bimbingan?: number; total_mahasiswa_bimbingan?: number;
    status_bimbingan?: string; judul_disetujui?: boolean;
}
interface AuthUser { name: string; role: string; }
interface Props { stats?: Stats; auth: { user: AuthUser }; [key: string]: any; }

export default function Dashboard({ stats }: Props) {
    const { auth } = usePage().props as any;
    const role = auth?.user?.role || 'admin';

    const roleConfig: Record<string, { title: string; subtitle: string; gradient: string }> = {
        admin: { title: 'Panel Administrator', subtitle: 'Kelola master data dan konfigurasi sistem', gradient: 'from-indigo-600 via-indigo-700 to-purple-700' },
        pimpinan: { title: 'Panel Pimpinan', subtitle: 'Monitoring dan pengawasan sistem bimbingan skripsi', gradient: 'from-slate-700 via-slate-800 to-gray-900' },
        'k.prodi': { title: 'Panel Kaprodi', subtitle: 'Kelola persetujuan dan monitoring mahasiswa', gradient: 'from-emerald-600 via-teal-700 to-cyan-700' },
        dosen: { title: 'Panel Dosen', subtitle: 'Kelola bimbingan dan penilaian mahasiswa', gradient: 'from-blue-600 via-blue-700 to-indigo-700' },
        mahasiswa: { title: 'Panel Mahasiswa', subtitle: 'Kelola bimbingan skripsi Anda', gradient: 'from-violet-600 via-purple-600 to-fuchsia-600' },
    };

    const config = roleConfig[role] || roleConfig.admin;

    const renderAdminDashboard = () => (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>} label="Total Mahasiswa" value={stats?.total_mahasiswa ?? 0} color="from-blue-500 to-indigo-600" />
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} label="Total Dosen" value={stats?.total_dosen ?? 0} color="from-emerald-500 to-teal-600" />
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} label="Judul Pending" value={stats?.total_judul_pending ?? 0} color="from-amber-500 to-orange-600" />
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} label="Bimbingan Aktif" value={stats?.total_bimbingan_aktif ?? 0} color="from-violet-500 to-purple-600" />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-indigo-500" />Menu Cepat
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Kelola Mahasiswa', href: '/admin/mahasiswa', icon: '👨‍🎓', color: 'from-blue-500 to-blue-600' },
                        { label: 'Kelola Dosen', href: '/admin/dosen', icon: '👨‍🏫', color: 'from-emerald-500 to-emerald-600' },
                        { label: 'Konsentrasi', href: '/admin/konsentrasi', icon: '🎯', color: 'from-violet-500 to-purple-600' },
                        { label: 'Tahapan', href: '/admin/tahapan', icon: '📋', color: 'from-amber-500 to-orange-500' },
                    ].map((a, i) => (
                        <a key={i} href={a.href} className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-gray-50/80 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-md transition-all duration-300">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>{a.icon}</div>
                            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800">{a.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </>
    );

    const renderDosenDashboard = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} label="Total Bimbingan" value={stats?.total_bimbingan ?? 0} color="from-blue-500 to-indigo-600" />
            <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} label="Mahasiswa Bimbingan" value={stats?.total_mahasiswa_bimbingan ?? 0} color="from-emerald-500 to-teal-600" />
        </div>
    );

    const renderMahasiswaDashboard = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Status Bimbingan" value={stats?.status_bimbingan === 'belum_mulai' ? 'Belum Mulai' : stats?.status_bimbingan === 'aktif' ? 'Aktif' : 'Selesai'} color="from-violet-500 to-purple-600" />
                <StatCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} label="Judul Disetujui" value={stats?.judul_disetujui ? 'Ya' : 'Belum'} color={stats?.judul_disetujui ? 'from-emerald-500 to-teal-600' : 'from-amber-500 to-orange-600'} />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-violet-500" />Menu Cepat
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Ajukan Judul', href: '/mahasiswa/judul', icon: '📝', color: 'from-violet-500 to-purple-600' },
                        { label: 'Bimbingan', href: '/mahasiswa/bimbingan', icon: '📚', color: 'from-blue-500 to-indigo-600' },
                        { label: 'Pengajuan Ujian', href: '/mahasiswa/ujian', icon: '🎓', color: 'from-emerald-500 to-teal-600' },
                    ].map((a, i) => (
                        <a key={i} href={a.href} className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-gray-50/80 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-md transition-all duration-300">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>{a.icon}</div>
                            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800">{a.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout title="Dashboard">
            {/* Welcome Banner */}
            <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-8 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Selamat Datang di LENTERA</h2>
                            <p className="text-indigo-200 text-sm mt-0.5">{config.title} — {config.subtitle}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Role-based Content */}
            {(role === 'admin' || role === 'pimpinan' || role === 'k.prodi') && renderAdminDashboard()}
            {role === 'dosen' && renderDosenDashboard()}
            {role === 'mahasiswa' && renderMahasiswaDashboard()}
        </AppLayout>
    );
}