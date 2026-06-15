import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { itemList, itemCreate, invoke, arr } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Gavel, Tag, Clock, TrendingUp, Building, ArrowRight, Plus } from "../components/icons";

export default function CreateAuction() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [props, setProps] = useState<any[]>([]);
  const [f, setF] = useState<any>({ property_id: "", title: "", starting_price: "", min_increment: "100", reserve_price: "", end_hours: "24" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    itemList("property", {}, 1, 200).then((r) =>
      setProps(r.items.filter((p: any) => p.user_base_id === user!.user_id || p.user_base_id_2 === user!.user_id))
    );
  }, []);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const now = new Date();
      const end = new Date(now.getTime() + Number(f.end_hours || 24) * 3600000);
      const fmt = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");
      const prop = props.find((p) => p.guid === f.property_id);
      const res = await itemCreate("auction", {
        property_id: f.property_id, user_base_id: user!.user_id, // agent
        title: f.title || (prop ? `Auction: ${prop.title}` : "Auction"),
        starting_price: Number(f.starting_price) || 0,
        current_price: 0,
        min_increment: Number(f.min_increment) || 100,
        reserve_price: Number(f.reserve_price) || 0,
        start_time: fmt(now), end_time: fmt(end),
        status: arr("active"),
      });
      const guid = res?.data?.guid ?? res?.guid;
      nav(guid ? `/auction/${guid}` : "/auctions");
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="container animate-fade-up py-12">
      <div className="mx-auto max-w-2xl">
        <div className="card panel rounded-3xl border border-ink/[0.08] shadow-card overflow-hidden">
          <div className="gradient-hero relative px-8 py-10 text-white">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur shadow-glow ring-1 ring-white/20">
                <Gavel className="h-7 w-7" />
              </div>
              <div>
                <div className="eyebrow text-white/70">Live bidding</div>
                <h1 className="font-display text-3xl font-semibold tracking-tight">Start an auction</h1>
              </div>
            </div>
            <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-white/80">
              Put one of your listings up for live bidding. Set a starting price, increment and reserve, then launch.
            </p>
          </div>

          <div className="px-8 py-8">
            {err && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 font-sans text-sm text-accent">
                <span>{err}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-6">
              <div className="field">
                <label className="mb-2 flex items-center gap-2 font-sans text-sm font-medium text-ink">
                  <Building className="h-4 w-4 text-brand-600" /> Property <span className="text-accent">*</span>
                </label>
                <select
                  className="w-full rounded-2xl border border-ink/[0.12] bg-surface px-4 py-3 font-sans text-ink shadow-soft outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                  value={f.property_id}
                  onChange={set("property_id")}
                  required
                >
                  <option value="">Select your property…</option>
                  {props.map((p) => <option key={p.guid} value={p.guid}>{p.title}</option>)}
                </select>
              </div>

              <div className="field">
                <label className="mb-2 flex items-center gap-2 font-sans text-sm font-medium text-ink">
                  <Tag className="h-4 w-4 text-brand-600" /> Title
                </label>
                <input
                  className="w-full rounded-2xl border border-ink/[0.12] bg-surface px-4 py-3 font-sans text-ink shadow-soft outline-none transition placeholder:text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                  value={f.title}
                  onChange={set("title")}
                  placeholder="(auto from property)"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="field">
                  <label className="mb-2 flex items-center gap-2 font-sans text-sm font-medium text-ink">
                    <TrendingUp className="h-4 w-4 text-brand-600" /> Starting price <span className="text-accent">*</span>
                  </label>
                  <input
                    className="w-full rounded-2xl border border-ink/[0.12] bg-surface px-4 py-3 font-stat tabular-nums text-ink shadow-soft outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                    type="number"
                    value={f.starting_price}
                    onChange={set("starting_price")}
                    required
                  />
                </div>

                <div className="field">
                  <label className="mb-2 flex items-center gap-2 font-sans text-sm font-medium text-ink">
                    <Plus className="h-4 w-4 text-brand-600" /> Min increment
                  </label>
                  <input
                    className="w-full rounded-2xl border border-ink/[0.12] bg-surface px-4 py-3 font-stat tabular-nums text-ink shadow-soft outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                    type="number"
                    value={f.min_increment}
                    onChange={set("min_increment")}
                  />
                </div>

                <div className="field">
                  <label className="mb-2 flex items-center gap-2 font-sans text-sm font-medium text-ink">
                    <Gavel className="h-4 w-4 text-brand-600" /> Reserve price
                  </label>
                  <input
                    className="w-full rounded-2xl border border-ink/[0.12] bg-surface px-4 py-3 font-stat tabular-nums text-ink shadow-soft outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                    type="number"
                    value={f.reserve_price}
                    onChange={set("reserve_price")}
                  />
                </div>

                <div className="field">
                  <label className="mb-2 flex items-center gap-2 font-sans text-sm font-medium text-ink">
                    <Clock className="h-4 w-4 text-brand-600" /> Duration (hours)
                  </label>
                  <input
                    className="w-full rounded-2xl border border-ink/[0.12] bg-surface px-4 py-3 font-stat tabular-nums text-ink shadow-soft outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                    type="number"
                    value={f.end_hours}
                    onChange={set("end_hours")}
                  />
                </div>
              </div>

              <button
                disabled={busy}
                className="btn group flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-medium shadow-glow disabled:opacity-60"
              >
                {busy ? "…" : <>Launch auction <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
