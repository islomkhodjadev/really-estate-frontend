import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { ReactNode } from "react";
import { DEFAULT_CENTER } from "../api/util";

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export type MapPoint = { pos: [number, number]; popup?: ReactNode };

export function PropertyMap({
  points,
  center,
  height = 320,
  zoom = 12,
}: {
  points: MapPoint[];
  center?: [number, number];
  height?: number;
  zoom?: number;
}) {
  const c = center ?? points[0]?.pos ?? DEFAULT_CENTER;
  return (
    <MapContainer center={c} zoom={zoom} style={{ height, borderRadius: 12 }} scrollWheelZoom>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      {points.map((p, i) => (
        <Marker key={i} position={p.pos}>
          {p.popup && <Popup>{p.popup}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
}

export type HeatPoint = { pos: [number, number]; price: number; title?: string; isCurrent?: boolean };

function priceColor(pct: number): string {
  // green (0%) → yellow (50%) → red (100%)
  if (pct <= 25)  return "#22c55e";
  if (pct <= 45)  return "#84cc16";
  if (pct <= 60)  return "#f59e0b";
  if (pct <= 80)  return "#f97316";
  return "#ef4444";
}

export function PriceHeatmap({
  points,
  center,
  height = 340,
}: {
  points: HeatPoint[];
  center: [number, number];
  height?: number;
}) {
  const prices = points.map((p) => p.price).sort((a, b) => a - b);
  const pct = (price: number) => {
    const below = prices.filter((v) => v < price).length;
    return prices.length > 1 ? (below / (prices.length - 1)) * 100 : 50;
  };

  const current = points.find((p) => p.isCurrent);
  const curPct = current ? Math.round(pct(current.price)) : null;
  const verdict =
    curPct === null ? null :
    curPct <= 20 ? { label: "Great deal", color: "#22c55e" } :
    curPct <= 40 ? { label: "Below average", color: "#84cc16" } :
    curPct <= 60 ? { label: "Fair price", color: "#f59e0b" } :
    curPct <= 80 ? { label: "Above average", color: "#f97316" } :
    { label: "Premium price", color: "#ef4444" };

  return (
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-ink/[0.06] shadow-card">
      {/* verdict chip */}
      {verdict && (
        <div
          className="absolute left-3 top-3 z-[500] flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-soft backdrop-blur"
          style={{ background: verdict.color + "22", color: verdict.color, border: `1px solid ${verdict.color}44` }}
        >
          <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: verdict.color }} />
          {verdict.label} · {curPct}th percentile
        </div>
      )}

      {/* legend */}
      <div className="absolute bottom-3 right-3 z-[500] rounded-xl bg-white/90 px-3 py-2 text-[10px] font-medium shadow-soft backdrop-blur ring-1 ring-ink/10">
        <div className="mb-1.5 text-[9px] uppercase tracking-widest text-muted">Price in area</div>
        {[
          { label: "Best deal", color: "#22c55e" },
          { label: "Good", color: "#84cc16" },
          { label: "Fair", color: "#f59e0b" },
          { label: "High", color: "#f97316" },
          { label: "Premium", color: "#ef4444" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5 leading-5">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-ink/70">{label}</span>
          </div>
        ))}
      </div>

      <MapContainer center={center} zoom={13} style={{ height }} scrollWheelZoom={false} zoomControl={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        {points.map((pt, i) => {
          const p = pct(pt.price);
          const color = priceColor(p);
          return pt.isCurrent ? (
            // current property: large pulsing ring
            <CircleMarker
              key={`cur-${i}`}
              center={pt.pos}
              radius={14}
              pathOptions={{ color: "#fff", fillColor: color, fillOpacity: 1, weight: 3 }}
            >
              <Popup>
                <strong>{pt.title || "This property"}</strong><br />
                {pt.price.toLocaleString()} USD<br />
                <span style={{ color }}>{verdict?.label}</span>
              </Popup>
            </CircleMarker>
          ) : (
            <CircleMarker
              key={i}
              center={pt.pos}
              radius={7}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 1.5 }}
            >
              <Popup>
                {pt.title || "Property"}<br />{pt.price.toLocaleString()} USD
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function ClickPicker({ onPick }: { onPick: (p: [number, number]) => void }) {
  useMapEvents({ click(e) { onPick([e.latlng.lat, e.latlng.lng]); } });
  return null;
}

/** Click-to-set map for the create form. */
export function MapPicker({
  value,
  onChange,
  height = 240,
}: {
  value: [number, number] | null;
  onChange: (p: [number, number]) => void;
  height?: number;
}) {
  return (
    <MapContainer center={value ?? DEFAULT_CENTER} zoom={12} style={{ height, borderRadius: 12 }} scrollWheelZoom>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
      <ClickPicker onPick={onChange} />
      {value && <Marker position={value} />}
    </MapContainer>
  );
}
