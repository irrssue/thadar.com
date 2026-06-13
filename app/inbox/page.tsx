"use client";

import { useCallback, useEffect, useState } from "react";
import StudentShell from "../components/student/StudentShell";
import StudentIcon from "../components/student/StudentIcon";
import { subjectColor, initials } from "../components/student/subject";

type Person = { id: string; name: string | null; email: string };
type Mail = {
  id: string;
  subject: string;
  body: string;
  readAt: string | null;
  starred: boolean;
  createdAt: string;
  sender: Person;
  recipient: Person;
};

type Box = "inbox" | "sent" | "starred";
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

const BOXES: { id: Box; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "sent", label: "Sent" },
  { id: "starred", label: "Starred" },
];

export default function InboxPage() {
  const [box, setBox] = useState<Box>("inbox");
  const [mail, setMail] = useState<Mail[] | null>(null);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState<Mail | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/messages?box=${box}`, { cache: "no-store" });
    const json: ApiResponse<{ box: Box; unread: number; messages: Mail[] }> = await res.json();
    if (json.success) {
      setMail(json.data.messages);
      setUnread(json.data.unread);
    }
  }, [box]);

  useEffect(() => {
    load();
  }, [load]);

  async function openMessage(m: Mail) {
    setOpen(m);
    if (box === "inbox" && !m.readAt) {
      await fetch(`/api/messages/${m.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      load();
    }
  }

  async function toggleStar(m: Mail) {
    await fetch(`/api/messages/${m.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ starred: !m.starred }),
    });
    load();
  }

  return (
    <StudentShell active="inbox">
      <div className="dh">
        <div>
          <h1>
            Your <span className="var">inbox</span>
          </h1>
          <p className="dsub">
            {mail === null ? "Loading…" : unread > 0 ? `${unread} unread · teachers & classmates` : "No unread messages."}
          </p>
        </div>
        <button className="btn primary" onClick={() => setShowCompose(true)}>
          <StudentIcon name="send" size={14} /> Compose
        </button>
      </div>

      <div className="filterbar">
        {BOXES.map((b) => (
          <button key={b.id} className={"fpill " + (b.id === box ? "on" : "")} onClick={() => setBox(b.id)}>
            {b.label}
          </button>
        ))}
      </div>

      <div>
        {mail !== null && mail.length === 0 && (
          <div className="card" style={{ textAlign: "center", color: "var(--ink-dim)", padding: "32px 24px" }}>
            Nothing here yet.
          </div>
        )}
        {(mail ?? []).map((m) => {
          const other = box === "sent" ? m.recipient : m.sender;
          const who = other.name ?? other.email;
          const isUnread = box === "inbox" && !m.readAt;
          const color = subjectColor(other.id);
          return (
            <button key={m.id} className={"maild " + (isUnread ? "unread" : "")} onClick={() => openMessage(m)}>
              <span
                className="av-sm"
                style={{ background: `color-mix(in srgb, ${color} 20%, transparent)`, color }}
              >
                {initials(who)}
              </span>
              <div className="mf" style={{ fontWeight: isUnread ? 700 : 400 }}>
                {isUnread && <span className="udot" />}
                {who}
              </div>
              <div className="mp">
                <span style={{ color: "var(--ink)" }}>{m.subject}</span> — {m.body}
              </div>
              <div className="mw" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={m.starred ? "Unstar" : "Star"}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(m);
                  }}
                  style={{ color: m.starred ? "var(--accent)" : "var(--ink-faint)", cursor: "pointer", display: "inline-flex" }}
                >
                  <svg width={15} height={15} viewBox="0 0 24 24">
                    <path
                      fill={m.starred ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinejoin="round"
                      d="M12 4l2.5 5 5.5.8-4 3.9.9 5.5L12 16.5 7.1 19.2 8 13.7 4 9.8 9.5 9z"
                    />
                  </svg>
                </span>
                {new Date(m.createdAt).toLocaleDateString()}
              </div>
            </button>
          );
        })}
      </div>

      {open && <ReadModal mail={open} box={box} onClose={() => setOpen(null)} />}
      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSent={() => {
            setShowCompose(false);
            if (box === "sent") load();
          }}
        />
      )}
    </StudentShell>
  );
}

function ReadModal({ mail, box, onClose }: { mail: Mail; box: Box; onClose: () => void }) {
  const other = box === "sent" ? mail.recipient : mail.sender;
  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalStyle, width: "min(560px, 94vw)" }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{mail.subject}</div>
        <div style={{ fontSize: 13, color: "var(--ink-dim)", fontFamily: "var(--font-mono)" }}>
          {box === "sent" ? "To" : "From"}: {other.name ?? other.email} · {new Date(mail.createdAt).toLocaleString()}
        </div>
        <div style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{mail.body}</div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} className="btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ComposeModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to: to.trim(), subject: subject.trim(), body: body.trim() }),
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) {
        setErr(json.error);
        return;
      }
      onSent();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ ...modalStyle, width: "min(560px, 94vw)" }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>New message</div>
        <p style={{ fontSize: 13, color: "var(--ink-dim)", margin: 0 }}>
          You can only message people in your classes.
        </p>
        <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient email" type="email" required style={inputStyle} autoFocus />
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" required maxLength={200} style={inputStyle} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message…" required rows={6} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-sans)" }} />
        {err && <div style={{ color: "var(--danger)", fontSize: 14 }}>{err}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onClose} className="btn">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn primary">
            {submitting ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  padding: 16,
};
const modalStyle: React.CSSProperties = {
  background: "var(--bg-2)",
  border: "1px solid var(--stroke-2)",
  borderRadius: 17,
  padding: 24,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  boxShadow: "0 30px 60px -20px rgba(0,0,0,0.8)",
};
const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 11,
  border: "1px solid var(--stroke-2)",
  background: "var(--bg-2)",
  color: "var(--ink)",
  fontSize: 15,
  outline: "none",
  fontFamily: "var(--font-sans)",
};
