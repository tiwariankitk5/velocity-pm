"use client";

import { FormEvent, useState } from "react";
import { Eye, Lock, Mail, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const setSession = useAuthStore((state) => state.setSession);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await api<{ data: { user: any; accessToken: string } }>(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setSession(response.data.user, response.data.accessToken);
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4">
      <section className="w-full max-w-md rounded border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded bg-ink font-bold text-white">V</div>
          <h1 className="text-2xl font-semibold">{mode === "login" ? "Welcome back" : "Create your workspace"}</h1>
          <p className="mt-1 text-sm text-black/60">Secure project collaboration with AI planning built in.</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Name</span>
              <div className="flex items-center gap-2 rounded border border-black/10 px-3 py-2"><UserPlus size={18} /><input name="name" required className="w-full outline-none" /></div>
            </label>
          )}
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <div className="flex items-center gap-2 rounded border border-black/10 px-3 py-2"><Mail size={18} /><input name="email" type="email" required className="w-full outline-none" /></div>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <div className="flex items-center gap-2 rounded border border-black/10 px-3 py-2"><Lock size={18} /><input name="password" type="password" required minLength={8} className="w-full outline-none" /><Eye size={18} /></div>
          </label>
          {error && <p className="rounded bg-coral/10 p-2 text-sm font-medium text-coral">{error}</p>}
          <button className="focus-ring w-full rounded bg-ink px-4 py-2 font-semibold text-white">{mode === "login" ? "Log in" : "Sign up"}</button>
        </form>

        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-4 text-sm font-semibold text-teal">
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>
      </section>
    </main>
  );
}
