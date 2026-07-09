import { Alert, Button } from 'antd'
import { RefreshCw } from 'lucide-react'

import AppShell from '@features/app-shell'
import useDashboardSummary from './data/use-dashboard-summary'
import DashboardPanel from './ui/dashboard-panel'
import DashboardSkeleton from './ui/dashboard-skeleton'
import MetricCard from './ui/metric-card'

export default function DashboardPage() {
  const { dashboardSummary, isDashboardError, isDashboardPending, refetchDashboardSummary } =
    useDashboardSummary()

  return (
    <AppShell>
      <main className="px-5 py-6 lg:px-8">
        {isDashboardPending ? <DashboardSkeleton /> : null}

        {isDashboardError ? (
          <Alert
            action={
              <Button icon={<RefreshCw size={16} />} onClick={() => refetchDashboardSummary()}>
                Retry
              </Button>
            }
            message="Dashboard could not load"
            showIcon
            type="error"
          />
        ) : null}

        {dashboardSummary ? (
          <div className="space-y-6">
            <section className="rounded-app border border-border bg-primary-soft p-6 shadow-panel lg:p-10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                {dashboardSummary.hero.eyebrow}
              </p>
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <h1 className="m-0 max-w-3xl text-3xl font-bold text-text lg:text-4xl">
                    {dashboardSummary.hero.title}
                  </h1>
                  <p className="mb-0 mt-3 max-w-3xl text-base text-text-soft">
                    {dashboardSummary.hero.subtitle}
                  </p>
                </div>
                <Button
                  icon={<RefreshCw size={16} />}
                  onClick={() => refetchDashboardSummary()}
                  type="primary"
                >
                  Refresh Dashboard
                </Button>
              </div>
            </section>

            <section
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
              aria-label="Dashboard metrics"
            >
              {dashboardSummary.metrics.map(metric => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-2" aria-label="Dashboard work panels">
              {dashboardSummary.panels.map(panel => (
                <DashboardPanel key={panel.id} panel={panel} />
              ))}
            </section>
          </div>
        ) : null}
      </main>
    </AppShell>
  )
}
