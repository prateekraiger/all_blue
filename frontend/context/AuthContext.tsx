"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useUser, useStackApp } from "@stackframe/stack";

interface AuthContextType {
  user: any | null;
  session: any | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  token: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const stackUser = useUser();
  const stackApp = useStackApp();
  const [token, setToken] = useState<string | null>(null);

  // Fetch the Stack Auth access token whenever the user changes
  useEffect(() => {
    if (!stackUser) {
      setToken(null);
      return;
    }
    stackUser.getAuthJson().then(({ accessToken }) => {
      setToken(accessToken ?? null);
    }).catch(() => setToken(null));
  }, [stackUser]);

  // Map Stack user to what components expect
  const user = stackUser ? {
    id: stackUser.id,
    email: stackUser.primaryEmail,
    user_metadata: {
      full_name: stackUser.displayName || stackUser.primaryEmail,
      role: stackUser.clientMetadata?.role || 'user'
    }
  } : null;

  const loading = stackUser === undefined; // undefined means still loading
  const isAdmin = stackUser?.clientMetadata?.role === "admin";

  const signIn = async (_email: string, _password: string) => {
    console.warn("signIn called on AuthContext, use Stack's SignIn component instead");
  };

  const signUp = async (_email: string, _password: string, _name: string) => {
    console.warn("signUp called on AuthContext, use Stack's SignUp component instead");
  };

  const signOut = async () => {
    await stackApp.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, session: null, token, loading, signIn, signUp, signOut, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
