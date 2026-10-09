import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import RepoLayout from './layouts/RepoLayout.jsx';

import LandingPage from './pages/LandingPage.jsx';
import AnalyzePage from './pages/AnalyzePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import FilesPage from './pages/FilesPage.jsx';
import ArchitecturePage from './pages/ArchitecturePage.jsx';
import InsightsPage from './pages/InsightsPage.jsx';
import AskBuddyPage from './pages/AskBuddyPage.jsx';
import GitReferencePage from './pages/GitReferencePage.jsx';
import GitErrorHelperPage from './pages/GitErrorHelperPage.jsx';
import GitDoctorPage from './pages/GitDoctorPage.jsx';
import AuthPage from './pages/AuthPage.jsx';

export function App() {
  return (
    <Routes>
      {/* Standalone Pages with Global Navbar & Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/git" element={<GitReferencePage />} />
        <Route path="/git/errors" element={<GitErrorHelperPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

        {/* Repository Analysis Context & Sub-navigation */}
        <Route path="/repository/:owner/:repo" element={<RepoLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="architecture" element={<ArchitecturePage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="doctor" element={<GitDoctorPage />} />
          <Route path="ask" element={<AskBuddyPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
