import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import TeamView from './pages/TeamView'
import PeopleView from './pages/PeopleView'
import AgentsHub from './pages/AgentsHub'
import ReportsCenter from './pages/ReportsCenter'
import ChatPage from './pages/ChatPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/teams" element={<TeamView />} />
          <Route path="/people" element={<PeopleView />} />
          <Route path="/agents" element={<AgentsHub />} />
          <Route path="/reports" element={<ReportsCenter />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
