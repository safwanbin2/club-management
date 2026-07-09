import { Skeleton } from 'antd'

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-app border border-border bg-primary-soft p-8">
        <Skeleton active paragraph={{ rows: 3 }} title={{ width: '45%' }} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-app border border-border bg-surface p-6 shadow-panel">
            <Skeleton active paragraph={{ rows: 2 }} title={{ width: '50%' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
