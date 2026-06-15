import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { itemGet, itemList, invoke, one, imgUrl } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { countdown } from "./Auctions";
import { Gavel, Clock, User, Star, CheckCircle, TrendingUp, ChevronRight, X } from "../components/icons";

export default function AuctionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [a, setA] = useState<any>(null);
  const [prop, setProp] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [tick, setTick] = useState(0);

  async function load() {
    if (!id) return;
    const au = await itemGet("auction", id);
    setA(au);
    if (au.property_id) itemGet("property", au.property_id).then(setProp).catch(() => {});
    const { items } = await itemList("bid", {}, 1, 200);
    setBids(items.filter((b: any) => b.auction_id === id).sort((x: any, y: any) => (y.amount || 0) - (x.amount || 0)));
  }
  useEffect(() => { load(); }, [id]);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 1000); return () => clearInterval(t); }, []);

  if (!a) return <p className="muted">Loading…</p>;
  const st = one(a.status);
  const cur = Number(a.current_price || 0);
  const minNext = cur > 0 ? cur + Number(a.min_increment || 1) : Number(a.starting_price || 0);
  const photo = prop ? imgUrl(one(prop.main_photo)) : "";

  async function bid(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setMsg("");
    try { await invoke("place_bid", { auction_id: id, amount: Number(amount) }); setMsg("Bid placed"); setAmount(""); load(); }
    catch (e: any) { setErr(e.message); }
  }
  async function close() {
    setErr(""); setMsg("");
    try { await invoke("close_auction", { auction_id: id }); setMsg("Auction closed"); load(); }
    catch (e: any) { setErr(e.message); }
  }
  const isAgent = user && a.user_base_id === user.user_id;
  const won = st === "ended" && user && a.user_base_id_3 === user.user_id;

  const live = st === "active";
  const timeLeft = countdown(a.end_time);

  return (
    <div className="animate-fade-up">
      {/* ---------------------------------------------------------------- hero */}
      <section className="grid gap-3">
        <div
          className="thumb relative h-72 sm:h-[26rem] rounded-3xl overflow-hidden shadow-soft ring-1 ring-ink/[0.06]"
          style={photo ? { backgroundImage: `url(${photo})` } : {}}
        >
          {!photo && (
            <span className="absolute inset-0 grid place-items-center text-muted text-sm">
              <Gavel className="h-10 w-10 opacity-40" />
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/55 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 chip bg-white/85 text-ink backdrop-blur inline-flex items-center gap-1.5 capitalize">
            <Gavel className="h-3.5 w-3.5" /> Auction
          </span>
          {live ? (
            <span className="absolute right-4 top-4 badge bg-accent/90 text-white inline-flex items-center gap-1.5 backdrop-blur">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-stat tabular-nums">{timeLeft}</span>
            </span>
          ) : (
            <span className="absolute right-4 top-4 badge bg-white/85 text-ink backdrop-blur capitalize">{st}</span>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- title header */}
      <header className="mt-8 flex flex-col gap-3 border-b border-ink/[0.08] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" /> Live auction
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl">{a.title || "Auction"}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="badge capitalize">{st}</span>
            {prop && (
              <Link to={`/property/${prop.guid}`} className="chip bg-white text-ink ring-1 ring-ink/10 inline-flex items-center gap-1">
                View property <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ----------------------------------------- main / sticky-sidebar grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        {/* ------------------------------------------------------- main column */}
        <div className="min-w-0">
          {/* current-bid panel */}
          <div className="card relative overflow-hidden p-6 sm:p-7">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-100/50 blur-2xl" />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow text-muted inline-flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-brand-600" /> Current bid
                </span>
                <div className="price font-stat tabular-nums !text-4xl sm:!text-5xl mt-1">
                  {(cur || Number(a.starting_price || 0)).toLocaleString()}
                  <span className="muted text-base font-sans ml-1.5">USD</span>
                </div>
                <p className="muted mt-2 text-[13px]">
                  Min next bid <span className="font-stat tabular-nums text-ink">{minNext.toLocaleString()}</span> USD
                </p>
              </div>
              {live ? (
                <div className="rounded-2xl bg-dark px-4 py-3 text-center text-white shadow-glow">
                  <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-white/70">
                    <Clock className="h-3.5 w-3.5" /> Ends in
                  </div>
                  <div className="font-stat tabular-nums text-xl font-semibold">{timeLeft}</div>
                </div>
              ) : (
                <div className="rounded-2xl bg-ink/[0.04] px-4 py-3 text-center ring-1 ring-ink/[0.06]">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Status</div>
                  <div className="font-display text-lg font-semibold capitalize text-ink">{st}</div>
                </div>
              )}
            </div>
          </div>

          {/* winner banner */}
          {won && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-600 to-accent p-5 text-white shadow-glow">
              <Star className="h-8 w-8 shrink-0" filled />
              <div>
                <div className="inline-flex items-center gap-1.5 font-display text-lg font-semibold">
                  <CheckCircle className="h-5 w-5" filled /> You won this auction!
                </div>
                <p className="text-sm text-white/85">Congratulations — proceed to checkout to complete your purchase.</p>
              </div>
            </div>
          )}

          {/* bid history */}
          <section className="mt-10">
            <h2 className="section-title text-2xl inline-flex items-center gap-2">
              <Gavel className="h-5 w-5 text-brand-600" /> Bid history
              <span className="badge align-middle font-stat tabular-nums">{bids.length}</span>
            </h2>
            <div className="mt-4 space-y-2">
              {bids.map((b, i) => {
                const mine = b.user_base_id === user?.user_id;
                return (
                  <div
                    key={b.guid}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 ring-1 transition-transform duration-150 lift ${
                      i === 0
                        ? "bg-brand-50/60 ring-brand-200"
                        : "bg-surface ring-ink/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                          i === 0 ? "bg-brand-600 text-white" : "bg-ink/[0.05] text-muted"
                        }`}
                      >
                        <User className="h-4 w-4" />
                      </span>
                      <span className="truncate text-sm font-medium text-ink">
                        {(b.user_base_id || "").slice(0, 8)}
                        {mine && <span className="ml-1 text-brand-600">(you)</span>}
                      </span>
                      {i === 0 && <span className="badge bg-brand-100 text-brand-700">Top bid</span>}
                    </div>
                    <span className="font-stat tabular-nums text-sm font-semibold text-ink">
                      {Number(b.amount).toLocaleString()} <span className="muted font-sans">USD</span>
                    </span>
                  </div>
                );
              })}
              {!bids.length && (
                <div className="rounded-2xl border border-dashed border-ink/15 px-4 py-10 text-center">
                  <Gavel className="mx-auto h-8 w-8 text-muted/50" />
                  <p className="muted mt-2 text-sm">No bids yet — be the first!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* --------------------------------------------------- sticky sidebar */}
        <aside className="lg:sticky lg:top-24 flex flex-col gap-4">
          <div className="panel">
            <h2 className="text-lg inline-flex items-center gap-2">
              <Gavel className="h-5 w-5 text-brand-600" /> Place a bid
            </h2>
            <div className="price font-stat tabular-nums mt-1 !text-2xl">
              {(cur || Number(a.starting_price || 0)).toLocaleString()} <span className="muted text-sm font-sans">USD</span>
            </div>
            {live ? (
              <div className="muted mt-1 inline-flex items-center gap-1.5 text-sm">
                <Clock className="h-4 w-4 text-accent" /> ends in <span className="font-stat tabular-nums text-ink">{timeLeft}</span>
              </div>
            ) : (
              <div className="muted mt-1 text-sm capitalize">Status: {st}</div>
            )}

            <div className="mt-3 space-y-2">
              {msg && (
                <div className="ok inline-flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" /> {msg}
                </div>
              )}
              {err && (
                <div className="err inline-flex items-center gap-1.5">
                  <X className="h-4 w-4" /> {err}
                </div>
              )}
            </div>

            {st === "ended" && a.user_base_id_3 && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-ink/[0.04] px-3 py-2 ring-1 ring-ink/[0.06]">
                <Star className="h-4 w-4 text-accent" filled />
                <span className="text-sm text-ink">
                  Winner <span className="font-stat tabular-nums">{a.user_base_id_3.slice(0, 8)}</span>
                </span>
              </div>
            )}

            {live && user && (
              <form onSubmit={bid} className="mt-4">
                <div className="field">
                  <label>Your bid (min {minNext.toLocaleString()})</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min={minNext} required />
                </div>
                <button className="w-full inline-flex items-center justify-center gap-1.5">
                  <Gavel className="h-4 w-4" /> Place bid
                </button>
              </form>
            )}
            {live && !user && (
              <p className="muted mt-3 text-sm">
                <Link to="/login" className="text-brand-600 font-medium">Log in</Link> to bid.
              </p>
            )}
            {live && isAgent && (
              <button className="ghost w-full mt-3 inline-flex items-center justify-center gap-1.5" onClick={close}>
                <X className="h-4 w-4" /> Close auction now
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
