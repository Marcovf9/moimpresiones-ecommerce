import type { QuoteStatus } from '../adminTypes'

const STYLES: Record<QuoteStatus, { label: string; className: string }> = {
  PENDIENTE: { label: 'Pendiente', className: 'bg-brand-500/10 text-brand-600' },
  RESPONDIDA: { label: 'Respondida', className: 'bg-emerald-500/10 text-emerald-700' },
  CERRADA: { label: 'Cerrada', className: 'bg-ink-100 text-ink-500' },
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const style = STYLES[status]
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}>
      {style.label}
    </span>
  )
}
