import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center text-[#64748B] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFA116]" />
        <span className="text-xs font-semibold tracking-wide text-[#64748B]">
          Verifying session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the attempted path to redirect back after login
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  return children;
}

export default ProtectedRoute;
