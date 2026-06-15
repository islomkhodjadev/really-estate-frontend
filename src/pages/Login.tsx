import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ login: "", password: "" });
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await login(form.login, form.password);
      nav("/dashboard");
    } catch (e: any) {
      setErr(e.message || "login failed");
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-5xl animate-fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl bg-surface shadow-soft ring-1 ring-ink/[0.06]">
          {/* Branded gradient panel */}
          <div className="gradient-hero relative hidden lg:flex flex-col justify-between p-10 !rounded-none">
            {/* drifting glow blobs */}
            <div className="pointer-events-none absolute -top-16 -left-10 h-64 w-64 rounded-full bg-violet-400/30 blur-3xl animate-float" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl animate-float" style={{ animationDelay: "-8s" }} />

            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-semibold tracking-tight text-white">
                  Lumen<span className="text-accent">.</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                  Estate
                </span>
              </div>
            </div>

            <div className="relative z-10 max-w-md">
              <p className="eyebrow !text-white/70">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                Members only
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.02] text-white">
                Your next{" "}
                <span className="italic clip-text">address</span>{" "}
                is waiting.
              </h2>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/75">
                Sign in to manage your residences, saved searches, and verified
                listings across 38 districts.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-4 text-xs text-white/80 tnum">
              <span>12,480 residences</span>
              <span className="h-3 w-px bg-white/25" />
              <span>38 districts</span>
              <span className="h-3 w-px bg-white/25" />
              <span>4.9&#9733; agents</span>
            </div>
          </div>

          {/* Form panel */}
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            {/* mobile-only wordmark */}
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <span className="font-display text-xl font-semibold tracking-tight text-ink">
                Lumen<span className="text-accent">.</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                Estate
              </span>
            </div>

            <p className="eyebrow">Welcome back</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
              Sign in to your account
            </h1>
            <p className="muted mt-2">
              Enter your credentials to continue to your dashboard.
            </p>

            {err && (
              <div className="err mt-6" role="alert">
                {err}
              </div>
            )}

            <form onSubmit={submit} className="mt-6">
              <div className="field">
                <label>Login</label>
                <input
                  value={form.login}
                  onChange={(e) => setForm({ ...form, login: e.target.value })}
                  required
                  autoComplete="username"
                  placeholder="you@example.com"
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
              <button disabled={loading} style={{ width: "100%" }} className="mt-2">
                {loading ? "..." : "Login"}
              </button>
            </form>

            <p className="muted mt-6 text-center">
              No account?{" "}
              <Link to="/register" className="font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
