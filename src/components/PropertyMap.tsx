import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
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
