import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { itemCreate, uploadFile, imgUrl, arr } from "../api/client";
import { ENUMS } from "../config";
import { MapPicker } from "../components/PropertyMap";
import { useAuth } from "../auth/AuthContext";
import { ImageUpload, MultiImageUpload } from "../components/Upload";
import {
  FileText,
  Building,
  Sparkles,
  ImageIcon,
  MapPin,
  Check,
  X,
  RefreshCw,
  ArrowRight,
} from "../components/icons";

export default function CreateProperty() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState<any>({
    title: "", description: "", price: "", currency: "USD",
    property_type: "apartment", deal_type: "sale", status: "active",
    address: "", district: "", area: "", rooms: "", bathrooms: "",
    floor: "", total_floors: "", year_built: "", heating_type: "central",
  });
  const [amen, setAmen] = useState<Record<string, boolean>>({});
  const [mainPhoto, setMainPhoto] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [loc, setLoc] = useState<[number, number] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const AMEN = ["parking", "balcony", "elevator", "furniture", "air_conditioning", "internet", "pets_allowed"];

  async function onMain(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try { setMainPhoto(await uploadFile(file)); } finally { setBusy(false); }
  }
  async function onPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    try {
      const links = await Promise.all(files.map(uploadFile));
      setPhotos([...photos, ...links.filter(Boolean)]);
    } finally { setBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const body: any = {
        title: f.title, description: f.description,
        price: Number(f.price) || 0,
        currency: arr(f.currency), property_type: arr(f.property_type),
        deal_type: arr(f.deal_type), status: arr(f.status), heating_type: arr(f.heating_type),
        address: f.address, district: f.district,
        area: Number(f.area) || 0, rooms: Number(f.rooms) || 0,
        bathrooms: Number(f.bathrooms) || 0, floor: Number(f.floor) || 0,
        total_floors: Number(f.total_floors) || 0, year_built: Number(f.year_built) || 0,
        main_photo: mainPhoto, photos,
        user_base_id: user!.user_id, // agent (current user)
      };
      if (loc) body.location = `${loc[0]},${loc[1]}`;
      AMEN.forEach((a) => (body[a] = !!amen[a]));
      const res = await itemCreate("property", body);
      const guid = res?.data?.guid ?? res?.guid;
      nav(guid ? `/property/${guid}` : "/catalog");
    } catch (e: any) {
      setErr(e.message || "failed to create listing");
    } finally {
      setBusy(false);
    }
  }

  // shared field primitives (match Lumen Catalog/PropertyDetail styling)
  const fieldLabel =
    "block text-[11px] font-semibold uppercase tracking-[.16em] text-muted mb-1.5";
  const fieldControl =
    "w-full h-11 rounded-sm border border-ink/10 bg-bg/60 px-3 text-sm text-ink " +
    "placeholder:text-muted/60 transition focus:border-brand-600 focus:bg-surface " +
    "focus:outline-none focus:ring-4 focus:ring-brand-600/10";
  const numControl =
    fieldControl + " [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none tabular-nums";

  function SectionHead({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
    return (
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
          {icon}
        </span>
        <div>
          <h2 className="section-title font-display text-xl font-semibold leading-tight tracking-tight text-ink">
            {title}
          </h2>
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[920px] px-4 sm:px-6 pb-24 animate-fade-up">
      {/* Page heading */}
      <div className="pt-8 pb-7">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.22em] text-muted">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          New residence
        </div>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-[0.96] tracking-tight text-ink sm:text-5xl">
          Create listing
        </h1>
        <p className="mt-3 max-w-prose text-sm text-muted">
          Add the details, amenities, photography and a precise location to publish a new residence.
        </p>
      </div>

      {err && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-accent/25 bg-accent/[0.06] px-4 py-3 text-sm text-ink shadow-soft">
          <X className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span>{err}</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        {/* Basics */}
        <section className="card rounded-3xl border border-ink/[0.08] bg-surface p-6 shadow-card sm:p-7">
          <SectionHead
            icon={<FileText className="h-5 w-5" />}
            title="Basics"
            hint="Headline, story and pricing."
          />
          <div className="space-y-5">
            <div className="field">
              <label className={fieldLabel} htmlFor="cp-title">Title *</label>
              <input
                id="cp-title"
                value={f.title}
                onChange={set("title")}
                required
                placeholder="Sunlit two-bedroom with city views"
                className={fieldControl}
              />
            </div>
            <div className="field">
              <label className={fieldLabel} htmlFor="cp-desc">Description</label>
              <textarea
                id="cp-desc"
                rows={4}
                value={f.description}
                onChange={set("description")}
                placeholder="Describe the residence, its character and surroundings…"
                className={fieldControl + " h-auto min-h-[110px] resize-y py-3 leading-relaxed"}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="field lg:col-span-2">
                <label className={fieldLabel} htmlFor="cp-price">Price *</label>
                <input
                  id="cp-price"
                  type="number"
                  value={f.price}
                  onChange={set("price")}
                  required
                  placeholder="0"
                  className={numControl}
                />
              </div>
              <div className="field">
                <label className={fieldLabel} htmlFor="cp-currency">Currency</label>
                <select id="cp-currency" value={f.currency} onChange={set("currency")} className={fieldControl}>
                  {ENUMS.currency.map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>
              <div className="field">
                <label className={fieldLabel} htmlFor="cp-deal">Deal type</label>
                <select id="cp-deal" value={f.deal_type} onChange={set("deal_type")} className={fieldControl}>
                  {ENUMS.dealType.map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>
              <div className="field">
                <label className={fieldLabel} htmlFor="cp-ptype">Property type</label>
                <select id="cp-ptype" value={f.property_type} onChange={set("property_type")} className={fieldControl}>
                  {ENUMS.propertyType.map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>
              <div className="field">
                <label className={fieldLabel} htmlFor="cp-status">Status</label>
                <select id="cp-status" value={f.status} onChange={set("status")} className={fieldControl}>
                  {ENUMS.status.map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="card rounded-3xl border border-ink/[0.08] bg-surface p-6 shadow-card sm:p-7">
          <SectionHead
            icon={<Building className="h-5 w-5" />}
            title="Details"
            hint="Address and measurable specifics."
          />
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="field">
                <label className={fieldLabel} htmlFor="cp-address">Address</label>
                <input id="cp-address" value={f.address} onChange={set("address")} placeholder="Street, building" className={fieldControl} />
              </div>
              <div className="field">
                <label className={fieldLabel} htmlFor="cp-district">District</label>
                <input id="cp-district" value={f.district} onChange={set("district")} placeholder="Neighborhood" className={fieldControl} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div className="field">
                <label className={fieldLabel} htmlFor="cp-area">Area m²</label>
                <input id="cp-area" type="number" value={f.area} onChange={set("area")} className={numControl} />
              </div>
              <div className="field">
                <label className={fieldLabel} htmlFor="cp-rooms">Rooms</label>
                <input id="cp-rooms" type="number" value={f.rooms} onChange={set("rooms")} className={numControl} />
              </div>
              <div className="field">
                <label className={fieldLabel} htmlFor="cp-baths">Baths</label>
                <input id="cp-baths" type="number" value={f.bathrooms} onChange={set("bathrooms")} className={numControl} />
              </div>
              <div className="field">
                <label className={fieldLabel} htmlFor="cp-floor">Floor</label>
                <input id="cp-floor" type="number" value={f.floor} onChange={set("floor")} className={numControl} />
              </div>
              <div className="field">
                <label className={fieldLabel} htmlFor="cp-total">Total floors</label>
                <input id="cp-total" type="number" value={f.total_floors} onChange={set("total_floors")} className={numControl} />
              </div>
              <div className="field">
                <label className={fieldLabel} htmlFor="cp-year">Year built</label>
                <input id="cp-year" type="number" value={f.year_built} onChange={set("year_built")} className={numControl} />
              </div>
            </div>
          </div>
        </section>

        {/* Amenities */}
        <section className="card rounded-3xl border border-ink/[0.08] bg-surface p-6 shadow-card sm:p-7">
          <SectionHead
            icon={<Sparkles className="h-5 w-5" />}
            title="Amenities"
            hint="Highlight what makes it stand out."
          />
          <div className="flex flex-wrap gap-2.5">
            {AMEN.map((a) => {
              const on = !!amen[a];
              return (
                <label
                  key={a}
                  className={
                    "group inline-flex cursor-pointer select-none items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 active:scale-[.98] " +
                    (on
                      ? "border-brand-600 bg-brand-600 text-white shadow-glow"
                      : "border-ink/10 bg-bg/60 text-muted hover:border-brand-400 hover:text-ink")
                  }
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) => setAmen({ ...amen, [a]: e.target.checked })}
                    className="sr-only"
                  />
                  <span
                    className={
                      "flex h-4 w-4 items-center justify-center rounded-full border transition-colors " +
                      (on ? "border-white/70 bg-white/20" : "border-ink/20 group-hover:border-brand-400")
                    }
                  >
                    {on && <Check className="h-3 w-3" />}
                  </span>
                  {a.replace("_", " ")}
                </label>
              );
            })}
          </div>
        </section>

        {/* Photos */}
        <section className="card rounded-3xl border border-ink/[0.08] bg-surface p-6 shadow-card sm:p-7">
          <SectionHead
            icon={<ImageIcon className="h-5 w-5" />}
            title="Photos"
            hint="A strong cover image sells the residence."
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ImageUpload value={mainPhoto} onChange={setMainPhoto} label="Main photo" />
            <MultiImageUpload value={photos} onChange={setPhotos} label="More photos" />
          </div>
        </section>

        {/* Location */}
        <section className="card rounded-3xl border border-ink/[0.08] bg-surface p-6 shadow-card sm:p-7">
          <SectionHead
            icon={<MapPin className="h-5 w-5" />}
            title="Location"
            hint="Click on the map to drop a precise pin."
          />
          {loc && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-bg/60 px-3 py-1.5 text-xs font-medium text-muted tabular-nums">
              <MapPin className="h-3.5 w-3.5 text-brand-600" />
              {loc[0].toFixed(4)}, {loc[1].toFixed(4)}
            </div>
          )}
          <div className="overflow-hidden rounded-2xl border border-ink/[0.08] shadow-soft">
            <MapPicker value={loc} onChange={setLoc} />
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="submit"
            disabled={busy}
            className="btn inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                Publish listing
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
