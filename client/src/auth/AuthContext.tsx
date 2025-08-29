import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const refreshAccessToken = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/users/refresh", {
        withCredentials: true, 
      });
      setAccessToken(res.data.accessToken);
    } catch (err) {
      console.error("Failed to refresh access token", err);
      setAccessToken(null);
    }
  };

  useEffect(() => {
    refreshAccessToken();
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
