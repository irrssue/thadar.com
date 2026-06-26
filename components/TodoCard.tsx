"use client";

interface Todo {
  title: string;
  from: string;
  due: string;
  done: boolean;
}

const SAMPLE_TODOS: Todo[] = [
  { title: "Algebra II — Worksheet 4.3", from: "Ms. Patel · Math 10", due: "Today", done: false },
  { title: 'Read Ch. 7 of "The Outsiders"', from: "Mr. Khan · English", due: "Tue", done: false },
  { title: "Lab report draft", from: "Dr. Liu · Biology", due: "Thu", done: false },
  { title: "Sketch — 3 thumbnails", from: "Ms. Ortiz · Art", due: "Fri", done: false },
  { title: "Spanish vocab quiz", from: "Sra. Romero", due: "Mon", done: true },
  { title: "Permission slip — field trip", from: "Homeroom", due: "—", done: true },
];

interface TodoCardProps {
  count: number;
}

const tabStyle = {
  border: "1.2px solid var(--ink-faint)",
  borderRadius: 999,
  padding: "4px 10px",
  color: "var(--ink-dim)",
  fontSize: 13,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  background: "transparent",
  cursor: "pointer",
};

export default function TodoCard({ count }: TodoCardProps) {
  const items = SAMPLE_TODOS.slice(0, count);
  const openCount = items.filter((i) => !i.done).length;

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid var(--ink-faint)",
        borderRadius: 14,
        background: "var(--surface)",
        padding: "18px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>
          Today &amp; this week
        </div>
        <span style={{ color: "var(--ink-dim)", fontSize: 14 }}>
          {openCount} open
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button style={{ ...tabStyle, borderColor: "var(--accent)", color: "var(--accent)" }}>All</button>
        <button style={tabStyle}>Due today</button>
        <button style={tabStyle}>Overdue</button>
        <button style={tabStyle}>Done</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {items.map((t, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              border: "1px solid var(--ink-faint)",
              borderRadius: 10,
              opacity: t.done ? 0.6 : 1,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                border: "1.2px solid var(--stroke)",
                borderRadius: 5,
                flexShrink: 0,
                background: t.done ? "var(--ink-faint)" : "transparent",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 15,
                  color: t.done ? "var(--ink-faint)" : "var(--ink)",
                  textDecoration: t.done ? "line-through" : "none",
                }}
              >
                {t.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ink-dim)",
                }}
              >
                {t.from}
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--ink-faint)",
              }}
            >
              {t.due}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
