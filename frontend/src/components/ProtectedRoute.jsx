import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FullPageLoader } from '@/components/ui/PrepNestLoader';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader message="Preparing your workspace..." cycleSubtitles />;
  }

  if (!isAuthenticated) {
    // Preserve the attempted path to redirect back after login
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  return children;
}

export default ProtectedRoute;
