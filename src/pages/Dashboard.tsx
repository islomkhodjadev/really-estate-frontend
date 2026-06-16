import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { itemList, itemUpdate, itemCreate, itemGet, uploadFile, invoke, one, arr } from "../api/client";
import { downloadCSV } from "../api/util";
import { ENUMS } from "../config";
import { useAuth } from "../auth/AuthContext";
import { FileUpload } from "../components/Upload";
import { MyCards, PayWithCardButton } from "../components/MyCards";
import {
  Calendar, Bell, Building, CreditCard, Clock, TrendingUp,
  Plus, Check, X, CheckCircle, FileText, ArrowRight, User, Star,
} from "../components/icons";

type Tab = "viewings" | "incoming" | "properties" | "deals" | "rentals" | "reports" | "cards" | "purchases";

/** Soft, capitalized status pill that lightly tints by common status keywords. */
function StatusPill({ value }: { value: any }) {
  const v = String(one(value) || "").toLowerCase();
  const tone =
    /(paid|completed|confirmed|active|profit)/.test(v)
      ? "bg-emerald-50 text-emerald-700"
      : /(cancel|expired|declin|loss|overdue|no_show)/.test(v)
      ? "bg-rose-50 text-rose-700"
      : /(pending|draft|expiring|requested)/.test(v)
      ? "bg-amber-50 text-amber-700"
      : "bg-brand-50 text-brand-700";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${tone}`}>{one(value)}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("viewings");
  const uid = user!.user_id!;
  const T: [Tab, string, (c: string) => JSX.Element][] = [
    ["viewings", "My viewings", (c) => <Calendar className={c} />],
    ["incoming", "Incoming requests", (c) => <Bell className={c} />],
    ["properties", "My properties", (c) => <Building className={c} />],
    ["deals", "Deals", (c) => <CreditCard className={c} />],
    ["rentals", "Rentals", (c) => <Clock className={c} />],
    ["purchases", "My purchases", (c) => <Star className={c} />],
    ["cards", "My cards", (c) => <CreditCard className={c} />],
    ["reports", "Reports", (c) => <TrendingUp className={c} />],
  ];
  return (
    <div className="animate-fade-up">
      {/* ----------------------------------------------------------- header */}
      <header className="border-b border-ink/[0.08] pb-7">
        <span className="eyebrow text-muted">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" /> Workspace
        </span>
        <h1 className="mt-2 text-3xl sm:text-4xl">Dashboard</h1>
        <p className="muted mt-2 inline-flex items-center gap-1.5">
          <User className="h-4 w-4" /> {user?.login} · {user?.role?.name ?? "Client"}
        </p>
      </header>

      {/* --------------------------------------------- segmented tab control */}
      <div
        role="tablist"
        aria-label="Dashboard sections"
        className="mt-6 flex w-full gap-1 overflow-x-auto rounded-2xl border border-ink/[0.06] bg-surface p-1.5 shadow-card"
      >
        {T.map(([k, l, icon]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={
              "inline-flex flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold shadow-none transition-all duration-200 active:scale-[.98] " +
              (tab === k
                ? "bg-brand-600 text-white shadow-glow hover:bg-brand-700"
                : "bg-transparent text-muted hover:bg-ink/[0.04] hover:text-ink")
            }
          >
            {icon("h-4 w-4")}
            <span className="hidden sm:inline">{l}</span>
          </button>
        ))}
      </div>

      <div className="mt-7">
        {tab === "viewings" && <MyViewings uid={uid} />}
        {tab === "incoming" && <Incoming uid={uid} />}
        {tab === "properties" && <MyProperties uid={uid} />}
        {tab === "deals" && <Deals uid={uid} />}
        {tab === "rentals" && <Rentals uid={uid} />}
        {tab === "purchases" && <MyPurchases uid={uid} />}
        {tab === "cards" && (
          <div className="card p-6 sm:p-8">
            <MyCards />
          </div>
        )}
        {tab === "reports" && <Reports />}
      </div>
    </div>
  );
}

/** Shared table shell: rounded card wrapper around a clean table. */
function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-surface shadow-card">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function EmptyRow({ colSpan, icon, label }: { colSpan: number; icon: JSX.Element; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="flex flex-col items-center gap-2 py-10 text-center text-muted">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink/[0.04] text-muted">{icon}</span>
          <span className="text-sm">{label}</span>
        </div>
      </td>
    </tr>
  );
}

function MyViewings({ uid }: { uid: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { itemList("viewing", {}, 1, 200).then((r) => setRows(r.items.filter((v: any) => v.user_base_id === uid))); }, [uid]);
  return (
    <TableCard>
      <table>
        <thead><tr><th>Date</th><th>Status</th><th>Comment</th></tr></thead>
        <tbody>
          {rows.map((v) => (
            <tr key={v.guid} className="transition-colors hover:bg-bg/70">
              <td className="font-medium text-ink tabular-nums">{v.viewing_date}</td>
              <td><StatusPill value={v.status} /></td>
              <td className="text-muted">{v.comment}</td>
            </tr>
          ))}
          {!rows.length && <EmptyRow colSpan={3} icon={<Calendar className="h-5 w-5" />} label="No viewings." />}
        </tbody>
      </table>
    </TableCard>
  );
}

function Incoming({ uid }: { uid: string }) {
  const [rows, setRows] = useState<any[]>([]);
  function load() { itemList("viewing", {}, 1, 200).then((r) => setRows(r.items.filter((v: any) => v.user_base_id_2 === uid))); }
  useEffect(load, [uid]);
  async function setStatus(v: any, status: string, reason?: string) {
    await itemUpdate("viewing", { guid: v.guid, status: arr(status), ...(reason ? { cancel_reason: reason } : {}) });
    load();
  }
  return (
    <TableCard>
      <table>
        <thead><tr><th>Date</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
        <tbody>
          {rows.map((v) => (
            <tr key={v.guid} className="transition-colors hover:bg-bg/70">
              <td className="font-medium text-ink tabular-nums">{v.viewing_date}</td>
              <td><StatusPill value={v.status} /></td>
              <td>
                <div className="flex flex-wrap justify-end gap-2">
                  <button className="px-3 py-1.5 text-xs" onClick={() => setStatus(v, "confirmed")}>
                    <Check className="h-4 w-4" /> Confirm
                  </button>
                  <button className="ghost px-3 py-1.5 text-xs" onClick={() => setStatus(v, "completed")}>
                    <CheckCircle className="h-4 w-4" /> Complete
                  </button>
                  <button className="ghost px-3 py-1.5 text-xs" onClick={() => { const r = prompt("Reason?") || ""; setStatus(v, "cancelled", r); }}>
                    <X className="h-4 w-4" /> Decline
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && <EmptyRow colSpan={3} icon={<Bell className="h-5 w-5" />} label="No incoming requests." />}
        </tbody>
      </table>
    </TableCard>
  );
}

function MyProperties({ uid }: { uid: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { itemList("property", {}, 1, 200).then((r) => setRows(r.items.filter((p: any) => p.user_base_id === uid || p.user_base_id_2 === uid))); }, [uid]);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="muted">{rows.length} {rows.length === 1 ? "listing" : "listings"}</p>
        <Link to="/create" className="btn">
          <Plus className="h-4 w-4" /> New listing
        </Link>
      </div>
      <TableCard>
        <table>
          <thead><tr><th>Title</th><th className="text-right">Price</th><th>Type</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.guid} className="transition-colors hover:bg-bg/70">
                <td className="font-medium">
                  <Link to={`/property/${p.guid}`} className="inline-flex items-center gap-1.5 text-ink hover:text-brand-600">
                    <Building className="h-4 w-4 shrink-0 text-muted" /> {p.title}
                  </Link>
                </td>
                <td className="text-right font-stat font-semibold text-ink tabular-nums">{Number(p.price || 0).toLocaleString()}</td>
                <td className="capitalize text-muted">{one(p.property_type)}</td>
                <td><StatusPill value={p.status} /></td>
              </tr>
            ))}
            {!rows.length && <EmptyRow colSpan={4} icon={<Building className="h-5 w-5" />} label="No properties." />}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}

function Deals({ uid }: { uid: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [props, setProps] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState<any>({ property_id: "", deal_type: "purchase", amount: "", start_date: "", end_date: "", terms: "" });
  const [contract, setContract] = useState("");
  const [show, setShow] = useState(false);

  function load() {
    itemList("deal", {}, 1, 200).then((r) => setRows(r.items.filter((d: any) => d.user_base_id === uid || d.user_base_id_2 === uid)));
    itemList("property", {}, 1, 200).then((r) => setProps(r.items));
  }
  useEffect(load, [uid]);

  async function pay(d: any) {
    setMsg("");
    try {
      const res = await invoke("create_checkout_session", { deal_id: d.guid });
      if (res?.url) { window.location.href = res.url; return; } // → Stripe hosted checkout
      throw new Error("no checkout url");
    } catch (e: any) {
      if (String(e.message || "").includes("not configured")) {
        // Stripe key not set → fall back to emulated payment
        try { await invoke("process_payment", { deal_id: d.guid, amount: d.amount, payment_type: "full" }); setMsg("Paid (emulated)"); load(); }
        catch (e2: any) { setMsg(e2.message); }
        return;
      }
      setMsg(e.message);
    }
  }
  async function createDeal(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    try {
      const prop = props.find((p) => p.guid === form.property_id);
      const res = await itemCreate("deal", {
        property_id: form.property_id, user_base_id: uid, user_base_id_2: prop ? one(prop.user_base_id) : "",
        deal_type: arr(form.deal_type), amount: Number(form.amount) || 0, status: arr("draft"),
        start_date: form.start_date || undefined, end_date: form.end_date || undefined,
        terms: form.terms, contract_file: contract,
      });
      const guid = res?.data?.guid ?? res?.guid;
      if (guid) await invoke("deal_after_create", { guid, property_id: form.property_id, status: ["draft"] }, false);
      setShow(false); setMsg("Deal created"); load();
    } catch (e: any) { setMsg(e.message); }
  }
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      {msg && (
        <div className="ok inline-flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" /> {msg}
        </div>
      )}
      <div className="mb-4">
        <button className={show ? "ghost" : ""} onClick={() => setShow(!show)}>
          {show ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> New deal</>}
        </button>
      </div>

      {show && (
        <form onSubmit={createDeal} className="panel mb-5">
          <h2 className="text-lg">New deal</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="field sm:col-span-1">
              <label>Property</label>
              <select value={form.property_id} onChange={set("property_id")} required>
                <option value="">Select…</option>
                {props.map((p) => <option key={p.guid} value={p.guid}>{p.title}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Type</label>
              <select value={form.deal_type} onChange={set("deal_type")}>
                <option value="purchase">purchase</option>
                <option value="rental">rental</option>
              </select>
            </div>
            <div className="field">
              <label>Amount</label>
              <input type="number" value={form.amount} onChange={set("amount")} required />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="field"><label>Start</label><input type="date" value={form.start_date} onChange={set("start_date")} /></div>
            <div className="field"><label>End</label><input type="date" value={form.end_date} onChange={set("end_date")} /></div>
            <div className="field"><label>Terms</label><input value={form.terms} onChange={set("terms")} /></div>
          </div>
          <FileUpload value={contract} onChange={setContract} label="Contract file" accept="application/pdf,image/*" />
          <button className="mt-2">
            <Check className="h-4 w-4" /> Create deal
          </button>
        </form>
      )}

      <TableCard>
        <table>
          <thead><tr><th>Type</th><th className="text-right">Amount</th><th>Status</th><th>Contract</th><th className="text-right"></th></tr></thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.guid} className="transition-colors hover:bg-bg/70">
                <td className="capitalize font-medium text-ink">{one(d.deal_type)}</td>
                <td className="text-right font-stat font-semibold text-ink tabular-nums">{Number(d.amount || 0).toLocaleString()}</td>
                <td><StatusPill value={d.status} /></td>
                <td>
                  {d.contract_file
                    ? <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700"><FileText className="h-4 w-4" /> Attached</span>
                    : <span className="text-muted">—</span>}
                </td>
                <td className="text-right">
                  {one(d.status) !== "completed" && (
                    <div className="inline-flex items-center gap-2">
                      <button className="px-3 py-1.5 text-xs" onClick={() => pay(d)}>
                        <CreditCard className="h-4 w-4" /> Checkout
                      </button>
                      <PayWithCardButton dealId={d.guid} onPaid={load} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && <EmptyRow colSpan={5} icon={<CreditCard className="h-5 w-5" />} label="No deals." />}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}

function Rentals({ uid }: { uid: string }) {
  const [ras, setRas] = useState<any[]>([]);
  const [pays, setPays] = useState<any[]>([]);
  function load() {
    itemList("rental_agreement", {}, 1, 200).then((r) => setRas(r.items.filter((x: any) => x.user_base_id === uid || x.user_base_id_2 === uid)));
    itemList("rental_payment", {}, 1, 500).then((r) => setPays(r.items));
  }
  useEffect(load, [uid]);
  async function markPaid(p: any) { await itemUpdate("rental_payment", { guid: p.guid, status: arr("paid") }); load(); }
  return (
    <div className="space-y-4">
      {ras.length === 0 && (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-surface/60 py-16 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-ink/[0.04] text-muted"><Clock className="h-5 w-5" /></span>
          <p className="muted mt-2">No rental agreements.</p>
        </div>
      )}
      {ras.map((ra) => (
        <div key={ra.guid} className="panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <b className="inline-flex items-center gap-2 font-display text-ink">
              <Clock className="h-4 w-4 text-brand-600" /> Agreement {ra.guid.slice(0, 8)}
            </b>
            <StatusPill value={ra.status} />
          </div>
          <p className="muted mt-2 tabular-nums">{ra.start_date} → {ra.end_date} · monthly {Number(ra.monthly_payment || 0).toLocaleString()} · deposit {Number(ra.deposit || 0).toLocaleString()}</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-ink/[0.06]">
            <div className="overflow-x-auto">
              <table>
                <thead><tr><th>Invoice</th><th>Date</th><th className="text-right">Amount</th><th>Status</th><th className="text-right"></th></tr></thead>
                <tbody>
                  {pays.filter((p) => p.rental_agreement_id === ra.guid).map((p) => (
                    <tr key={p.guid} className="transition-colors hover:bg-bg/70">
                      <td className="font-medium text-ink">{p.invoice_number}</td>
                      <td className="text-muted tabular-nums">{p.payment_date}</td>
                      <td className="text-right font-stat font-semibold text-ink tabular-nums">{Number(p.amount || 0).toLocaleString()}</td>
                      <td><StatusPill value={p.status} /></td>
                      <td className="text-right">
                        {one(p.status) !== "paid" && (
                          <button className="px-3 py-1.5 text-xs" onClick={() => markPaid(p)}>
                            <Check className="h-4 w-4" /> Mark paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MyPurchases({ uid }: { uid: string }) {
  const [deals, setDeals] = useState<any[]>([]);
  const [propMap, setPropMap] = useState<Record<string, any>>({});

  useEffect(() => {
    itemList("deal", {}, 1, 200).then((r) => {
      // buyer is user_base_id (new convention) or user_base_id_2 (old buyNow)
      const mine = r.items.filter(
        (d: any) => d.user_base_id === uid || d.user_base_id_2 === uid
      );
      setDeals(mine);
      const ids = [...new Set(mine.map((d: any) => d.property_id).filter(Boolean))] as string[];
      ids.forEach((pid) => {
        itemGet("property", pid).then((p) => {
          if (p?.guid) setPropMap((m) => ({ ...m, [pid]: p }));
        }).catch(() => {});
      });
    });
  }, [uid]);

  // show all purchase deals (any status) where this user is the buyer
  const purchased = deals.filter((d) => one(d.deal_type) === "purchase");
  const CDN = import.meta.env.VITE_CDN_BASE || "https://cdn.u-code.io/";

  if (purchased.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 bg-surface/60 py-16 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-ink/[0.04] text-muted">
          <Building className="h-5 w-5" />
        </span>
        <p className="muted mt-2">No purchased properties yet.</p>
        <a href="/" className="btn mt-4 inline-flex">Browse listings</a>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {purchased.map((d) => {
        const prop = propMap[d.property_id];
        const img = prop?.images?.[0] ? `${CDN}${prop.images[0]}` : null;
        return (
          <div key={d.guid} className="panel flex flex-col gap-3">
            {img ? (
              <img src={img} alt={prop?.title} className="h-44 w-full rounded-xl object-cover" />
            ) : (
              <div className="flex h-44 w-full items-center justify-center rounded-xl bg-ink/[0.04]">
                <Building className="h-8 w-8 text-muted" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-display font-semibold text-ink line-clamp-2">
                {prop?.title ?? `Property ${String(d.property_id || "").slice(0, 8)}`}
              </p>
              {prop?.address && <p className="mt-0.5 text-xs text-muted">{prop.address}</p>}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-stat font-bold text-ink tabular-nums">
                {Number(d.amount || prop?.price || 0).toLocaleString()} $
              </span>
              <StatusPill value={d.status} />
            </div>
            {prop && (
              <a href={`/property/${prop.guid}`} className="ghost w-full text-center text-sm">
                <ArrowRight className="h-4 w-4" /> View property
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Single labelled stat figure rendered in Sora (font-stat). */
function StatFigure({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-semibold uppercase tracking-[.16em] text-muted">{label}</span>
      <span className={`mt-1 font-stat text-2xl font-bold tabular-nums ${tone ?? "text-ink"}`}>{value}</span>
    </div>
  );
}

function Reports() {
  const [pl, setPl] = useState<any>(null);
  const [reps, setReps] = useState<Record<string, any>>({});
  const [err, setErr] = useState("");
  useEffect(() => {
    invoke("profit_loss", {}).then(setPl).catch((e) => setErr(e.message));
    ["deals", "viewings", "rentals"].forEach((rt) =>
      invoke("reports", { report_type: rt }).then((d) => setReps((s) => ({ ...s, [rt]: d }))).catch(() => {})
    );
  }, []);
  async function exportDeals() {
    const { items } = await itemList("deal", {}, 1, 1000);
    downloadCSV("deals.csv", items.map((d: any) => ({
      guid: d.guid, type: one(d.deal_type), amount: d.amount, status: one(d.status),
      commission: d.commission, start: d.start_date, end: d.end_date,
    })));
  }
  if (err) return <div className="err">{err}</div>;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="muted">Performance overview</p>
        <button onClick={exportDeals}>
          <FileText className="h-4 w-4" /> Export deals (CSV) <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {pl && (
          <div className="panel">
            <span className="eyebrow text-muted"><TrendingUp className="h-4 w-4" /> Profit / Loss</span>
            <div className="mt-4 grid grid-cols-2 gap-5">
              <StatFigure label="Revenue" value={Number(pl.revenue).toLocaleString()} />
              <StatFigure label="Expenses" value={Number(pl.expenses).toLocaleString()} />
              <StatFigure
                label={`Net (${pl.status})`}
                value={Number(pl.net).toLocaleString()}
                tone={pl.status === "profit" ? "text-emerald-600" : "text-rose-600"}
              />
              <StatFigure label="Commissions" value={
                <span className="text-base">
                  deals {Number(pl.deal_commission).toLocaleString()} · rentals {Number(pl.rental_commission).toLocaleString()}
                </span>
              } />
            </div>
          </div>
        )}

        {reps.deals && (
          <div className="panel">
            <span className="eyebrow text-muted"><CreditCard className="h-4 w-4" /> Deals</span>
            <div className="mt-4 grid grid-cols-2 gap-5">
              <StatFigure label="Total" value={reps.deals.total_deals} />
              <StatFigure label="Sale / Rental" value={`${reps.deals.sale} / ${reps.deals.rental}`} />
              <StatFigure label="Value" value={Number(reps.deals.total_value).toLocaleString()} />
              <StatFigure label="Avg amount" value={Number(reps.deals.avg_amount).toLocaleString()} />
            </div>
          </div>
        )}

        {reps.viewings && (
          <div className="panel">
            <span className="eyebrow text-muted"><Calendar className="h-4 w-4" /> Viewings</span>
            <div className="mt-4 grid grid-cols-2 gap-5">
              <StatFigure label="Total" value={reps.viewings.total} />
              <StatFigure label="Completed" value={reps.viewings.completed} />
              <StatFigure label="Cancelled / No-show" value={`${reps.viewings.cancelled} / ${reps.viewings.no_show}`} />
              <StatFigure label="Conversion" value={`${(reps.viewings.conversion * 100).toFixed(0)}%`} tone="text-brand-600" />
            </div>
          </div>
        )}

        {reps.rentals && (
          <div className="panel">
            <span className="eyebrow text-muted"><Clock className="h-4 w-4" /> Rentals</span>
            <div className="mt-4 grid grid-cols-2 gap-5">
              <StatFigure label="Active" value={reps.rentals.active} tone="text-emerald-600" />
              <StatFigure label="Expiring soon" value={reps.rentals.expiring_soon} tone="text-amber-600" />
              <StatFigure label="Expired" value={reps.rentals.expired} tone="text-rose-600" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
