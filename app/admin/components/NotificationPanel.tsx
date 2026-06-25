"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AdminIcon from "./AdminIcon";
import type { QueueItem } from "../types";

const ACTION_HREF: Record<string, string> = {
  account: "/admin/users",
  teacher: "/admin/users",
  membership: "/admin/users",
  class: "/admin/classes",
  message: "/admin/content",
};

function itemHref(item: QueueItem): string {
  return item.action ? (ACTION_HREF[item.action] ?? "/admin") : "/admin";
}

export default function NotificationPanel({
  initialItems,
  onClose,
}: {
  initialItems: QueueItem[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<QueueItem[]>(initialItems);
  const [loading, setLoading] = useState(false);

  // refresh queue from API when panel opens
  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/queue")
      .then((r) => r.json())
      .then((d) => { if (d.success && Array.isArray(d.data)) setItems(d.data); })
      .finally(() => setLoading(false));
  }, []);

  // close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const urgent = items.filter((i) => i.urgent);
  const normal = items.filter((i) => !i.urgent);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        width: 340,
        background: "var(--panel)",
        border: "1px solid var(--stroke)",
        borderRadius: 16,
        boxShadow: "0 20px 60px -20px rgba(0,0,0,0.6)",
        zIndex: 200,
        overflow: "hidden",
      }}
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px 12px",
          borderBottom: "1px solid var(--stroke)",
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "var(--ink-faint)" }}>
          Notifications
        </span>
        {loading ? (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-faint)" }}>refreshing…</span>
        ) : (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-faint)" }}>
            {items.length === 0 ? "all clear" : `${items.length} pending`}
          </span>
        )}
      </div>

      {/* content */}
      <div style={{ maxHeight: 420, overflowY: "auto" }}>
        {items.length === 0 && !loading && (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: "var(--ink-faint)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          >
            No items need your attention
          </div>
        )}

        {urgent.length > 0 && (
          <>
            <div style={{ padding: "10px 16px 4px", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: "var(--danger)" }}>
              Urgent
            </div>
            {urgent.map((item) => (
              <NotifRow key={item.id} item={item} onClose={onClose} />
            ))}
          </>
        )}

        {normal.length > 0 && (
          <>
            <div style={{ padding: "10px 16px 4px", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: "var(--ink-faint)" }}>
              Review
            </div>
            {normal.map((item) => (
              <NotifRow key={item.id} item={item} onClose={onClose} />
            ))}
          </>
        )}
      </div>

      {/* footer */}
      {items.length > 0 && (
        <div style={{ borderTop: "1px solid var(--stroke)", padding: "10px 16px" }}>
          <Link
            href="/admin/users"
            onClick={onClose}
            style={{
              display: "block",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--accent)",
              textDecoration: "none",
              padding: "6px 0",
            }}
          >
            View all pending items →
          </Link>
        </div>
      )}
    </div>
  );
}

function NotifRow({ item, onClose }: { item: QueueItem; onClose: () => void }) {
  return (
    <Link
      href={itemHref(item)}
      onClick={onClose}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <div className="modrow" style={{ margin: "2px 8px", cursor: "pointer" }}>
        <div
          className="feed-ico"
          style={{
            background: item.urgent ? "color-mix(in srgb, var(--danger) 12%, transparent)" : "var(--accent-soft)",
            color: item.urgent ? "var(--danger)" : "var(--accent)",
            border: `1px solid ${item.urgent ? "color-mix(in srgb, var(--danger) 30%, transparent)" : "var(--accent-line)"}`,
          }}
        >
          <AdminIcon name={item.icon} size={15} />
        </div>
        <div className="mbody" style={{ minWidth: 0 }}>
          <div className="mi" style={{ fontSize: 13.5 }}>{item.item}</div>
          <div className="mk">{item.who} · {item.kind}</div>
        </div>
        <AdminIcon name="arrow" size={14} />
      </div>
    </Link>
  );
}
