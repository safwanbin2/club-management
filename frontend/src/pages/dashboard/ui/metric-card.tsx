import { CalendarDays, CheckCircle2, Info, ShieldAlert, TrendingUp } from 'lucide-react'

import type { DashboardMetric, DashboardTone } from '../shared/types'

const toneClasses: Record<DashboardTone, string> = {
  danger: 'bg-red-50 text-accent-red',
  info: 'bg-blue-50 text-accent-blue',
  primary: 'bg-primary-soft text-primary',
  success: 'bg-green-50 text-accent-green',
  warning: 'bg-amber-50 text-accent-amber'
}

const toneIcons: Record<DashboardTone, typeof TrendingUp> = {
  danger: ShieldAlert,
  info: CalendarDays,
  primary: TrendingUp,
  success: CheckCircle2,
  warning: Info
}

type MetricCardProps = {
  metric: DashboardMetric
}

export default function MetricCard({ metric }: MetricCardProps) {
  const Icon = toneIcons[metric.tone]

  return (
    <article className="rounded-app border border-border bg-surface p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div className={`grid size-12 place-items-center rounded-app ${toneClasses[metric.tone]}`}>
          <Icon size={22} aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold text-text-soft">{metric.change}</span>
      </div>
      <p className="mb-0 mt-6 text-xs font-semibold uppercase tracking-[0.08em] text-text-soft">
        {metric.label}
      </p>
      <p className="mb-0 mt-1 text-4xl font-bold text-primary">{metric.value}</p>
    </article>
  )
}
