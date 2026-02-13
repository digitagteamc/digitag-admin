"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@digitag.com");
  const [password, setPassword] = useState("Admin@12345");
  const [error, setError] = useState<string | null>(null);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch(`${API}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ required to store cookie
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.message || "Login failed");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={login} className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-bold">DigiTag Admin</h1>
        <p className="mt-2 text-white/70">Login to approve creators.</p>

        <div className="mt-6 grid gap-3">
          <input className="p-3 rounded-xl bg-black/30 border border-white/10"
            value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input className="p-3 rounded-xl bg-black/30 border border-white/10"
            value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />

          <button className="p-3 rounded-xl bg-white text-black font-semibold">Login</button>

          {error && <div className="text-red-300">{error}</div>}
        </div>
      </form>
    </main>
  );
}
