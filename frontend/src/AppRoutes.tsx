import { Navigate, Route, Routes } from 'react-router-dom'

import FeedPage from '@pages/feed'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="/feed" element={<FeedPage />} />
    </Routes>
  )
}
