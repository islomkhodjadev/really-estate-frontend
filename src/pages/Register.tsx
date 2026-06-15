import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { User, Building, Star, Check, Sparkles } from "../components/icons";

export default function Register() {
  const { register, loading } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    login: "", password: "", full_name: "", email: "", phone: "",
    role: "Client" as "Client" | "Agent" | "Owner",
  });
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await register(form);
      nav("/dashboard");
    } catch (e: any) {
      setErr(e.message || "registration failed");
    }
  }

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  const roles: { value: "Client" | "Agent" | "Owner"; label: string; hint: string; Icon: (p: { className?: string }) => JSX.Element }[] = [
    { value: "Client", label: "Client", hint: "Buyer / tenant", Icon: User },
    { value: "Agent", label: "Agent", hint: "List & represent", Icon: Star },
    { value: "Owner", label: "Owner", hint: "Manage property", Icon: Building },
  ];

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
                Join Lumen
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.02] text-white">
                Start your{" "}
                <span className="italic clip-text">journey</span>{" "}
                home.
              </h2>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/75">
                Create your account to save searches, follow verified listings,
                and connect with trusted agents across 38 districts.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Save & track favorite residences",
                  "Get alerts on new verified listings",
                  "Message agents and owners directly",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
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

            <p className="eyebrow">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Create account
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
              Join the community
            </h1>
            <p className="muted mt-2">
              A few details and your dashboard is ready.
            </p>

            {err && (
              <div className="err mt-6" role="alert">
                {err}
              </div>
            )}

            <form onSubmit={submit} className="mt-6">
              <div className="field">
                <label>Full name</label>
                <input value={form.full_name} onChange={set("full_name")} placeholder="Jane Doe" autoComplete="name" />
              </div>
              <div className="field">
                <label>Login *</label>
                <input value={form.login} onChange={set("login")} required autoComplete="username" placeholder="janedoe" />
              </div>
              <div className="field">
                <label>Password *</label>
                <input type="password" value={form.password} onChange={set("password")} required autoComplete="new-password" placeholder="••••••••" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <div className="field">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="+1 555 000 0000" />
                </div>
              </div>

              <div className="field">
                <label>I am a</label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map(({ value, label, hint, Icon }) => {
                    const active = form.role === value;
                    return (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setForm({ ...form, role: value })}
                        aria-pressed={active}
                        className={`relative flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 text-center transition lift ${
                          active
                            ? "border-brand-600 bg-brand-50 shadow-glow"
                            : "border-ink/[0.08] bg-surface hover:border-brand-300"
                        }`}
                      >
                        {active && (
                          <span className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-600">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </span>
                        )}
                        <Icon className={`h-5 w-5 ${active ? "text-brand-600" : "text-muted"}`} />
                        <span className={`text-sm font-semibold ${active ? "text-brand-700" : "text-ink"}`}>{label}</span>
                        <span className="text-[11px] leading-tight text-muted">{hint}</span>
                      </button>
                    );
                  })}
                </div>
                {/* Keep native select for accessibility / state parity */}
                <select value={form.role} onChange={set("role")} className="sr-only" tabIndex={-1} aria-hidden="true">
                  <option value="Client">Client (buyer / tenant)</option>
                  <option value="Agent">Agent</option>
                  <option value="Owner">Owner</option>
                </select>
              </div>

              <button disabled={loading} style={{ width: "100%" }} className="mt-2">
                {loading ? "..." : "Sign up"}
              </button>
            </form>

            <p className="muted mt-6 text-center">
              Have an account?{" "}
              <Link to="/login" className="font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
