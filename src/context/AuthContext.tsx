"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Client, Account, Models } from "appwrite";

const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "";
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";

const client = new Client();
client.setEndpoint(appwriteEndpoint).setProject(appwriteProjectId);
const account = new Account(client);

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      try {
        const user = await account.get();
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
		await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      setUser(user);
      return null;
    } catch (err: any) {
      setUser(null);
      return err?.message || "Login failed";
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
