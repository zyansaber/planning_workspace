import { useAuth } from '@/auth/AuthProvider';
import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Checking your account…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export function SettingsRoute() {
  const { loading, isSettingsAdmin } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Checking your account…</div>;
  if (!isSettingsAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
