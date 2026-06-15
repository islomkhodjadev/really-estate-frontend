import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { itemList, itemUpdate } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Bell } from "../components/icons";

export default function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    if (!user) return;
    try {
      const { items } = await itemList("notification", { user_base_id: user.user_id }, 1, 50);
      // newest first
      items.sort((a: any, b: any) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
      setItems(items);
    } catch { /* ignore polling errors */ }
  }

  useEffect(() => {
    if (!user) return;
    load();
    const t = setInterval(load, 5000); // poll every 5s
    return () => clearInterval(t);
  }, [user?.user_id]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  if (!user) return null;
  const unread = items.filter((n) => !n.is_read).length;

  async function openItem(n: any) {
    if (!n.is_read) {
      itemUpdate("notification", { guid: n.guid, is_read: true }).then(load);
    }
    setOpen(false);
    if (n.link) nav(n.link);
  }
  async function markAll() {
    await Promise.all(items.filter((n) => !n.is_read).map((n) => itemUpdate("notification", { guid: n.guid, is_read: true })));
    load();
  }

  return (
    <div ref={ref} className="relative">
      <button className="ghost !px-2.5 relative" onClick={(e) => { e.stopPropagation(); setOpen(!open); }} title="Notifications">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 grid place-items-center min-w-[18px] h-[18px] bg-accent text-white text-[10px] font-stat font-semibold leading-none rounded-full px-1 shadow-glow ring-2 ring-surface">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-ink/[0.08] rounded-2xl shadow-soft z-30 overflow-hidden animate-fade-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink/[0.08]">
            <b className="font-display text-sm text-ink">Notifications</b>
            {unread > 0 && <button className="ghost !py-1 !px-2.5 text-xs rounded-full" onClick={markAll}>Mark all read</button>}
          </div>
          <div className="max-h-96 overflow-auto">
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <span className="grid place-items-center h-12 w-12 rounded-2xl bg-brand-50 text-brand-600">
                  <Bell className="h-6 w-6" />
                </span>
                <div className="font-display text-sm text-ink">No notifications</div>
                <div className="text-xs text-muted">You're all caught up.</div>
              </div>
            )}
            {items.map((n) => (
              <button
                key={n.guid}
                onClick={() => openItem(n)}
                className={`block w-full text-left !rounded-none !text-ink !shadow-none border-b border-ink/[0.06] last:border-b-0 px-4 py-3 transition-colors hover:!bg-brand-50/50 ${n.is_read ? "!bg-transparent" : "!bg-brand-50/60"}`}
              >
                <div className="flex items-center gap-2">
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />}
                  <span className="font-medium text-sm text-ink">{n.title}</span>
                </div>
                <div className="text-xs text-muted mt-0.5">{n.message}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
