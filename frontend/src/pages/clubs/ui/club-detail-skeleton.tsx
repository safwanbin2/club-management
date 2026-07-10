import { Skeleton } from 'antd'

export default function ClubDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-app border border-border bg-surface p-6 shadow-panel">
        <Skeleton active paragraph={{ rows: 4 }} title={{ width: '45%' }} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-app border border-border bg-surface p-6 shadow-panel">
          <Skeleton active paragraph={{ rows: 6 }} title={{ width: '35%' }} />
        </div>
        <div className="rounded-app border border-border bg-surface p-6 shadow-panel">
          <Skeleton active paragraph={{ rows: 5 }} title={{ width: '55%' }} />
        </div>
      </div>
    </div>
  )
}
