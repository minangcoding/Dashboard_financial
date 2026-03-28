import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SkeletonCard } from '../ui/Skeleton';

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/auth/get-session', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setAuthenticated(!!data?.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0b1326] flex items-center justify-center">
      <div className="w-full max-w-md space-y-4 animate-fade-in">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );

  if (!authenticated) return <Navigate to="/" replace />;
  return children;
}
