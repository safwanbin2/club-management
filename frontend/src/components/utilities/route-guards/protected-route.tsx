import { Spin } from 'antd'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthUser } from '@common/globalStates/use-auth-store'
import { useAuthBootstrap } from '@common/hooks/use-auth-bootstrap'

function FullPageLoader() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas">
      <Spin size="large" />
    </main>
  )
}

export default function ProtectedRoute() {
  const location = useLocation()
  const user = useAuthUser()
  const { isAuthBootstrapping } = useAuthBootstrap()

  if (isAuthBootstrapping) {
    return <FullPageLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
