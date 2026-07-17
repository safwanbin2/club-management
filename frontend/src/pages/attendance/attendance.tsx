import { Alert, App as AntApp, Button, Empty, Input, Select, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CheckCircle2, ClipboardCheck, KeyRound, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { USER_ROLES } from '@common/constants/roles'
import { useAuthUser } from '@common/globalStates/use-auth-store'
import getApiErrorMessage from '@common/helpers/get-api-error-message'
import AppShell from '@features/app-shell'
import useAttendanceHistory from './data/use-attendance-history'
import useAttendanceReport from './data/use-attendance-report'
import useCheckIn from './data/use-check-in'
import useGenerateAttendanceToken from './data/use-generate-attendance-token'
import useManageableAttendanceEvents from './data/use-manageable-attendance-events'
import { formatDateTime, formatPercent } from './shared/helpers'
import type { AttendanceReportRow } from './shared/types'
import type { EventRegistrationStatus } from '@pages/events/shared/types'

function canManageAttendance(role: null | string | undefined) {
  return role === USER_ROLES.clubExecutive || role === USER_ROLES.universityAdmin
}

export default function AttendancePage() {
  const [searchParams] = useSearchParams()
  const user = useAuthUser()
  const { message } = AntApp.useApp()
  const [token, setToken] = useState(searchParams.get('token') ?? '')
  const [selectedEventId, setSelectedEventId] = useState<null | string>(null)
  const [reportStatus, setReportStatus] = useState<EventRegistrationStatus>('registered')
  const userCanManage = canManageAttendance(user?.role)
  const checkIn = useCheckIn()
  const generateToken = useGenerateAttendanceToken()
  const {
    attendanceHistory,
    isAttendanceHistoryError,
    isAttendanceHistoryPending,
    refetchAttendanceHistory,
    totalAttendanceHistory
  } = useAttendanceHistory()
  const { isManageableAttendanceEventsPending, manageableAttendanceEvents } =
    useManageableAttendanceEvents(userCanManage)
  const {
    attendanceReport,
    isAttendanceReportError,
    isAttendanceReportPending,
    refetchAttendanceReport
  } = useAttendanceReport(selectedEventId, reportStatus, Boolean(selectedEventId))

  useEffect(() => {
    if (!selectedEventId && manageableAttendanceEvents.length > 0) {
      setSelectedEventId(manageableAttendanceEvents[0].id)
    }
  }, [manageableAttendanceEvents, selectedEventId])

  const columns: ColumnsType<AttendanceReportRow> = useMemo(
    () => [
      {
        dataIndex: ['user', 'name'],
        title: 'Student'
      },
      {
        dataIndex: ['user', 'email'],
        title: 'Email'
      },
      {
        render: (_, row) =>
          row.attendance ? (
            <Tag color="green">Checked in {formatDateTime(row.attendance.checkedInAt)}</Tag>
          ) : (
            <Tag>Not checked in</Tag>
          ),
        title: 'Attendance'
      },
      {
        render: (_, row) =>
          row.waitlistPosition ? <Tag color="gold">#{row.waitlistPosition}</Tag> : null,
        title: 'Waitlist'
      }
    ],
    []
  )

  const handleCheckIn = () => {
    checkIn.mutate(token.trim(), {
      onError: error => {
        message.error(getApiErrorMessage(error, 'Attendance could not be recorded.'))
      },
      onSuccess: () => {
        message.success('Attendance recorded.')
        setToken('')
      }
    })
  }

  const handleGenerateToken = () => {
    if (!selectedEventId) {
      return
    }

    generateToken.mutate(selectedEventId, {
      onError: error => {
        message.error(getApiErrorMessage(error, 'Attendance token could not be generated.'))
      },
      onSuccess: () => {
        message.success('Attendance token generated.')
      }
    })
  }

  return (
    <AppShell>
      <main className="space-y-6 px-5 py-6 lg:px-8" aria-label="Attendance">
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Event attendance
          </p>
          <h1 className="m-0 text-3xl font-bold text-text lg:text-4xl">Attendance</h1>
          <p className="mb-0 mt-3 max-w-3xl text-base text-text-soft">
            Check in to registered events, review your history, and manage event attendance reports.
          </p>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-5">
            <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
              <h2 className="m-0 inline-flex items-center gap-2 text-xl font-bold text-text">
                <ClipboardCheck aria-hidden="true" size={20} />
                Student Check-In
              </h2>
              <p className="mb-4 mt-2 text-sm text-text-soft">
                Paste the token from the event QR code to record attendance during the event window.
              </p>
              <Input.TextArea
                autoSize={{ minRows: 3, maxRows: 5 }}
                onChange={event => setToken(event.target.value)}
                placeholder="Paste attendance token"
                value={token}
              />
              <Button
                className="mt-3"
                disabled={!token.trim()}
                icon={<CheckCircle2 size={17} />}
                loading={checkIn.isPending}
                onClick={handleCheckIn}
                type="primary"
              >
                Check In
              </Button>
            </section>

            <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="m-0 text-xl font-bold text-text">My Attendance History</h2>
                <Button icon={<RefreshCw size={16} />} onClick={() => refetchAttendanceHistory()}>
                  Refresh
                </Button>
              </div>

              {isAttendanceHistoryError ? (
                <Alert message="Attendance history could not load" showIcon type="error" />
              ) : null}

              {!isAttendanceHistoryPending && attendanceHistory.length === 0 ? (
                <Empty
                  description="No attendance recorded yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : null}

              {attendanceHistory.length > 0 ? (
                <div className="space-y-3">
                  {attendanceHistory.map(record => (
                    <div className="rounded-app border border-border bg-muted p-4" key={record.id}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="m-0 text-base font-bold text-text">
                            {record.event.title}
                          </h3>
                          <p className="m-0 mt-1 text-sm text-text-soft">
                            {record.event.club.name} • {record.event.venue}
                          </p>
                        </div>
                        <Tag color="green">{formatDateTime(record.checkedInAt)}</Tag>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <p className="mb-0 mt-4 text-sm font-semibold text-text-soft">
                {totalAttendanceHistory} attendance record(s)
              </p>
            </section>
          </div>

          {userCanManage ? (
            <aside className="space-y-5">
              <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
                <h2 className="m-0 inline-flex items-center gap-2 text-xl font-bold text-text">
                  <KeyRound aria-hidden="true" size={20} />
                  QR Token
                </h2>
                <p className="mb-4 mt-2 text-sm text-text-soft">
                  Generate a 15-minute token for a managed event and share it as a QR payload.
                </p>
                <Select
                  className="w-full"
                  loading={isManageableAttendanceEventsPending}
                  onChange={setSelectedEventId}
                  options={manageableAttendanceEvents.map(event => ({
                    label: `${event.title} • ${event.club.name}`,
                    value: event.id
                  }))}
                  placeholder="Select event"
                  value={selectedEventId ?? undefined}
                />
                <Button
                  className="mt-3"
                  disabled={!selectedEventId}
                  loading={generateToken.isPending}
                  onClick={handleGenerateToken}
                  type="primary"
                >
                  Generate Token
                </Button>

                {generateToken.data?.data ? (
                  <div className="mt-4 space-y-3">
                    <Input.TextArea readOnly value={generateToken.data.data.token} />
                    <Input readOnly value={generateToken.data.data.checkInUrl} />
                    <p className="m-0 text-xs text-text-soft">
                      Expires {formatDateTime(generateToken.data.data.expiresAt)}
                    </p>
                  </div>
                ) : null}
              </section>

              <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="m-0 text-xl font-bold text-text">Attendance Report</h2>
                    <p className="m-0 mt-1 text-sm text-text-soft">
                      {attendanceReport
                        ? `${attendanceReport.summary.checkedIn}/${attendanceReport.summary.registered} checked in (${formatPercent(attendanceReport.summary.checkedIn, attendanceReport.summary.registered)})`
                        : 'Select an event to view attendance.'}
                    </p>
                  </div>
                  <Select
                    onChange={setReportStatus}
                    options={[
                      { label: 'Registered', value: 'registered' },
                      { label: 'Waitlisted', value: 'waitlisted' }
                    ]}
                    value={reportStatus}
                  />
                  <Button icon={<RefreshCw size={16} />} onClick={() => refetchAttendanceReport()}>
                    Refresh
                  </Button>
                </div>

                {isAttendanceReportError ? (
                  <Alert message="Attendance report could not load" showIcon type="error" />
                ) : null}

                <Table
                  columns={columns}
                  dataSource={attendanceReport?.rows.data ?? []}
                  loading={isAttendanceReportPending}
                  pagination={false}
                  rowKey="registrationId"
                  scroll={{ x: 760 }}
                  size="small"
                />
              </section>
            </aside>
          ) : null}
        </section>
      </main>
    </AppShell>
  )
}
