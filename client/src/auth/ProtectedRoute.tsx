import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

type ProtectedRouteProps = {
  children?: ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactElement {
  const { user, loading } = useAuth();

  

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;