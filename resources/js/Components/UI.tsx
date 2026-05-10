import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';

// ==================== MODAL ====================
export function Modal({ show, onClose, title, children, maxWidth = 'max-w-lg' }: {
  show: boolean; onClose: () => void; title: string; children: React.ReactNode; maxWidth?: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (show) setTimeout(() => setVisible(true), 10); else setVisible(false); }, [show]);
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} transition-all duration-300 ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ==================== SEARCH INPUT ====================
export function SearchInput({ value, onChange, placeholder = 'Cari...' }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-200 outline-none" />
    </div>
  );
}

// ==================== STAT CARD ====================
export function StatCard({ icon, label, value, color, sub }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 hover:shadow-md hover:border-gray-200 transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-gray-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ==================== BADGE ====================
export function Badge({ children, color = 'gray', dot }: { children: React.ReactNode; color?: string; dot?: boolean }) {
  const colors: Record<string, string> = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    red: 'bg-red-50 text-red-700 ring-red-600/20',
    yellow: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    gray: 'bg-gray-50 text-gray-700 ring-gray-600/20',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  };
  const dotColors: Record<string, string> = {
    green: 'bg-emerald-500', red: 'bg-red-500', yellow: 'bg-amber-500',
    blue: 'bg-blue-500', purple: 'bg-purple-500', gray: 'bg-gray-500', indigo: 'bg-indigo-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${colors[color] || colors.gray}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color] || dotColors.gray}`} />}
      {children}
    </span>
  );
}

// ==================== AVATAR ====================
export function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  const initials = name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  const colors = ['from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-purple-500 to-pink-600', 'from-amber-500 to-orange-600', 'from-cyan-500 to-blue-600'];
  const colorIdx = name?.split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 0;

  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white shadow-sm`} />;
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[colorIdx % colors.length]} flex items-center justify-center text-white font-bold ring-2 ring-white shadow-sm`}>
      {initials}
    </div>
  );
}

// ==================== BUTTON ====================
export function Button({ children, variant = 'primary', size = 'md', onClick, type = 'button', disabled, className = '', icon }: {
  children: React.ReactNode; variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'; size?: 'sm' | 'md' | 'lg';
  onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean; className?: string; icon?: React.ReactNode;
}) {
  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-200',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-sm shadow-red-200',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-800',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-sm shadow-emerald-200',
  };
  const sizes: Record<string, string> = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}>
      {icon}{children}
    </button>
  );
}

// ==================== INPUT ====================
export function Input({ label, error, ...props }: { label: string; error?: string; } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input {...props} className={`w-full border rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-200 outline-none ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, ...props }: { label: string; error?: string; } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <select {...props} className={`w-full border rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-200 outline-none ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
        {children}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, ...props }: { label: string; error?: string; } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <textarea {...props} className={`w-full border rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-200 outline-none resize-none ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ==================== EMPTY STATE ====================
export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon && <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-600 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 text-center max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ==================== TABLE ====================
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-50/80 border-b border-gray-100"><tr>{children}</tr></thead>;
}

export function TableHeaderCell({ children, width }: { children: React.ReactNode; width?: string }) {
  return <th style={width ? { width } : undefined} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{children}</th>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-50">{children}</tbody>;
}

export function TableRow({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <tr className={`${onClick ? 'cursor-pointer' : ''} hover:bg-gray-50/50 transition-colors duration-150`} onClick={onClick}>{children}</tr>;
}

export function TableCell({ children, className = '', colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={`px-5 py-3.5 ${className}`}>{children}</td>;
}

// ==================== PAGE HEADER ====================
export function PageHeader({ title, description, actions, breadcrumbs }: {
  title?: string; description?: string; actions?: React.ReactNode; breadcrumbs?: { label: string; href?: string }[];
}) {
  return (
    <div className="mb-6">
      {breadcrumbs && (
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
              {b.href ? <Link href={b.href} className="hover:text-indigo-600 transition-colors">{b.label}</Link> : <span className="text-gray-600 font-medium">{b.label}</span>}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

// ==================== FLASH MESSAGE ====================
export function FlashMessage({ message, type = 'success' }: { message?: string; type?: 'success' | 'error' | 'warning' }) {
  const [show, setShow] = useState(!!message);
  useEffect(() => { if (message) { setShow(true); const t = setTimeout(() => setShow(false), 4000); return () => clearTimeout(t); } }, [message]);
  if (!show || !message) return null;
  const configs = {
    success: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: '✓' },
    error: { bg: 'bg-red-50 border-red-200 text-red-800', icon: '✕' },
    warning: { bg: 'bg-amber-50 border-amber-200 text-amber-800', icon: '⚠' },
  };
  const cfg = configs[type];
  return (
    <div className={`mb-5 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium animate-slideDown ${cfg.bg}`}>
      <span className="w-6 h-6 rounded-full bg-current/10 flex items-center justify-center text-xs">{cfg.icon}</span>
      {message}
      <button onClick={() => setShow(false)} className="ml-auto text-current/50 hover:text-current">✕</button>
    </div>
  );
}

// ==================== CARD ====================
export function Card({ children, className = '', padding = true }: { children: React.ReactNode; className?: string; padding?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100/80 ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
          {title}
        </h3>
        {description && <p className="text-xs text-gray-400 mt-1 ml-3">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ==================== PROGRESS BAR ====================
export function ProgressBar({ value, max = 100, color = 'indigo', showLabel = true }: {
  value: number; max?: number; color?: string; showLabel?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colors: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-600',
    green: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-amber-500 to-amber-600',
  };
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${colors[color] || colors.indigo} rounded-full transition-all duration-500 ease-out`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs font-medium text-gray-500 min-w-[3rem] text-right">{Math.round(pct)}%</span>}
    </div>
  );
}

// ==================== TABS ====================
export function Tabs({ tabs, active, onChange }: {
  tabs: { key: string; label: string; count?: number }[]; active: string; onChange: (key: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
      {tabs.map(tab => (
        <button key={tab.key} onClick={() => onChange(tab.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${active === tab.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          {tab.label}
          {tab.count !== undefined && (
            <span className={`px-1.5 py-0.5 rounded-md text-xs ${active === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'}`}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}