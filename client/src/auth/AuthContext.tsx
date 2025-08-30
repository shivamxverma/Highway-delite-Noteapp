import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { supabase } from "../api/supabase";

type JwtPayload = {
  _id: string;
  name: string;
  email: string;
  [key: string]: unknown;
};

type User = {
  id: string;
  name : string;
  email : string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const setUserFromToken = useCallback((token: string) => {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      setUser({ id: payload._id , name: payload.name , email : payload.email});
      localStorage.setItem("accessToken", token);
    } catch (error) {
      console.error("Failed to decode token:", error);
      setUser(null);
      localStorage.removeItem("accessToken");
    }
  }, []);

  useEffect(() => {
    const localToken = localStorage.getItem("accessToken");
    if (localToken) {
      setUserFromToken(localToken);
    }
    setLoading(false);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const token = session?.access_token;
          if (token) {
            setUserFromToken(token);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem("accessToken");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUserFromToken]);

  const login = (token: string) => {
    setUserFromToken(token);
  };
  
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("accessToken");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, logout]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);