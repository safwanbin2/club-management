import { Spin } from 'antd'
import { Navigate, Outlet } from 'react-router-dom'

import { useAuthUser } from '@common/globalStates/use-auth-store'
import { useAuthBootstrap } from '@common/hooks/use-auth-bootstrap'

function FullPageLoader() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas">
      <Spin size="large" />
    </main>
  )
}

export default function GuestRoute() {
  const user = useAuthUser()
  const { isAuthBootstrapping } = useAuthBootstrap()

  if (isAuthBootstrapping) {
    return <FullPageLoader />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
