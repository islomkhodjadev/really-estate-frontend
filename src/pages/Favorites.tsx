import { useEffect, useState } from "react";
import { itemList, itemGet, itemDelete } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { PropertyCard } from "./PropertyCard";
import { Heart, Trash, ArrowRight } from "../components/icons";

export default function Favorites() {
  const { user } = useAuth();
  const [favs, setFavs] = useState<any[]>([]);
  const [props, setProps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { items } = await itemList("favorite", {}, 1, 100);
    const mine = items.filter((x: any) => x.user_base_id === user!.user_id);
    setFavs(mine);
    const ps = await Promise.all(
      mine.map((fv: any) => itemGet("property", fv.property_id).catch(() => null))
    );
    setProps(ps.filter(Boolean));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(favGuid: string) {
    await itemDelete("favorite", favGuid);
    load();
  }

  return (
    <div className="mx-auto max-w-[1240px] animate-fade-up px-4 pb-20 sm:px-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 pt-8 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.22em] text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            Saved
          </div>
          <h1 className="mt-2 flex items-center gap-3 font-display text-4xl font-semibold leading-[0.96] tracking-tight text-ink sm:text-5xl">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent shadow-soft sm:h-12 sm:w-12">
              <Heart filled className="h-6 w-6" />
            </span>
            Favorites
          </h1>
        </div>
        {!loading && props.length > 0 && (
          <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-muted tabular-nums">
            {props.length} {props.length === 1 ? "residence" : "residences"}
          </p>
        )}
      </div>

      <div className="mb-5 flex items-center gap-4">
        <span className="h-px flex-1 bg-ink/[0.08]" />
      </div>

      {/* Body */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
      ) : props.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-ink/15 bg-surface/60 px-6 py-20 text-center shadow-soft">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Heart className="h-8 w-8" />
          </span>
          <p className="mt-5 font-display text-2xl text-ink">No favorites yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Save residences you love and they will gather here for quick access.
          </p>
          <a
            href="/catalog"
            className="btn mt-6 inline-flex items-center gap-2"
          >
            Browse the catalog
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {props.map((p, i) => (
            <div key={p.guid} className="flex flex-col gap-3">
              <PropertyCard p={p} />
              <button
                className="ghost inline-flex w-full items-center justify-center gap-2"
                onClick={() => remove(favs[i].guid)}
              >
                <Trash className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
