import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import DashboardPage from "./pages/Dashboard";
import DSAPage from "./pages/DSA";
import AIAssistantPage from "./pages/AIAssistant";
import CompanyPrepPage from "./pages/CompanyPrep";
import MockInterviewPage from "./pages/MockInterview";
import ResumeAnalyzerPage from "./pages/ResumeAnalyzer";
import AptitudePage from "./pages/Aptitude";
import RoadmapsPage from "./pages/Roadmaps";
import ProjectsPage from "./pages/Projects";
import LeaderboardPage from "./pages/Leaderboard";
import SettingsPage from "./pages/Settings";
import CommunityPage from "./pages/Community";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes (Require Neon Auth Login) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/aptitude"
            element={
              <ProtectedRoute>
                <AptitudePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/roadmaps"
            element={
              <ProtectedRoute>
                <RoadmapsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dsa"
            element={
              <ProtectedRoute>
                <DSAPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute>
                <AIAssistantPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company-prep"
            element={
              <ProtectedRoute>
                <CompanyPrepPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock-interview"
            element={
              <ProtectedRoute>
                <MockInterviewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resume-analyzer"
            element={
              <ProtectedRoute>
                <ResumeAnalyzerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback to landing */}
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}