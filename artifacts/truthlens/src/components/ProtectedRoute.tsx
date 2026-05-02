import { Route, Redirect } from "wouter";
import React from "react";
import { useAuth } from "../lib/auth";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { token, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-t-[#00D4FF] animate-spin" />
            </div>
          );
        }
        if (!token) {
          return <Redirect to="/login" />;
        }
        return <Component />;
      }}
    </Route>
  );
}
