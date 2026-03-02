import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout         from './components/Layout'
import LoginPage      from './pages/LoginPage'
import Dashboard      from './pages/Dashboard'
import Members        from './pages/Members'
import MemberForm     from './pages/MemberForm'
import Plans          from './pages/Plans'
import Trainers       from './pages/Trainers'
import Attendance     from './pages/Attendance'
import Payments       from './pages/Payments'
import Reports        from './pages/Reports'
import Notifications  from './pages/Notifications'
import Settings        from './pages/Settings'
import MemberProfile   from './pages/MemberProfile'
import ForgotPassword  from './pages/ForgotPassword'
import ResetPassword   from './pages/ResetPassword'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"                      element={<LoginPage />} />
          <Route path="/forgot-password"            element={<ForgotPassword />} />
          <Route path="/reset-password/:token"      element={<ResetPassword />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index                   element={<Dashboard />} />
            <Route path="members"          element={<Members />} />
            <Route path="members/new"      element={<MemberForm />} />
            <Route path="members/:id/edit"    element={<MemberForm />} />
            <Route path="members/:id/profile" element={<MemberProfile />} />
            <Route path="plans"            element={<Plans />} />
            <Route path="trainers"         element={<Trainers />} />
            <Route path="attendance"       element={<Attendance />} />
            <Route path="payments"         element={<Payments />} />
            <Route path="reports"          element={<Reports />} />
            <Route path="notifications"    element={<Notifications />} />
            <Route path="settings"         element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
