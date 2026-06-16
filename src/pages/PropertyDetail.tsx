import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { itemGet, itemList, itemCreate, invoke, one, imgUrl, arr } from "../api/client";
import { parseLatLng } from "../api/util";
import { PropertyMap, PriceHeatmap, HeatPoint } from "../components/PropertyMap";
import { PropertyCard } from "./PropertyCard";
import { useAuth } from "../auth/AuthContext";
import { Heart, Star, ChevronRight, CreditCard, RefreshCw } from "../components/icons";

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [p, setP] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
  const [priceEval, setPriceEval] = useState<{ pct: number; label: string; color: string; districtAvg: number; pricePerM2: number | null; districtCount: number } | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [date, setDate] = useState("");
  const [buying, setBuying] = useState(false);
  const [rev, setRev] = useState({ rating: 5, comment: "" });

  async function load() {
    if (!id) return;
    const prop = await itemGet("property", id);
    setP(prop);
    const agentId = one(prop.user_base_id);
    if (agentId) itemGet("user_base", agentId).then(setAgent).catch(() => {});
    if (agentId) {
      const { items } = await itemList("review", {}, 1, 200);
      setReviews(items.filter((r: any) => r.user_base_id === agentId));
    }
    const all = await itemList("property", {}, 1, 200);
    const sameDistrict = all.items.filter(
      (x: any) => x.district === prop.district && x.guid !== id && Number(x.price) > 0
    );
    setSimilar(
      all.items
        .filter((x: any) => x.guid !== id && (one(x.property_type) === one(prop.property_type) || x.district === prop.district))
        .slice(0, 3)
    );

    // build heatmap points from all priced+located properties
    const myLatLng = parseLatLng(prop.location);
    const pts: HeatPoint[] = [];
    if (myLatLng && Number(prop.price) > 0) {
      pts.push({ pos: myLatLng, price: Number(prop.price), title: prop.title, isCurrent: true });
    }
    for (const x of all.items) {
      if (x.guid === id || !Number(x.price)) continue;
      const ll = parseLatLng(x.location);
      if (ll) pts.push({ pos: ll, price: Number(x.price), title: x.title });
    }
    setHeatPoints(pts);

    // price evaluation
    const pool = sameDistrict.length >= 3 ? sameDistrict : all.items.filter((x: any) => x.guid !== id && Number(x.price) > 0);
    if (pool.length >= 2 && Number(prop.price) > 0) {
      const prices = pool.map((x: any) => Number(x.price)).sort((a: number, b: number) => a - b);
      const myPrice = Number(prop.price);
      const below = prices.filter((v: number) => v < myPrice).length;
      const pct = Math.round((below / prices.length) * 100);
      const districtAvg = Math.round(prices.reduce((s: number, v: number) => s + v, 0) / prices.length);
      const pricePerM2 = prop.area ? Math.round(myPrice / Number(prop.area)) : null;
      const label =
        pct <= 20 ? "Great deal" :
        pct <= 40 ? "Below average" :
        pct <= 60 ? "Fair price" :
        pct <= 80 ? "Above average" : "Premium";
      const color =
        pct <= 20 ? "#22c55e" :
        pct <= 40 ? "#84cc16" :
        pct <= 60 ? "#f59e0b" :
        pct <= 80 ? "#f97316" : "#ef4444";
      setPriceEval({ pct, label, color, districtAvg, pricePerM2, districtCount: pool.length });
    }
  }
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); setCur(0); load(); }, [id]);

  const [cur, setCur] = useState(0);

  if (!p) return <p className="muted">Loading…</p>;

  const gallery: string[] = [one(p.main_photo), ...(Array.isArray(p.photos) ? p.photos : [])].filter(Boolean).map(imgUrl);
  const photo = gallery[cur] || gallery[0] || "";
  const prev = () => setCur((c) => (c - 1 + gallery.length) % gallery.length);
  const next = () => setCur((c) => (c + 1) % gallery.length);
  const amenities = ["parking", "balcony", "elevator", "furniture", "air_conditioning", "internet", "pets_allowed"]
    .filter((a) => p[a] === true || one(p[a]) === "true");
  const latlng = parseLatLng(p.location);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1) : null;

  async function buyNow() {
    setErr(""); setMsg(""); setBuying(true);
    try {
      const deal = await itemCreate("deal", {
        property_id: id,
        user_base_id: user!.user_id,          // buyer (matches Deals form convention)
        user_base_id_2: one(p.user_base_id),  // agent/owner
        deal_type: arr("purchase"),
        amount: Number(p.price || 0),
        status: arr("pending"),
      });
      const dealId = deal?.guid ?? deal?.data?.guid;
      if (!dealId) throw new Error("Could not create deal");
      const res = await invoke("create_checkout_session", { deal_id: dealId });
      if (res?.url) { window.location.href = res.url; return; }
      throw new Error("No checkout URL returned");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBuying(false);
    }
  }

  async function addFavorite() {
    setErr(""); setMsg("");
    try { await itemCreate("favorite", { user_base_id: user!.user_id, property_id: id }); setMsg("Added to favorites"); }
    catch (e: any) { setErr(e.message); }
  }
  async function book() {
    setErr(""); setMsg("");
    try { await invoke("book_viewing", { property_id: id, viewing_date: date, comment: "" }); setMsg("Viewing requested"); }
    catch (e: any) { setErr(e.message); }
  }
  async function leaveReview() {
    setErr(""); setMsg("");
    try {
      await itemCreate("review", {
        rating: rev.rating, comment: rev.comment,
        user_base_id: one(p.user_base_id), // agent
        user_base_id_2: user!.user_id,     // client
      });
      setRev({ rating: 5, comment: "" });
      setMsg("Review submitted");
      load();
    } catch (e: any) { setErr(e.message); }
  }

  return (
    <div className="animate-fade-up">
      {/* ---------------------------------------------------------- gallery */}
      <section className="grid gap-3 lg:grid-cols-[1fr_auto]">
        {/* main image */}
        <div className="relative h-72 sm:h-[28rem] rounded-3xl overflow-hidden shadow-soft ring-1 ring-ink/[0.06] bg-bg">
          {photo ? (
            <img
              key={cur}
              src={photo}
              alt={p.title}
              className="h-full w-full object-cover transition-opacity duration-300"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-muted text-sm">No photo</span>
          )}

          {/* deal type pill */}
          {photo && (
            <span className="absolute left-4 top-4 chip bg-white/85 text-ink backdrop-blur capitalize">
              {one(p.deal_type) || "sale"}
            </span>
          )}

          {/* prev / next arrows */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-soft backdrop-blur ring-1 ring-ink/10 transition hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronRight className="h-4 w-4 rotate-180 text-ink" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-soft backdrop-blur ring-1 ring-ink/10 transition hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4 text-ink" />
              </button>
              {/* dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCur(i)}
                    className={`h-1.5 rounded-full transition-all duration-200 ${i === cur ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* thumbnail strip */}
        {gallery.length > 1 && (
          <div className="flex gap-2 lg:flex-col overflow-x-auto lg:overflow-y-auto lg:max-h-[28rem] lg:w-28 pb-1 lg:pb-0">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setCur(i)}
                className={`shrink-0 w-20 h-16 lg:w-full lg:h-20 rounded-xl overflow-hidden ring-2 transition-all duration-150 ${
                  i === cur ? "ring-brand-600 opacity-100" : "ring-ink/[0.08] opacity-60 hover:opacity-90"
                }`}
              >
                <img src={g} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------- title / price header */}
      <header className="mt-8 flex flex-col gap-3 border-b border-ink/[0.08] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" /> Residence
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl">{p.title}</h1>
          <p className="muted mt-2 text-[15px]">{p.address} · {p.district}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="badge">{one(p.deal_type)}</span>
            <span className="badge bg-violet-50 text-violet-700">{one(p.property_type)}</span>
            <span className="badge bg-amber-50 text-amber-700">{one(p.status)}</span>
          </div>
        </div>
        <div className="shrink-0 sm:text-right">
          <div className="price !text-3xl sm:!text-4xl">
            {Number(p.price || 0).toLocaleString()} {one(p.currency) || "USD"}
            {one(p.deal_type) === "rent" && <span className="muted text-base"> / month</span>}
          </div>
          {avgRating && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-ink sm:justify-end">
              <Star filled className="h-4 w-4 text-accent" /> {avgRating}
              <span className="muted">({reviews.length} reviews)</span>
            </div>
          )}
        </div>
      </header>

      {/* --------------------------------------------------- price evaluation */}
      {priceEval && (
        <div className="mt-6 rounded-2xl border border-ink/[0.08] bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-[.2em] text-muted">
              Price evaluation · {priceEval.districtCount} listings in area
            </span>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: priceEval.color + "18", color: priceEval.color }}
            >
              {priceEval.label}
            </span>
          </div>

          {/* gradient bar */}
          <div className="relative h-2.5 w-full rounded-full overflow-hidden"
            style={{ background: "linear-gradient(to right, #22c55e, #84cc16, #f59e0b, #f97316, #ef4444)" }}>
            <div
              className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white shadow-soft transition-all duration-500"
              style={{ left: `clamp(8px, calc(${priceEval.pct}% - 8px), calc(100% - 8px))`, background: priceEval.color }}
            />
          </div>

          {/* axis labels */}
          <div className="mt-1.5 flex justify-between text-[10px] font-medium text-muted">
            <span>Cheapest</span>
            <span>Most expensive</span>
          </div>

          {/* stats row */}
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-ink/[0.06] pt-4">
            <div className="text-center">
              <div className="font-stat text-base font-semibold tabular-nums text-ink">
                {priceEval.pct}th
              </div>
              <div className="text-[10px] text-muted mt-0.5">percentile</div>
            </div>
            <div className="text-center border-x border-ink/[0.06]">
              <div className="font-stat text-base font-semibold tabular-nums text-ink">
                {priceEval.districtAvg.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted mt-0.5">area avg (USD)</div>
            </div>
            <div className="text-center">
              <div className="font-stat text-base font-semibold tabular-nums text-ink">
                {priceEval.pricePerM2 ? `${priceEval.pricePerM2.toLocaleString()}` : "—"}
              </div>
              <div className="text-[10px] text-muted mt-0.5">USD / m²</div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------- main / sticky-sidebar grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        {/* ------------------------------------------------------- main column */}
        <div className="min-w-0">
          {/* key-specs band */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {p.area ? <div className="stat min-w-0"><div className="n">{p.area}</div><div className="muted">m²</div></div> : null}
            {p.rooms ? <div className="stat min-w-0"><div className="n">{p.rooms}</div><div className="muted">rooms</div></div> : null}
            {p.bathrooms ? <div className="stat min-w-0"><div className="n">{p.bathrooms}</div><div className="muted">baths</div></div> : null}
            {p.floor ? <div className="stat min-w-0"><div className="n">{p.floor}/{p.total_floors || "?"}</div><div className="muted">floor</div></div> : null}
            {p.year_built ? <div className="stat min-w-0"><div className="n">{p.year_built}</div><div className="muted">built</div></div> : null}
          </div>

          {p.description && (
            <section className="mt-10">
              <h2 className="section-title text-2xl">Description</h2>
              <p className="mt-3 max-w-prose leading-relaxed text-ink/80">{p.description}</p>
            </section>
          )}

          {amenities.length > 0 && (
            <section className="mt-10">
              <h2 className="section-title text-2xl">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span key={a} className="chip bg-white text-ink ring-1 ring-ink/10 capitalize">{a.replace("_", " ")}</span>
                ))}
              </div>
            </section>
          )}

          {latlng && (
            <section className="mt-10">
              <h2 className="section-title text-2xl">Location &amp; Price heatmap</h2>
              <p className="muted mt-1 text-sm">
                Each dot = a listing. Color shows price relative to the area — green is the best deal, red is premium.
              </p>
              <div className="mt-3">
                {heatPoints.length >= 2
                  ? <PriceHeatmap points={heatPoints} center={latlng} height={340} />
                  : <div className="overflow-hidden rounded-2xl ring-1 ring-ink/[0.06] shadow-card">
                      <PropertyMap points={[{ pos: latlng }]} center={latlng} height={260} />
                    </div>
                }
              </div>
            </section>
          )}

          <section className="mt-10">
            <h2 className="section-title text-2xl">
              Reviews {avgRating && <span className="badge align-middle inline-flex items-center gap-1"><Star filled className="h-3.5 w-3.5" /> {avgRating} ({reviews.length})</span>}
            </h2>
            {reviews.length === 0 && <p className="muted mt-3">No reviews yet.</p>}
            <div className="mt-4 space-y-3">
              {reviews.map((r) => (
                <div key={r.guid} className="panel">
                  <div className="flex items-center gap-0.5 text-accent">
                    {Array.from({ length: Number(r.rating || 0) }).map((_, i) => (
                      <Star key={i} filled className="h-4 w-4" />
                    ))}
                  </div>
                  <div className="mt-1 text-ink/80">{r.comment}</div>
                </div>
              ))}
            </div>
            {user && (
              <div className="panel mt-4">
                <h2 className="text-lg">Leave a review</h2>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="field sm:mb-0"><label>Rating</label>
                    <select value={rev.rating} onChange={(e) => setRev({ ...rev, rating: Number(e.target.value) })}>
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
                    </select>
                  </div>
                  <div className="field flex-1 sm:mb-0"><label>Comment</label>
                    <input value={rev.comment} onChange={(e) => setRev({ ...rev, comment: e.target.value })} />
                  </div>
                </div>
                <button className="mt-4" onClick={leaveReview} disabled={!rev.comment}>Submit review</button>
              </div>
            )}
          </section>
        </div>

        {/* --------------------------------------------------- sticky sidebar */}
        <aside className="lg:sticky lg:top-24 flex flex-col gap-4">
          <div className="panel">
            <h2 className="text-lg">Interested?</h2>
            <div className="price mt-1 !text-2xl">
              {Number(p.price || 0).toLocaleString()} {one(p.currency) || "USD"}
              {one(p.deal_type) === "rent" && <span className="muted text-sm"> / month</span>}
            </div>
            <div className="mt-3">
              {msg && <div className="ok">{msg}</div>}
              {err && <div className="err">{err}</div>}
            </div>
            {user ? (
              <>
                <button
                  className="w-full inline-flex items-center justify-center gap-2 mt-3"
                  onClick={buyNow}
                  disabled={buying}
                >
                  {buying
                    ? <><RefreshCw className="h-4 w-4 animate-spin" /> Processing…</>
                    : <><CreditCard className="h-4 w-4" /> Buy now · {Number(p.price || 0).toLocaleString()} {one(p.currency) || "USD"}</>
                  }
                </button>
                <button className="ghost w-full inline-flex items-center justify-center gap-2 mt-2" onClick={addFavorite}>
                  <Heart className="h-4 w-4" /> Add to favorites
                </button>
                <div className="field mt-4"><label>Viewing date & time</label>
                  <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <button className="w-full mt-2" disabled={!date} onClick={book}>Book a viewing</button>
              </>
            ) : (
              <p className="muted mt-2">Please <Link to="/login">log in</Link> to book or save.</p>
            )}
          </div>

          {agent && (
            <div className="panel">
              <span className="eyebrow text-muted">Agent / Owner</span>
              <div className="mt-3 flex items-center gap-3">
                {one(agent.avatar) && (
                  <img
                    src={imgUrl(one(agent.avatar))}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover ring-1 ring-ink/[0.06]"
                  />
                )}
                <div className="min-w-0">
                  <div className="font-display font-semibold text-ink">{agent.full_name || agent.login}</div>
                  {avgRating && <div className="muted inline-flex items-center gap-1"><Star filled className="h-3.5 w-3.5 text-accent" /> {avgRating} rating</div>}
                </div>
              </div>
              <div className="mt-3 space-y-1 border-t border-ink/[0.08] pt-3">
                {agent.phone && <div className="muted"><span className="text-ink/50">Phone</span> {agent.phone}</div>}
                {agent.email && <div className="muted"><span className="text-ink/50">Email</span> {agent.email}</div>}
              </div>
            </div>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16 border-t border-ink/[0.08] pt-10">
          <span className="eyebrow text-muted">More to explore</span>
          <h2 className="section-title mt-2">Similar listings</h2>
          <div className="grid mt-6">{similar.map((sp) => <PropertyCard key={sp.guid} p={sp} />)}</div>
        </section>
      )}
    </div>
  );
}
