import type { ReactNode } from 'react'

/** Piezas visuales compartidas por las pantallas del panel. */

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-ink-100 bg-white p-6 ${className}`}>{children}</div>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="font-display text-lg font-semibold text-ink-900">{children}</h2>
      {action}
    </div>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-ink-900 text-white hover:bg-ink-700',
  secondary: 'border border-ink-300 text-ink-900 hover:border-ink-900',
  danger: 'border border-brand-500 text-brand-600 hover:bg-brand-600 hover:text-white',
  ghost: 'text-ink-500 hover:bg-ink-100 hover:text-ink-900',
}

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled,
  className = '',
}: {
  children: ReactNode
  variant?: ButtonVariant
  type?: 'button' | 'submit'
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_STYLES[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  placeholder?: string
  type?: string
  required?: boolean
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-900">
        {label}
        {required && <span className="text-brand-600"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-lg border px-3 py-2 text-ink-900 transition focus:outline-none disabled:bg-ink-50 ${
          error ? 'border-brand-500' : 'border-ink-300 focus:border-ink-900'
        }`}
      />
      {hint && !error && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-sm text-brand-600">
          {error}
        </span>
      )}
    </label>
  )
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  hint,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  hint?: string
  error?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-900">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className={`w-full rounded-lg border px-3 py-2 text-ink-900 transition focus:outline-none ${
          error ? 'border-brand-500' : 'border-ink-300 focus:border-ink-900'
        }`}
      />
      {hint && !error && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-sm text-brand-600">
          {error}
        </span>
      )}
    </label>
  )
}

export function Banner({ kind, children }: { kind: 'error' | 'ok'; children: ReactNode }) {
  const styles =
    kind === 'error' ? 'bg-brand-500/10 text-brand-600' : 'bg-emerald-500/10 text-emerald-700'
  return (
    <p role="alert" className={`rounded-lg px-4 py-3 text-sm ${styles}`}>
      {children}
    </p>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-300 px-6 py-10 text-center text-ink-500">
      {children}
    </div>
  )
}

export function Spinner({ label }: { label: string }) {
  return (
    <p role="status" className="py-10 text-center text-ink-500">
      {label}...
    </p>
  )
}
