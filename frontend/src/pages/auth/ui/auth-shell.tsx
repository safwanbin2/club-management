import { BadgeCheck, Building2, GraduationCap, ShieldCheck } from 'lucide-react'
import type { PropsWithChildren, ReactNode } from 'react'

type AuthShellProps = PropsWithChildren<{
  footer?: ReactNode
  subtitle: string
  title: string
}>

export default function AuthShell({ children, footer, subtitle, title }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-canvas text-text lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(480px,1fr)]">
      <section className="relative hidden overflow-hidden border-r border-border bg-primary-soft lg:block">
        <div className="absolute left-10 top-10 flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-app bg-primary text-white shadow-panel">
            <GraduationCap size={26} aria-hidden="true" />
          </div>
          <div>
            <p className="m-0 text-2xl font-bold text-primary">CampusHub</p>
            <p className="m-0 text-sm text-text-soft">University Club Management</p>
          </div>
        </div>

        <div className="absolute inset-x-10 bottom-10 rounded-app border border-border bg-surface p-8 shadow-panel">
          <div className="mb-5 flex items-center gap-2 text-primary">
            <BadgeCheck size={18} aria-hidden="true" />
            <span className="text-sm font-semibold uppercase tracking-[0.08em]">
              Trusted Operations
            </span>
          </div>
          <h2 className="m-0 max-w-xl text-3xl font-bold text-text">
            One secure gateway for campus clubs.
          </h2>
          <p className="mb-0 mt-4 max-w-2xl text-base text-text-soft">
            Students, executives, and administrators share one authenticated workspace for club
            activity, approvals, events, and communications.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              ['450+', 'Organizations'],
              ['3', 'Role portals'],
              ['24/7', 'Access']
            ].map(([value, label]) => (
              <div key={label} className="rounded-app border border-border bg-muted p-4">
                <p className="m-0 text-xl font-bold text-primary">{value}</p>
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-text-soft">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[480px]">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto grid size-24 place-items-center rounded-[20px] bg-primary text-white shadow-panel">
              <Building2 size={46} aria-hidden="true" />
            </div>
            <p className="mb-0 mt-5 text-4xl font-bold text-primary">CampusHub</p>
            <p className="mx-auto mt-3 max-w-sm text-base text-text-soft">
              The centralized gateway for university administration and student club management.
            </p>
          </div>

          <div className="rounded-app border border-border bg-surface p-6 shadow-panel sm:p-8">
            <div className="mb-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                <ShieldCheck size={14} aria-hidden="true" />
                Secure Access
              </div>
              <h1 className="m-0 text-3xl font-bold text-text">{title}</h1>
              <p className="mb-0 mt-2 text-base text-text-soft">{subtitle}</p>
            </div>
            {children}
          </div>

          {footer ? <div className="mt-6 text-center text-sm text-text-soft">{footer}</div> : null}
        </div>
      </section>
    </main>
  )
}
