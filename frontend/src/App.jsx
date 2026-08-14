import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/Landing';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import DashboardPage from './pages/Dashboard';
import DSAPage from './pages/DSA';
import AIAssistantPage from './pages/AIAssistant';
import CompanyPrepPage from './pages/CompanyPrep';
import MockInterviewPage from './pages/MockInterview';
import ResumeAnalyzerPage from './pages/ResumeAnalyzer';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dsa" element={<DSAPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/company-prep" element={<CompanyPrepPage />} />
        <Route path="/mock-interview" element={<MockInterviewPage />} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
        {/* Fallback for other routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
