import { useState, useRef } from 'react'
import { X, Loader2, ChevronDown } from 'lucide-react'

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className = '', loading, ...props }) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' }
  const variants = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    danger:  'bg-rose-500 hover:bg-rose-600 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-black',
    ghost:   'bg-transparent border border-slate-600 hover:bg-slate-700 text-slate-300',
    outline: 'bg-transparent border border-indigo-500 hover:bg-indigo-500/10 text-indigo-400',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</label>}
      <input
        className={`w-full bg-slate-900 border ${error ? 'border-rose-500' : 'border-slate-700'} rounded-lg px-3 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:border-indigo-500 transition-colors ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, options = [], error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</label>}
      <select
        className={`w-full bg-slate-900 border ${error ? 'border-rose-500' : 'border-slate-700'} rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:border-indigo-500 transition-colors ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  )
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function Textarea({ label, error, rows = 3, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</label>}
      <textarea
        rows={rows}
        className={`w-full bg-slate-900 border ${error ? 'border-rose-500' : 'border-slate-700'} rounded-lg px-3 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:border-indigo-500 transition-colors resize-none`}
        {...props}
      />
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-500/20 text-indigo-400',
    green:  'bg-emerald-500/20 text-emerald-400',
    red:    'bg-rose-500/20 text-rose-400',
    yellow: 'bg-amber-500/20 text-amber-400',
    blue:   'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    slate:  'bg-slate-500/20 text-slate-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${colors[color] || colors.slate}`}>
      {children}
    </span>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-slate-800 rounded-2xl w-full ${maxWidth} shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto animate-fade-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="font-bold text-slate-100 text-base">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  )
}

// ── KpiCard ───────────────────────────────────────────────────────────────────
export function KpiCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5 flex items-center justify-center">
        {Icon && <Icon size={64} />}
      </div>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</span>
        {Icon && (
          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
            <Icon size={16} style={{ color }} />
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-slate-100 font-mono mb-1">{value}</div>
      <div className="flex items-center gap-2">
        {trend && (
          <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-400' : trend.startsWith('-') ? 'text-rose-400' : 'text-slate-500'}`}>
            {trend}
          </span>
        )}
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
      </div>
    </Card>
  )
}

// ── Table ─────────────────────────────────────────────────────────────────────
export function Table({ columns, data, loading, emptyText = 'No records found', emptyIcon = '📋' }) {
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-indigo-400" />
    </div>
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-700">
            {columns.map((col) => (
              <th key={col.key} className="text-xs text-slate-500 font-bold uppercase tracking-wide px-3 py-3 text-left whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <div className="text-4xl mb-3">{emptyIcon}</div>
                <div className="text-slate-500 font-medium">{emptyText}</div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-3 text-sm text-slate-300 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── SearchInput ───────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:border-indigo-500 transition-colors"
      />
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 24 }) {
  return <Loader2 size={size} className="animate-spin text-indigo-400" />
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-black text-slate-100">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// ── AlertBanner ───────────────────────────────────────────────────────────────
export function AlertBanner({ type = 'warning', children }) {
  const styles = {
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    error:   'bg-rose-500/10 border-rose-500/30 text-rose-400',
    info:    'bg-blue-500/10 border-blue-500/30 text-blue-400',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  }
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm font-medium ${styles[type]}`}>
      {children}
    </div>
  )
}
