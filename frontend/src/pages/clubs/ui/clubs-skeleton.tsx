import { Skeleton } from 'antd'

export default function ClubsSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-app border border-border bg-surface p-5 shadow-panel">
          <Skeleton.Image active className="mb-4 !h-36 !w-full" />
          <Skeleton active paragraph={{ rows: 3 }} title={{ width: '70%' }} />
        </div>
      ))}
    </div>
  )
}
