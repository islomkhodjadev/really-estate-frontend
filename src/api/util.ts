export function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) {
    alert("Nothing to export");
    return;
  }
  const cols = Object.keys(rows[0]);
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Parse a UCode MAP field into [lat, lng]. Accepts object or "lat,lng" string. */
export function parseLatLng(loc: any): [number, number] | null {
  if (!loc) return null;
  if (typeof loc === "object") {
    const lat = loc.lat ?? loc.latitude ?? loc.Lat ?? loc.y;
    const lng = loc.long ?? loc.lng ?? loc.longitude ?? loc.Long ?? loc.x;
    if (lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng)))
      return [Number(lat), Number(lng)];
  }
  if (typeof loc === "string" && loc.includes(",")) {
    const [a, b] = loc.split(",").map((x) => Number(x.trim()));
    if (!isNaN(a) && !isNaN(b)) return [a, b];
  }
  return null;
}

export const DEFAULT_CENTER: [number, number] = [41.3111, 69.2797]; // Tashkent
