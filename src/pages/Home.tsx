import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { itemList } from "../api/client";
import { PropertyCard } from "./PropertyCard";

// Curated Unsplash imagery for the editorial neighbourhood tiles + hero.
const DISTRICT_IMAGES = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
];

export default function Home() {
  const [all, setAll] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const nav = useNavigate();
  useEffect(() => { itemList("property", {}, 1, 50).then((r) => setAll(r.items)).catch(() => {}); }, []);

  const districts = useMemo(() => {
    const c: Record<string, number> = {};
    all.forEach((p) => { if (p.district) c[p.district] = (c[p.district] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [all]);

  return (
    <div className="-mx-6 -mt-8">
      {/* ============================================================ HERO */}
      <section className="gradient-hero px-6 pt-10 pb-16 sm:pt-14 sm:pb-24">
        {/* drifting glow blobs */}
        <div aria-hidden className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet-400/40 blur-3xl animate-float" />
        <div aria-hidden className="pointer-events-none absolute right-0 -bottom-16 h-80 w-80 rounded-full bg-indigo-500/40 blur-3xl animate-float" style={{ animationDelay: "-8s" }} />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.35fr_1fr]">
          {/* LEFT — editorial copy + search */}
          <div className="animate-fade-up">
            <div className="mb-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white/70" style={{ letterSpacing: "0.22em" }}>
                <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
                Property Edit — Summer 2026
              </div>
              <div className="mt-3 h-px w-full max-w-md bg-white/25" />
            </div>

            <h1 className="font-display font-semibold text-white" style={{ fontSize: "clamp(2.6rem,6vw,5rem)", lineHeight: 0.98 }}>
              Find the place that becomes your{" "}
              <i className="clip-text" style={{ fontStyle: "italic" }}>address</i>
            </h1>

            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/80">
              A curated marketplace of vetted residences — apartments, houses, commercial space and land,
              for sale or rent. Search by district, set your terms, and step inside.
            </p>

            {/* signature glass search bar */}
            <form
              onSubmit={(e) => { e.preventDefault(); nav(`/catalog`); }}
              className="glass mt-7 flex flex-col gap-1.5 p-1.5 sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 items-center gap-2 px-3 py-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/70" aria-hidden>
                  <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by district, title or address…"
                  aria-label="Search residences"
                  className="w-full border-0 bg-transparent p-0 text-white outline-none ring-0 placeholder:text-white/55 focus:ring-0"
                />
              </div>
              <div className="hidden h-7 w-px bg-white/20 sm:block" />
              <button
                type="submit"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-glow transition-all hover:bg-brand-50 active:scale-[.98]"
              >
                View residences
              </button>
            </form>

            <div className="mt-4 flex items-center gap-4">
              <Link to="/catalog" className="text-sm font-medium text-white/90 hover:text-white">
                Explore the map →
              </Link>
            </div>

            {/* trust row */}
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80 tnum">
              <span><strong className="font-semibold text-white">12,480</strong> residences</span>
              <span className="h-4 w-px bg-white/20" />
              <span><strong className="font-semibold text-white">38</strong> districts</span>
              <span className="h-4 w-px bg-white/20" />
              <span><strong className="font-semibold text-white">4.9★</strong> vetted agents</span>
            </div>
          </div>

          {/* RIGHT — floating tilted card + glass stat cards */}
          <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="relative mx-auto max-w-sm">
              <div className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/20 transition-transform duration-700 will-change-transform lg:rotate-[-3deg] lg:hover:rotate-0">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80"
                  alt="Casa Ribera residence in Valencia"
                  className="h-[56vh] max-h-[460px] w-full object-cover sm:h-auto sm:aspect-[4/5]"
                  loading="eager"
                />
                {/* caption chip */}
                <div className="absolute bottom-3 left-3 rounded-full bg-ink/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  Casa Ribera · Valencia
                </div>
              </div>

              {/* YoY glass stat card */}
              <div className="glass absolute -left-4 top-8 hidden px-4 py-3 text-white shadow-soft sm:block animate-float" style={{ animationDelay: "-12s" }}>
                <div className="font-stat text-lg font-bold tnum">+18%</div>
                <div className="text-[11px] text-white/70">YoY value</div>
              </div>

              {/* Verified chip */}
              <div className="absolute -right-3 bottom-10 hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-soft sm:flex">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500" aria-hidden>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Verified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== TRUST STRIP */}
      <div className="border-b border-ink/[0.06] bg-bg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-5 text-xs font-semibold uppercase text-muted" style={{ letterSpacing: "0.14em" }}>
          {[
            "Verified listings",
            "Avg 2h response",
            "38 districts",
            "4.9★ rated",
          ].map((t, i) => (
            <span key={t} className="flex items-center gap-2">
              {i > 0 && <span className="h-3 w-px bg-ink/15" />}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ============================================ 02 NEIGHBOURHOODS */}
      {districts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pt-14 sm:pt-20">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow mb-2">02 / Neighbourhoods</div>
              <h2 className="section-title">Popular districts</h2>
            </div>
            <Link to="/catalog" className="hidden text-sm font-medium text-brand-700 hover:text-brand-800 sm:block">
              Browse all →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {districts.map(([d, n], i) => (
              <Link
                key={d}
                to="/catalog"
                className={`group relative block overflow-hidden rounded-3xl ring-1 ring-ink/[0.06] shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-soft ${i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={DISTRICT_IMAGES[i % DISTRICT_IMAGES.length]}
                    alt={`${d} district`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                  <span className="font-display text-2xl font-semibold text-white drop-shadow">{d}</span>
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink tnum backdrop-blur">
                    {n} {n === 1 ? "listing" : "listings"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============================================== 01 FEATURED EDIT */}
      <section className="mx-auto max-w-6xl px-6 pt-14 sm:pt-20">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <div className="eyebrow mb-2">01 / The Edit</div>
            <h2 className="section-title">Featured residences</h2>
          </div>
          <Link to="/catalog" className="hidden text-sm font-medium text-brand-700 hover:text-brand-800 sm:block">
            View catalog →
          </Link>
        </div>

        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
          {all.slice(0, 6).map((p) => <PropertyCard key={p.guid} p={p} />)}
          {all.length === 0 && (
            <>
              {[0, 1, 2].map((i) => (
                <div key={i} className="overflow-hidden rounded-2xl bg-surface ring-1 ring-ink/[0.05] shadow-card">
                  <div className="skeleton aspect-[4/5] w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <div className="skeleton h-5 w-2/3 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                    <div className="skeleton h-3 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* ================================================ WHY CHOOSE US */}
      <section className="mx-auto max-w-6xl px-6 pt-16 sm:pt-24">
        <div className="mb-8 text-center">
          <div className="eyebrow mb-2 justify-center">Why Lumen</div>
          <h2 className="section-title">A marketplace built on trust</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              title: "Vetted listings",
              body: "Every residence is verified by our team and a licensed agent before it goes live.",
              path: "M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z",
            },
            {
              title: "Transparent pricing",
              body: "Real prices, no hidden fees. Track value trends district by district before you commit.",
              path: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
            },
            {
              title: "Concierge support",
              body: "From first viewing to signed deed, a dedicated agent guides every step of the way.",
              path: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl bg-surface p-6 ring-1 ring-ink/[0.06] shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-soft">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={f.path} />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================== STAT BAND */}
      <section className="mt-16 sm:mt-24">
        <div className="gradient-hero mx-6 rounded-3xl px-6 py-12 sm:py-16">
          <div className="relative mx-auto grid max-w-5xl grid-cols-2 gap-8 text-center text-white lg:grid-cols-4">
            {[
              { n: "12,480", l: "Active listings" },
              { n: "$3,210", l: "Avg price / m²" },
              { n: "38", l: "Districts covered" },
              { n: "98%", l: "Client satisfaction" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-stat text-3xl font-bold tnum sm:text-4xl">{s.n}</div>
                <div className="mt-1 text-sm text-white/75">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== CTA BAND */}
      <section className="mx-auto max-w-6xl px-6 pt-16 sm:pt-24">
        <div className="relative overflow-hidden rounded-3xl bg-dark px-8 py-14 text-center sm:px-12 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-600/30 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-violet-600/30 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl" style={{ lineHeight: 1.05 }}>
              Have a property worth showing?
            </h2>
            <p className="mt-4 text-white/70">
              List with Lumen and reach thousands of qualified buyers and renters. Our agents handle the rest.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/create" className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-glow transition-all hover:bg-brand-50 active:scale-[.98]">
                List your property
              </Link>
              <Link to="/catalog" className="rounded-xl px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition-all hover:bg-white/10 active:scale-[.98]">
                Browse the catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================== FOOTER */}
      <footer className="mt-16 bg-dark text-white/70 sm:mt-24">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="font-display text-2xl font-semibold text-white">
                Lumen<span className="text-accent">.</span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/55">
                Editorial proptech. A curated marketplace for residences worth coming home to.
              </p>
            </div>
            {[
              { h: "Explore", links: [["Catalog", "/catalog"], ["Auctions", "/auctions"], ["Favorites", "/favorites"]] },
              { h: "Company", links: [["About", "/catalog"], ["Journal", "/catalog"], ["Careers", "/catalog"]] },
              { h: "Account", links: [["Dashboard", "/dashboard"], ["List property", "/create"], ["Profile", "/profile"]] },
            ].map((col) => (
              <div key={col.h}>
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{col.h}</div>
                <ul className="space-y-2 text-sm">
                  {col.links.map(([label, to]) => (
                    <li key={label}>
                      <Link to={to} className="text-white/65 transition-colors hover:text-white">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
            <span>© 2026 Lumen Estate. All rights reserved.</span>
            <span className="flex gap-5">
              <Link to="/catalog" className="hover:text-white/70">Privacy</Link>
              <Link to="/catalog" className="hover:text-white/70">Terms</Link>
              <Link to="/catalog" className="hover:text-white/70">Cookies</Link>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
