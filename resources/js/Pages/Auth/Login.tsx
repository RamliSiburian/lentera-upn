import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import InputError from '@/Components/InputError';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login - LENTERA" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .login-root {
                    display: flex;
                    min-height: 100vh;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    background: #0f0f0f;
                }

                /* ── LEFT PANEL ── */
                .left-panel {
                    display: none;
                    position: relative;
                    overflow: hidden;
                    background: #0f0f0f;
                }
                @media (min-width: 1024px) {
                    .left-panel { display: flex; flex-direction: column; justify-content: space-between; width: 50%; padding: 3rem; }
                }

                .left-bg-stripe {
                    position: absolute;
                    top: 0; right: 0;
                    width: 6px;
                    height: 100%;
                    background: linear-gradient(180deg, #F26522 0%, #E85000 50%, #F26522 100%);
                }

                .left-noise {
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
                    pointer-events: none;
                }

                .left-glow {
                    position: absolute;
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(242,101,34,0.18) 0%, transparent 70%);
                    top: 50%; left: 40%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                }

                .left-top { position: relative; z-index: 10; }

                .brand-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.625rem 1rem;
                    background: rgba(242,101,34,0.12);
                    border: 1px solid rgba(242,101,34,0.3);
                    border-radius: 999px;
                    margin-bottom: 2.5rem;
                }

                .brand-dot {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    background: #F26522;
                    animation: pulse-dot 2s ease-in-out infinite;
                }

                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.8); }
                }

                .brand-badge-text {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #F26522;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                .left-headline {
                    font-family: 'Instrument Serif', serif;
                    font-size: 3.5rem;
                    line-height: 1.1;
                    color: #fff;
                    margin-bottom: 1rem;
                }

                .left-headline em {
                    font-style: italic;
                    color: #F26522;
                }

                .left-sub {
                    font-size: 0.9375rem;
                    color: rgba(255,255,255,0.45);
                    line-height: 1.65;
                    max-width: 380px;
                }

                .left-middle { position: relative; z-index: 10; flex: 1; display: flex; align-items: center; }

                .feature-list { list-style: none; display: flex; flex-direction: column; gap: 1.25rem; }

                .feature-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                }

                .feature-icon-wrap {
                    flex-shrink: 0;
                    width: 40px; height: 40px;
                    border-radius: 10px;
                    background: rgba(242,101,34,0.1);
                    border: 1px solid rgba(242,101,34,0.2);
                    display: flex; align-items: center; justify-content: center;
                }

                .feature-icon-wrap svg { width: 18px; height: 18px; color: #F26522; stroke: #F26522; }

                .feature-text { font-size: 0.875rem; color: rgba(255,255,255,0.6); line-height: 1.5; padding-top: 0.25rem; }

                .left-bottom { position: relative; z-index: 10; }

                .upnvj-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    padding: 1rem 1.25rem;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 14px;
                }

                .upnvj-badge-logo {
                    width: 44px; height: 44px;
                    border-radius: 8px;
                    overflow: hidden;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }

                .upnvj-badge-logo img { width: 100%; height: 100%; object-fit: contain; }

                .upnvj-badge-text-main { font-size: 0.8125rem; font-weight: 700; color: white; }
                .upnvj-badge-text-sub { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 1px; }

                /* ── RIGHT PANEL ── */
                .right-panel {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: #f7f4f0;
                    position: relative;
                }

                .right-panel::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 4px;
                    background: linear-gradient(90deg, #F26522, #E85000);
                }

                .form-wrapper { width: 100%; max-width: 420px; }

                /* Mobile logo */
                .mobile-logo {
                    text-align: center;
                    margin-bottom: 2rem;
                    display: block;
                }
                @media (min-width: 1024px) { .mobile-logo { display: none; } }

                .mobile-logo-icon {
                    width: 72px; height: 72px;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center; justify-content: center;
                    margin-bottom: 0.75rem;
                    overflow: hidden;
                }

                .mobile-logo-icon img { width: 100%; height: 100%; object-fit: contain; }

                .mobile-logo-name {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #0f0f0f;
                    letter-spacing: -0.03em;
                }

                .mobile-logo-sub {
                    display: block;
                    font-size: 0.75rem;
                    color: #888;
                    margin-top: 2px;
                }

                /* Status */
                .status-msg {
                    margin-bottom: 1.25rem;
                    padding: 0.875rem 1rem;
                    border-radius: 10px;
                    background: #ecfdf5;
                    border: 1px solid #a7f3d0;
                    font-size: 0.8125rem;
                    color: #065f46;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                /* Card */
                .form-card {
                    background: white;
                    border-radius: 20px;
                    padding: 2.25rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
                }

                .form-card-header { margin-bottom: 1.75rem; }

                .form-card-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.375rem;
                    font-size: 0.6875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #F26522;
                    background: rgba(242,101,34,0.08);
                    padding: 0.25rem 0.625rem;
                    border-radius: 999px;
                    margin-bottom: 0.75rem;
                }

                .form-card-title {
                    font-size: 1.625rem;
                    font-weight: 800;
                    color: #0f0f0f;
                    letter-spacing: -0.03em;
                    line-height: 1.2;
                }

                .form-card-sub {
                    font-size: 0.875rem;
                    color: #888;
                    margin-top: 0.375rem;
                }

                /* Divider */
                .form-divider {
                    height: 1px;
                    background: #f0ece6;
                    margin: 1.5rem 0;
                }

                /* Field */
                .field { margin-bottom: 1.125rem; }

                .field-label {
                    display: block;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 0.5rem;
                }

                .field-input-wrap { position: relative; }

                .field-icon {
                    position: absolute;
                    left: 0.875rem;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                    color: #bbb;
                    display: flex; align-items: center;
                }

                .field-icon svg { width: 16px; height: 16px; stroke: currentColor; }

                .field-input {
                    width: 100%;
                    padding: 0.8125rem 0.875rem 0.8125rem 2.625rem;
                    border: 1.5px solid #e8e3dc;
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    color: #0f0f0f;
                    background: #faf8f5;
                    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
                    outline: none;
                }

                .field-input::placeholder { color: #c0b9b0; }

                .field-input:focus {
                    border-color: #F26522;
                    box-shadow: 0 0 0 3px rgba(242,101,34,0.12);
                    background: white;
                }

                .field-input-pr { padding-right: 2.75rem; }

                .toggle-pw {
                    position: absolute;
                    right: 0.875rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #bbb;
                    display: flex; align-items: center;
                    padding: 0.25rem;
                    border-radius: 4px;
                    transition: color 0.15s;
                }
                .toggle-pw:hover { color: #F26522; }
                .toggle-pw svg { width: 16px; height: 16px; stroke: currentColor; }

                /* Bottom row */
                .form-bottom-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.375rem;
                }

                .remember-wrap {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .remember-checkbox {
                    width: 16px; height: 16px;
                    border-radius: 4px;
                    accent-color: #F26522;
                    cursor: pointer;
                }

                .remember-label { font-size: 0.8125rem; color: #666; }

                .forgot-link {
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: #F26522;
                    text-decoration: none;
                    transition: color 0.15s;
                }
                .forgot-link:hover { color: #E85000; }

                /* Submit button */
                .submit-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.9375rem 1.5rem;
                    border: none;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #F26522 0%, #E85000 100%);
                    color: white;
                    font-size: 0.9375rem;
                    font-weight: 700;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    cursor: pointer;
                    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
                    box-shadow: 0 4px 16px rgba(242,101,34,0.35);
                    position: relative;
                    overflow: hidden;
                }

                .submit-btn::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
                    pointer-events: none;
                }

                .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(242,101,34,0.4); }
                .submit-btn:active:not(:disabled) { transform: translateY(0); }
                .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .submit-btn svg { width: 16px; height: 16px; stroke: currentColor; }

                @keyframes spin { to { transform: rotate(360deg); } }
                .spin { animation: spin 0.8s linear infinite; }

                /* Footer */
                .form-footer {
                    text-align: center;
                    margin-top: 1.5rem;
                    font-size: 0.75rem;
                    color: #aaa;
                }

                .form-footer strong { color: #888; font-weight: 600; }
            `}</style>

            <div className="login-root">
                {/* ── LEFT PANEL ── */}
                <div className="left-panel">
                    <div className="left-bg-stripe" />
                    <div className="left-noise" />
                    <div className="left-glow" />

                    {/* Top */}
                    <div className="left-top">
                        <div className="brand-badge">
                            <div className="brand-dot" />
                            <span className="brand-badge-text">Portal Akademik</span>
                        </div>
                        <h1 className="left-headline">
                            Sistem Terpadu<br /><em>Tugas Akhir</em><br />Digital
                        </h1>
                        <p className="left-sub">
                            Kelola bimbingan skripsi, pengajuan judul, dan sidang tugas akhir secara transparan dan efisien.
                        </p>
                    </div>

                    {/* Middle */}
                    <div className="left-middle">
                        <ul className="feature-list">
                            <li className="feature-item">
                                <div className="feature-icon-wrap">
                                    <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <p className="feature-text">Pengajuan judul & konsentrasi secara online dengan tracking real-time</p>
                            </li>
                            <li className="feature-item">
                                <div className="feature-icon-wrap">
                                    <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <p className="feature-text">Bimbingan dengan tracking progress lengkap bersama dosen pembimbing</p>
                            </li>
                            <li className="feature-item">
                                <div className="feature-icon-wrap">
                                    <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <p className="feature-text">Penilaian sidang & berita acara digital yang terstruktur</p>
                            </li>
                        </ul>
                    </div>

                    {/* Bottom */}
                    <div className="left-bottom">
                        <div className="upnvj-badge">
                            <div className="upnvj-badge-logo">
                                <img src="/logo-upnvj.png" alt="Logo UPNVJ" />
                            </div>
                            <div>
                                <div className="upnvj-badge-text-main">Fakultas Ilmu Komputer</div>
                                <div className="upnvj-badge-text-sub">Universitas Pembangunan Nasional Veteran Jakarta</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="right-panel">
                    <div className="form-wrapper">

                        {/* Mobile logo */}
                        <div className="mobile-logo">
                            <div className="mobile-logo-icon">
                                <img src="/logo-upnvj.png" alt="Logo UPNVJ" />
                            </div>
                            <span className="mobile-logo-name">LENTERA</span>
                            <span className="mobile-logo-sub">Layanan Elektronik Tugas Akhir Terintegrasi</span>
                        </div>

                        {/* Status */}
                        {status && (
                            <div className="status-msg">
                                <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {status}
                            </div>
                        )}

                        {/* Card */}
                        <div className="form-card">
                            <div className="form-card-header">
                                <div className="form-card-tag">
                                    <span>●</span> Portal LENTERA
                                </div>
                                <h2 className="form-card-title">Selamat Datang</h2>
                                <p className="form-card-sub">Masuk ke akun Anda untuk melanjutkan</p>
                            </div>

                            <div className="form-divider" />

                            <form onSubmit={submit}>
                                {/* Email */}
                                <div className="field">
                                    <label htmlFor="email" className="field-label">Alamat Email</label>
                                    <div className="field-input-wrap">
                                        <div className="field-icon">
                                            <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="field-input"
                                            autoComplete="username"
                                            autoFocus
                                            placeholder="nama@email.com"
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-1.5" />
                                </div>

                                {/* Password */}
                                <div className="field">
                                    <label htmlFor="password" className="field-label">Password</label>
                                    <div className="field-input-wrap">
                                        <div className="field-icon">
                                            <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            className="field-input field-input-pr"
                                            autoComplete="current-password"
                                            placeholder="Masukkan password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-pw"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            ) : (
                                                <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-1.5" />
                                </div>

                                {/* Remember + Forgot */}
                                <div className="form-bottom-row">
                                    <label className="remember-wrap">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="remember-checkbox"
                                        />
                                        <span className="remember-label">Ingat saya</span>
                                    </label>
                                    {canResetPassword && (
                                        <Link href={route('password.request')} className="forgot-link">
                                            Lupa password?
                                        </Link>
                                    )}
                                </div>

                                {/* Submit */}
                                <button type="submit" disabled={processing} className="submit-btn">
                                    {processing ? (
                                        <>
                                            <svg className="spin" fill="none" viewBox="0 0 24 24">
                                                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Masuk ke Portal
                                            <svg fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Footer */}
                        <p className="form-footer">
                            © <strong>LENTERA</strong> {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}