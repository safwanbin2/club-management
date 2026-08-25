import { Navigate, Route, Routes } from 'react-router-dom'

import { GuestRoute, ProtectedRoute } from '@utilities/route-guards'
import AssistantPage from '@pages/assistant'
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from '@pages/auth'
import ChatPage from '@pages/chat'
import { ClubDetailPage, ClubsPage } from '@pages/clubs'
import DashboardPage from '@pages/dashboard'
import EventsPage from '@pages/events'
import FeedPage from '@pages/feed'
import NotificationsPage from '@pages/notifications'
import PollsPage from '@pages/polls'
import ProfilePage from '@pages/profile'
import ResourcesPage from '@pages/resources'
import SearchPage from '@pages/search'
import SettingsPage from '@pages/settings'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/student/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/executive/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/clubs/:clubId" element={<ClubDetailPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/polls" element={<PollsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profiles/:userId" element={<ProfilePage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
