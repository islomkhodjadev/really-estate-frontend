import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { itemList, one } from "../api/client";
import { Gavel, Clock } from "../components/icons";

export function countdown(end?: string): string {
  if (!end) return "";
  const ms = new Date(end.replace(" ", "T")).getTime() - Date.now();
  if (isNaN(ms)) return "";
  if (ms <= 0) return "ended";
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function Auctions() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { itemList("auction", {}, 1, 100).then((r) => setRows(r.items)).finally(() => setLoading(false)); }, []);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-up">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          Live now
        </div>
        <h1 className="mt-2 flex items-center gap-3 font-display text-4xl font-semibold leading-[0.96] tracking-tight text-ink sm:text-5xl">
          <Gavel className="h-9 w-9 shrink-0 text-brand-600 sm:h-10 sm:w-10" />
          Auctions
        </h1>
        <p className="mt-3 max-w-xl text-[15px] text-muted">
          Bid on curated residences before the clock runs out.
        </p>
      </header>

      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl bg-surface p-5 shadow-card ring-1 ring-ink/5"
            >
              <div className="flex items-center justify-between">
                <div className="h-6 w-24 animate-pulse rounded-full bg-ink/10" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-ink/10" />
              </div>
              <div className="mt-5 h-5 w-3/4 animate-pulse rounded bg-ink/10" />
              <div className="mt-4 h-9 w-2/3 animate-pulse rounded bg-ink/10" />
              <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-ink/10" />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((a) => {
            const st = one(a.status); const left = countdown(a.end_time);
            const isActive = st === "active";
            const isEnded = st === "ended";
            const statusLabel = isActive ? "Live auction" : isEnded ? "Ended" : st || "Auction";
            const statusClass = isActive
              ? "bg-violet-50 text-violet-700"
              : isEnded
              ? "bg-ink/5 text-muted"
              : "bg-amber-50 text-amber-700";
            return (
              <Link
                key={a.guid}
                to={`/auction/${a.guid}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface p-5 shadow-card ring-1 ring-ink/5 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
                  >
                    {isActive && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500/70" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-600" />
                      </span>
                    )}
                    {statusLabel}
                  </span>
                  {isActive && left ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 font-stat text-xs font-semibold tabular-nums text-accent">
                      <Clock className="h-3.5 w-3.5" />
                      {left} left
                    </span>
                  ) : isEnded ? (
                    <span className="text-xs font-medium text-muted">Closed</span>
                  ) : null}
                </div>

                <h2 className="mt-4 truncate text-base font-semibold text-ink">
                  {a.title || "Auction"}
                </h2>

                <div className="mt-3">
                  <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                    Current bid
                  </span>
                  <span className="mt-0.5 block font-display text-[26px] font-semibold tabular-nums text-ink [font-feature-settings:'tnum']">
                    {Number(a.current_price || a.starting_price || 0).toLocaleString()}{" "}
                    <span className="text-base font-medium text-muted">USD</span>
                  </span>
                </div>

                <div className="mt-4 border-t border-ink/[0.08] pt-3 text-sm text-muted">
                  <span className="tabular-nums">
                    Start {Number(a.starting_price || 0).toLocaleString()}
                  </span>
                  <span className="px-1.5 text-ink/30">·</span>
                  <span className="tabular-nums">
                    +{Number(a.min_increment || 0).toLocaleString()} min increment
                  </span>
                </div>

                <span className="pointer-events-none absolute bottom-0 left-5 right-5 h-px origin-left scale-x-0 bg-brand-600 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            );
          })}
          {rows.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-ink/10 bg-surface/60 p-10 text-center text-muted">
              No auctions yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
