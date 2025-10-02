'use client';


import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Login() {

  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("dev.psgurav@gmail.com");
  const [password, setPassword] = useState("toor@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // console.log("Auth loading:", authLoading, "User:", user);

  if (!authLoading && user) {
    router.push("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    const errMsg = await login(email, password);
    if (!errMsg) {
      router.push("/");
    } else {
      console.log(errMsg)
      setError("Login failed. Please check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/30 p-8 sm:p-10 flex flex-col gap-6"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center ">Welcome Back</h2>
          <p className="text-center text-gray-600 text-sm mb-6">Sign in to continue to your dashboard</p>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 rounded-lg p-2 border border-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all placeholder-gray-400 text-gray-900 font-medium shadow-sm"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all placeholder-gray-400 text-gray-900 font-medium shadow-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {(loading || authLoading) ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : "Sign In"}
        </button>


      </form>
    </div>
  );
}
