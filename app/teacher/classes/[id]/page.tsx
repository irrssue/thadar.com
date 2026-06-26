"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import { CommandBar } from "../../components/primitives";
import type { ApiResponse, ClassDetail } from "./_components/types";
import { RosterTab } from "./_components/RosterTab";
import { LessonsTab } from "./_components/LessonsTab";
import { AssignmentsTab } from "./_components/AssignmentsTab";
import { ProgressTab } from "./_components/ProgressTab";
import { SettingsTab } from "./_components/SettingsTab";

type Tab = "roster" | "lessons" | "assignments" | "progress" | "settings";

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [klass, setKlass] = useState<ClassDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("roster");

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`/api/classes/${id}`, { cache: "no-store" });
    const json: ApiResponse<ClassDetail> = await res.json();
    if (!json.success) {
      setError(json.error);
      return;
    }
    setKlass(json.data);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error && !klass) {
    return (
      <div style={{ padding: "32px 0" }}>
        <div style={{ color: "var(--danger)", marginBottom: 16 }}>{error}</div>
        <Link href="/teacher/classes" style={{ color: "var(--accent)" }}>← Back to classes</Link>
      </div>
    );
  }
  if (!klass) return <div style={{ padding: "32px 0", color: "var(--ink-dim)" }}>Loading…</div>;

  const TABS: { id: Tab; label: string }[] = [
    { id: "roster", label: "Roster" },
    { id: "lessons", label: "Lessons" },
    { id: "assignments", label: "Assignments" },
    { id: "progress", label: "Progress" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <>
      <Link href="/teacher/classes" style={{ color: "var(--ink-dim)", fontSize: 14, textDecoration: "none" }}>← Classes</Link>

      <h1 style={{ fontWeight: 700, fontSize: 44, margin: "12px 0 4px", letterSpacing: "-0.5px" }}>{klass.name}</h1>
      {klass.description && (
        <p style={{ color: "var(--ink-dim)", fontSize: 17, margin: "0 0 16px", fontWeight: 300 }}>{klass.description}</p>
      )}
      <div style={{ display: "flex", gap: 14, color: "var(--ink-dim)", fontSize: 14, marginBottom: 24 }}>
        <span><strong style={{ color: "var(--ink)", fontWeight: 700 }}>{klass._count.memberships}</strong> students</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              border: `1.2px solid ${tab === t.id ? "var(--accent)" : "var(--ink-faint)"}`,
              borderRadius: 999, padding: "6px 14px", background: "transparent",
              color: tab === t.id ? "var(--accent)" : "var(--ink-dim)", fontSize: 14, cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "roster" && <RosterTab classId={id} onChange={load} />}
      {tab === "lessons" && <LessonsTab classId={id} />}
      {tab === "assignments" && <AssignmentsTab classId={id} />}
      {tab === "progress" && <ProgressTab classId={id} />}
      {tab === "settings" && <SettingsTab klass={klass} onChange={load} />}

      <CommandBar />
    </>
  );
}
