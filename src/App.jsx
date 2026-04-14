import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RosterProvider } from './context/RosterContext.jsx'
import AppShell from './components/layout/AppShell.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ShiftsPage from './pages/ShiftsPage.jsx'
import WorkersPage from './pages/WorkersPage.jsx'
import CompliancePage from './pages/CompliancePage.jsx'

export default function App() {
  return (
    <HashRouter>
      <RosterProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/shifts" element={<ShiftsPage />} />
            <Route path="/workers" element={<WorkersPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
          </Routes>
        </AppShell>
      </RosterProvider>
    </BrowserRouter>
  )
}
