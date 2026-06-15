import { Link } from "react-router-dom";
import { one, imgUrl } from "../api/client";

export function PropertyCard({ p }: { p: any }) {
  const photo = imgUrl(one(p.main_photo) || (Array.isArray(p.photos) ? p.photos[0] : ""));
  const dealType = one(p.deal_type) || "sale";
  const propertyType = one(p.property_type) || "";
  const isWax = /auction|new/i.test(dealType);

  return (
    <Link
      to={`/property/${p.guid}`}
      className="group relative block overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-ink/5 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
    >
      {/* Image — 4:5 portrait mask with hover ken-burns + gradient overlay */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg">
        {photo ? (
          <img
            src={photo}
            alt={p.title || "Property"}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted">
            No photo
          </div>
        )}

        {/* Subtle gradient overlay for legibility / depth */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />

        {/* Deal / type pills (top-left) */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <span
            className={
              "rounded-full px-2.5 py-1 text-xs font-medium capitalize backdrop-blur " +
              (isWax
                ? "bg-accent/90 text-white"
                : "bg-brand-50/95 text-brand-700")
            }
          >
            {dealType}
          </span>
          {propertyType ? (
            <span className="rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium capitalize text-ink backdrop-blur">
              {propertyType}
            </span>
          ) : null}
        </div>

        {/* Floating price chip (bottom-left) */}
        <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 shadow-soft ring-1 ring-ink/5 backdrop-blur">
          <span className="font-display text-base tabular-nums tracking-tight text-ink [font-feature-settings:'tnum']">
            {Number(p.price || 0).toLocaleString()} {one(p.currency) || "USD"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="truncate font-sans text-[15px] font-semibold text-ink">
          {p.title || "Untitled"}
        </h3>
        {/* underline wipe under title */}
        <span className="mt-0.5 block h-px w-0 bg-brand-600 transition-all duration-300 ease-out group-hover:w-full" />

        <p className="mt-1 truncate text-sm text-muted">
          {p.district || p.address || ""}
        </p>

        {/* hairline */}
        <div className="my-3 h-px w-full bg-ink/[0.08]" />

        {/* spec row: rooms · area */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          {p.rooms ? (
            <span className="inline-flex items-center gap-1 tabular-nums">
              {/* bed icon */}
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4" />
                <path d="M2 11v9" />
                <path d="M22 11v9" />
                <path d="M4 11h16a2 2 0 0 1 2 2v3H2v-3a2 2 0 0 1 2-2Z" />
                <path d="M7 9V8a2 2 0 0 1 2-2h2" />
                <path d="M13 9V8a2 2 0 0 1 2-2h2" />
              </svg>
              {p.rooms} rooms
            </span>
          ) : null}
          {p.rooms && p.area ? <span aria-hidden="true" className="text-ink/20">·</span> : null}
          {p.area ? (
            <span className="inline-flex items-center gap-1 tabular-nums">
              {/* ruler icon */}
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z" />
                <path d="m14.5 12.5 2-2" />
                <path d="m11.5 9.5 2-2" />
                <path d="m8.5 6.5 2-2" />
                <path d="m17.5 15.5 2-2" />
              </svg>
              {p.area} m²
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
