import { Empty, Tag } from 'antd'

import type { DashboardPanel, DashboardTone } from '../shared/types'

const tagColors: Record<DashboardTone, string> = {
  danger: 'red',
  info: 'blue',
  primary: 'magenta',
  success: 'green',
  warning: 'gold'
}

type DashboardPanelProps = {
  panel: DashboardPanel
}

export default function DashboardPanel({ panel }: DashboardPanelProps) {
  return (
    <section className="rounded-app border border-border bg-surface shadow-panel">
      <div className="border-b border-border px-5 py-4">
        <h2 className="m-0 text-xl font-bold text-text">{panel.title}</h2>
      </div>

      {panel.items.length > 0 ? (
        <div className="divide-y divide-border">
          {panel.items.map(item => (
            <article key={item.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="m-0 text-base font-semibold text-text">{item.title}</h3>
                  <p className="mb-0 mt-1 text-sm text-text-soft">{item.description}</p>
                  <p className="mb-0 mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                    {item.meta}
                  </p>
                </div>
                <Tag color={tagColors[item.tone]}>{item.status}</Tag>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="px-5 py-10">
          <Empty description={<span>{panel.emptyTitle}</span>}>
            <p className="mx-auto mb-0 max-w-md text-sm text-text-soft">{panel.emptyDescription}</p>
          </Empty>
        </div>
      )}
    </section>
  )
}
