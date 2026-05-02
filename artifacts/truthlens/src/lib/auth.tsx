import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  tier: string;
  scanCount: number;
  createdAt: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem("truthlens_token"); } catch { return null; }
  });

  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });

  useEffect(() => {
    if (isError) {
      doLogout();
    }
  }, [isError]);

  const doLogout = () => {
    try { localStorage.removeItem("truthlens_token"); } catch {}
    setToken(null);
    queryClient.setQueryData(getGetMeQueryKey(), null);
  };

  const login = (newToken: string) => {
    try { localStorage.setItem("truthlens_token", newToken); } catch {}
    setToken(newToken);
  };

  return (
    <AuthContext.Provider value={{ user: (user as AuthUser) ?? null, isLoading, login, logout: doLogout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
