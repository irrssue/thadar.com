"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import ParentIcon from "./ParentIcon";
import { useParentData } from "./ParentShell";
import { trendDir, trendDelta, dirColor } from "./util";
import { initials } from "@/components/student/subject";

/** Back link + title row used at the top of every detail page. */
export function PageHead({
  title,
  accent,
  sub,
  action,
}: {
  title: string;
  accent?: string;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  const router = useRouter();
  return (
    <>
      <button className="back" onClick={() => router.push("/parent")}>
        <ParentIcon name="back" size={15} /> Overview
      </button>
      <div className="dh">
        <div>
          <h1>
            {title} {accent && <span className="var">{accent}</span>}
          </h1>
          {sub && (
            <div className="dsub" style={{ margin: "6px 0 0" }}>
              {sub}
            </div>
          )}
        </div>
        {action}
      </div>
      <div style={{ height: 26 }} />
    </>
  );
}

/** Direction pill: ▲/▼/— with the delta, colored by trend. */
export function DirTag({ tr }: { tr: number[] }) {
  const dir = trendDir(tr);
  const d = trendDelta(tr);
  return (
    <span className="dirtag" style={{ color: dirColor(dir) }}>
      <ParentIcon name={dir} size={13} />
      {d > 0 ? "+" : ""}
      {d}
    </span>
  );
}

/** The child switcher pill row (overview). Reads/writes the shared selection. */
export function ChildSwitcher() {
  const { children, activeId, setActiveId } = useParentData();
  if (!children || children.length <= 1) return null;
  return (
    <div className="childbar stagger">
      {children.map((c) => (
        <button
          key={c.id}
          className={"childpill " + (c.id === activeId ? "on" : "")}
          onClick={() => setActiveId(c.id)}
        >
          <span className="av-sm childav">{initials(c.name)}</span>
          <span className="childmeta">
            <span className="childname">{c.first}</span>
            <span className="childsub">
              {c.grade ? `${c.grade} · ` : ""}GPA {c.gpa.toFixed(1)}
            </span>
          </span>
          {c.id === activeId && <span className="childdot" />}
        </button>
      ))}
    </div>
  );
}

/** Small tile header (eyebrow + title, optional count / "open →"). */
export function TileHead({
  eyebrow,
  title,
  count,
  open,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  count?: number;
  open?: boolean;
}) {
  return (
    <div className="tile-hd">
      <div>
        {eyebrow && <div className="tile-eyebrow">{eyebrow}</div>}
        <div className="tile-title">{title}</div>
      </div>
      {count != null && <span className="tile-count">{count}</span>}
      {open && (
        <span className="tile-open">
          open <ParentIcon name="arrow" size={13} />
        </span>
      )}
    </div>
  );
}

/** Centered status message inside a card (loading / empty / no children). */
export function ParentNotice({ children }: { children: ReactNode }) {
  return (
    <div
      className="card"
      style={{ textAlign: "center", color: "var(--ink-dim)", padding: "48px 24px" }}
    >
      {children}
    </div>
  );
}
