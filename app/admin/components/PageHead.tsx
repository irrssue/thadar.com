"use client";

import Link from "next/link";
import AdminIcon from "./AdminIcon";

// Detail-page header: a back-to-overview link, the title (with accent word),
// optional subtitle and an optional primary action. Mirrors the prototype's
// PageHead, but the back affordance is a real route Link.
export default function PageHead({
  title,
  accent,
  sub,
  action,
}: {
  title: string;
  accent?: string;
  sub?: string;
  action?: string;
}) {
  return (
    <>
      <Link className="back" href="/admin" style={{ textDecoration: "none" }}>
        <AdminIcon name="back" size={15} /> Overview
      </Link>
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
        {action && (
          <button className="btn primary" type="button">
            <AdminIcon name="plus" size={15} /> {action}
          </button>
        )}
      </div>
      <div style={{ height: 26 }} />
    </>
  );
}
