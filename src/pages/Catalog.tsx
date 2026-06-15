import { useEffect, useMemo, useState } from "react";
import { itemList, one } from "../api/client";
import { parseLatLng } from "../api/util";
import { ENUMS } from "../config";
import { PropertyCard } from "./PropertyCard";
import { PropertyMap } from "../components/PropertyMap";

export default function Catalog() {
  const [all, setAll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ search: "", deal_type: "", property_type: "", min: "", max: "", sort: "date" });
  const [view, setView] = useState<"list" | "map">("list");

  useEffect(() => {
    setLoading(true);
    // numeric/text filters server-side; multiselect filtered client-side (array columns)
    const filter: Record<string, any> = {};
    if (f.search) filter["search"] = f.search;
    if (f.min || f.max) filter["price"] = {
      ...(f.min ? { $gte: Number(f.min) } : {}),
      ...(f.max ? { $lte: Number(f.max) } : {}),
    };
    itemList("property", filter, 1, 100)
      .then((r) => setAll(r.items))
      .finally(() => setLoading(false));
  }, [f.search, f.min, f.max]);

  const items = useMemo(() => {
    let list = all.filter((p) => {
      if (f.deal_type && one(p.deal_type) !== f.deal_type) return false;
      if (f.property_type && one(p.property_type) !== f.property_type) return false;
      return true;
    });
    if (f.sort === "price_asc") list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (f.sort === "price_desc") list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (f.sort === "area") list = [...list].sort((a, b) => (b.area || 0) - (a.area || 0));
    return list;
  }, [all, f.deal_type, f.property_type, f.sort]);

  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  const mapPoints = useMemo(
    () => items
      .map((p) => ({ ll: parseLatLng(p.location), p }))
      .filter((x) => x.ll)
      .map((x) => ({ pos: x.ll as [number, number], popup: <b>{x.p.title}</b> })),
    [items]
  );

  const fieldLabel =
    "block text-[11px] font-semibold uppercase tracking-[.16em] text-muted mb-1.5";
  const fieldControl =
    "w-full h-11 rounded-sm border border-ink/10 bg-bg/60 px-3 text-sm text-ink " +
    "placeholder:text-muted/60 transition focus:border-brand-600 focus:bg-surface " +
    "focus:outline-none focus:ring-4 focus:ring-brand-600/10";

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-20">
      {/* Page heading + view toggle */}
      <div className="flex flex-col gap-4 pt-8 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.22em] text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            The Edit
          </div>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[0.96] tracking-tight text-ink sm:text-5xl">
            Catalog
          </h1>
        </div>

        {/* List / Map segmented toggle */}
        <div
          role="tablist"
          aria-label="View mode"
          className="inline-flex w-full max-w-[220px] items-center gap-1 self-start rounded-full border border-ink/10 bg-surface p-1 shadow-card sm:self-auto"
        >
          <button
            role="tab"
            aria-selected={view === "list"}
            onClick={() => setView("list")}
            className={
              "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[.98] " +
              (view === "list"
                ? "bg-brand-600 text-white shadow-glow"
                : "text-muted hover:text-ink")
            }
          >
            List
          </button>
          <button
            role="tab"
            aria-selected={view === "map"}
            onClick={() => setView("map")}
            className={
              "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[.98] " +
              (view === "map"
                ? "bg-brand-600 text-white shadow-glow"
                : "text-muted hover:text-ink")
            }
          >
            Map
          </button>
        </div>
      </div>

      {/* Sticky filter toolbar */}
      <div className="sticky top-4 z-30">
        <div className="rounded-md border border-ink/5 bg-surface/80 p-4 shadow-soft backdrop-blur-xl sm:p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <label className={fieldLabel} htmlFor="cat-search">Search</label>
              <input
                id="cat-search"
                value={f.search}
                onChange={set("search")}
                placeholder="Title or address…"
                className={fieldControl}
              />
            </div>
            <div className="lg:col-span-2">
              <label className={fieldLabel} htmlFor="cat-deal">Deal</label>
              <select id="cat-deal" value={f.deal_type} onChange={set("deal_type")} className={fieldControl}>
                <option value="">Any</option>
                {ENUMS.dealType.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className={fieldLabel} htmlFor="cat-type">Type</label>
              <select id="cat-type" value={f.property_type} onChange={set("property_type")} className={fieldControl}>
                <option value="">Any</option>
                {ENUMS.propertyType.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className={fieldLabel}>Price</label>
              <div className="flex items-center gap-2">
                <input
                  value={f.min}
                  onChange={set("min")}
                  type="number"
                  placeholder="Min"
                  aria-label="Min price"
                  className={fieldControl + " px-2.5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"}
                />
                <span className="text-muted/50">–</span>
                <input
                  value={f.max}
                  onChange={set("max")}
                  type="number"
                  placeholder="Max"
                  aria-label="Max price"
                  className={fieldControl + " px-2.5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"}
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className={fieldLabel} htmlFor="cat-sort">Sort</label>
              <select id="cat-sort" value={f.sort} onChange={set("sort")} className={fieldControl}>
                <option value="date">Newest</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
                <option value="area">Area</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results header line */}
      <div className="mt-7 mb-5 flex items-center gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-muted tabular-nums">
          {loading ? "Loading residences…" : `${items.length} ${items.length === 1 ? "residence" : "residences"}`}
        </p>
        <span className="h-px flex-1 bg-ink/[0.08]" />
      </div>

      {/* Results body */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-ink/5 bg-surface shadow-card">
              <div className="aspect-[4/5] w-full animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-ink/5 via-ink/10 to-ink/5" />
              <div className="space-y-2.5 p-4">
                <div className="h-5 w-1/3 animate-shimmer rounded bg-[length:200%_100%] bg-gradient-to-r from-ink/5 via-ink/10 to-ink/5" />
                <div className="h-4 w-3/4 animate-shimmer rounded bg-[length:200%_100%] bg-gradient-to-r from-ink/5 via-ink/10 to-ink/5" />
                <div className="h-4 w-1/2 animate-shimmer rounded bg-[length:200%_100%] bg-gradient-to-r from-ink/5 via-ink/10 to-ink/5" />
              </div>
            </div>
          ))}
        </div>
      ) : view === "list" ? (
        items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-surface/60 py-20 text-center">
            <p className="font-display text-2xl text-ink">No residences match</p>
            <p className="mt-1 text-sm text-muted">Try widening your price range or clearing a filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => <PropertyCard key={p.guid} p={p} />)}
          </div>
        )
      ) : (
        <div className="overflow-hidden rounded-md border border-ink/5 shadow-soft ring-1 ring-ink/5">
          <PropertyMap points={mapPoints} height={560} />
        </div>
      )}
    </div>
  );
}
