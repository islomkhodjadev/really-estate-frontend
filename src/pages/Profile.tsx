import { useEffect, useState } from "react";
import { itemGet, itemUpdate, itemList, uploadFile, imgUrl, one } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { ImageUpload } from "../components/Upload";
import { User, Star, Check, RefreshCw } from "../components/icons";

export default function Profile() {
  const { user } = useAuth();
  const uid = user!.user_id!;
  const [form, setForm] = useState<any>({ full_name: "", email: "", phone: "", avatar: "" });
  const [reviews, setReviews] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    itemGet("user_base", uid).then((u) =>
      setForm({ full_name: u.full_name || "", email: u.email || "", phone: u.phone || "", avatar: one(u.avatar) || "" })
    );
    itemList("review", {}, 1, 200).then((r) =>
      setReviews(r.items.filter((rv: any) => rv.user_base_id === uid || rv.user_base_id_2 === uid))
    );
  }, [uid]);

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try { setForm({ ...form, avatar: await uploadFile(f) }); } finally { setBusy(false); }
  }
  void onAvatar;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setBusy(true);
    try {
      await itemUpdate("user_base", { guid: uid, full_name: form.full_name, email: form.email, phone: form.phone, avatar: form.avatar });
      setMsg("Profile saved");
    } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="animate-fade-up">
      {/* ----------------------------------------------------------- header */}
      <header className="border-b border-ink/[0.08] pb-7">
        <span className="eyebrow text-muted">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" /> Account
        </span>
        <h1 className="mt-2 text-3xl sm:text-4xl">Your profile</h1>
        <p className="muted mt-2 text-[15px]">Manage your personal details and see the reviews tied to your account.</p>
      </header>

      {/* ------------------------------------------------ two-column layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        {/* --------------------------------------------- profile form card */}
        <form onSubmit={save} className="card p-6 sm:p-8">
          <div className="flex items-center gap-4 border-b border-ink/[0.08] pb-6">
            {form.avatar ? (
              <img
                src={imgUrl(form.avatar)}
                alt=""
                className="h-16 w-16 rounded-full object-cover ring-1 ring-ink/[0.08] shadow-card"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-ink/[0.08]">
                <User className="h-7 w-7" />
              </span>
            )}
            <div className="min-w-0">
              <div className="font-display text-xl font-semibold text-ink">{form.full_name || user!.login}</div>
              <div className="muted truncate text-sm">{user!.login}</div>
            </div>
          </div>

          {msg && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
              <Check className="h-4 w-4" /> {msg}
            </div>
          )}

          <div className="mt-6 grid gap-5">
            <ImageUpload value={form.avatar} onChange={(link) => setForm({ ...form, avatar: link })} label="Avatar" />

            <div className="field">
              <label>Login</label>
              <input value={user!.login} disabled className="opacity-70" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="field">
                <label>Full name</label>
                <input value={form.full_name} onChange={set("full_name")} placeholder="Your name" />
              </div>
              <div className="field">
                <label>Phone</label>
                <input value={form.phone} onChange={set("phone")} placeholder="+1 555 000 0000" />
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <input value={form.email} onChange={set("email")} placeholder="you@example.com" />
            </div>
          </div>

          <button disabled={busy} className="mt-7 inline-flex items-center gap-2">
            {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {busy ? "Saving…" : "Save changes"}
          </button>
        </form>

        {/* ----------------------------------------------- my reviews card */}
        <aside className="card p-6 sm:p-7 lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-ink/[0.08] pb-4">
            <h2 className="section-title text-2xl">My reviews</h2>
            <span className="badge inline-flex items-center gap-1 bg-amber-50 text-amber-700">
              <Star filled className="h-3.5 w-3.5" /> {reviews.length}
            </span>
          </div>

          {reviews.length === 0 && (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-bg px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Star className="h-6 w-6" />
              </span>
              <p className="muted text-sm">No reviews yet.</p>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {reviews.map((r) => (
              <div key={r.guid} className="panel">
                <div className="flex items-center gap-0.5 text-accent">
                  {Array.from({ length: Number(r.rating || 0) }).map((_, i) => (
                    <Star key={i} filled className="h-4 w-4" />
                  ))}
                </div>
                <div className="mt-1.5 text-ink/80">{r.comment}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
