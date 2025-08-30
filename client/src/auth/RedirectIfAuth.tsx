import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

type RedirectIfAuthProps = {
  children?: ReactNode;
};

function RedirectIfAuth({ children }: RedirectIfAuthProps): React.ReactElement {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <Navigate to="/" replace /> : <>{children}</>;
}

export default RedirectIfAuth;