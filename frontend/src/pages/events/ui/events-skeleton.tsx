import { Skeleton } from 'antd'

export default function EventsSkeleton() {
  return (
    <section className="space-y-4" aria-label="Loading events">
      {[0, 1, 2].map(index => (
        <div className="rounded-app border border-border bg-surface p-5 shadow-panel" key={index}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      ))}
    </section>
  )
}
