# Bug Report — Full-Site Test Pass (2026-06-26)

End-to-end test of the whole platform (auth, student, teacher, and admin
surfaces) against a freshly-restarted local dev server + seeded DB, validating
real flows through the live API and reviewing page/component code. Every bug
below was fixed, pushed to `main`, auto-deployed via CI, and verified live on
`thadar.com` / `admin.thadar.com`.

Full new-user journey confirmed working end to end:
**register → admin approve → login → join class → submit assignment →
teacher grades → student sees grade.**

---

## Bugs found & fixed

### 1. 🔴 Critical — new sign-ups could not be approved from the moderation queue
- **Symptom:** Approving (or rejecting) a new account in the admin moderation
  queue returned `{"success":false,"error":"Unknown queue item type"}`.
- **Impact:** New users register into `PENDING` status and cannot log in until
  an admin approves them. The queue *listed* pending sign-ups (`account:<id>`
  items) but `resolveQueueItem()` had no `case "account"`, so the approve/reject
  action always failed — **every new sign-up was permanently locked out** via the
  queue path. This breaks the core "usable by anyone" onboarding.
- **Fix:** Added the `account` case to `resolveQueueItem` —
  approve → `ACTIVE`, reject → `SUSPENDED` (reuses `setUserStatus`, which
  audit-logs).
- **Files:** `server/admin/mutations.ts` (originally `server/admin.ts`)
- **Commits:** `1c720e6`, then re-applied as `0ea22d1` (see note below)
- **Note — regression caught mid-session:** A *parallel Claude session's*
  refactor (`67fb488`, "split server/admin.ts into focused modules") branched
  from **before** this fix and silently reverted it — the `account` case was
  dropped when the file moved to `server/admin/mutations.ts`, reintroducing the
  bug on prod. It was caught by re-grepping `HEAD`, then re-applied (`0ea22d1`).

### 2. Logged-out `/grades` and `/assignments` hung on an infinite "Loading…"
- **Symptom:** Visiting `/grades` or `/assignments` while logged out returned
  HTTP 200 with a permanent "Loading…" state instead of redirecting to login.
- **Impact:** These two student pages were missing from the route gate's
  `PROTECTED_PREFIXES`. Their data fetch 401s and the loading state never
  resolves, so a logged-out visitor (bookmark, shared link) is stuck on a dead
  page — while every *other* student page (`/home`, `/classes`, `/inbox`,
  `/profile`) correctly redirects to `/login`.
- **Fix:** Added `/grades` and `/assignments` to `PROTECTED_PREFIXES`; they now
  307-redirect to `/login?callbackUrl=…` like the rest.
- **Files:** `auth.config.ts`
- **Commit:** `45e5d48`

### 3. Landing-page header broke in light mode
- **Symptom:** For any visitor whose OS prefers light mode, the marketing
  landing page rendered a dark translucent header bar with near-invisible
  dark-on-dark brand text and links.
- **Impact:** The sticky header hardcoded `background: rgba(14,14,16,0.82)`
  (dark) while its text used `var(--ink)` (which becomes near-black in light
  mode). `theme-init` honours `prefers-color-scheme`, so light-mode users got a
  broken header on the first page they see.
- **Fix:** Introduced a theme-aware `--header-bg` token (dark + light variants)
  and referenced it instead of the hardcoded value.
- **Files:** `app/globals.css`, `app/page.tsx`
- **Commit:** `18313cd`

### 4. "Forgot password?" was a dead link
- **Symptom:** The login page's "Forgot password?" was an `<a href="#">` that did
  nothing (no password-reset backend exists).
- **Impact:** Users who forget their password had no recovery path and the link
  appeared broken.
- **Fix:** Converted it to a working disclosure — a button that reveals recovery
  guidance (accounts are admin/teacher-managed) pointing to the support email
  used elsewhere (`liam@irrssue.com`).
- **Files:** `app/login/page.tsx`
- **Commit:** `710072c`

### 5. Unbranded default 404 page (polish)
- **Symptom:** A mistyped or stale URL hit Next.js's bare, unbranded default 404.
- **Impact:** Visible rough edge on an otherwise polished product; no path back
  into the app.
- **Fix:** Added a branded, themed `not-found` page (Thadar mark, clear message,
  "Back home" / "Sign in" actions; inherits theme tokens from the root layout).
- **Files:** `app/not-found.tsx` (new)
- **Commit:** `304b58a`

---

## Verified working — no fix needed

- **Authorization:** non-admins get 403 on `/api/admin/*` and are redirected
  from the admin panel to `/admin/login`; bogus/cross-account class IDs return a
  clean `{success:false,"Not found"}`.
- **Registration flow:** success → `PENDING`; pending/suspended login blocked
  with the right message; duplicate email → 409; weak password → 400.
- **Empty states:** brand-new student and teacher accounts (zero data) render
  clean CTAs ("Join a class", "No classes yet", "All caught up") with **no NaN /
  undefined / Invalid Date** — gauge/GPA math is guarded against zero data.
- **Join flow:** valid code → pending request; invalid code and duplicate join
  both return graceful errors.
- **Invite codes:** generate / copy / enable / disable all work from class
  settings (new classes intentionally start with no code).
- **Other:** view-switcher (student↔teacher persistence), sign-out (all
  surfaces), messaging (classmate-gated compose), admin settings persistence,
  admin class archive/restore, legal page (both tabs), nav links (no dead
  routes), full build + typecheck clean.

---

## Caveats / not covered

- **No pixel-level visual testing** — no headless browser is installed and adding
  one was out of scope. Validation was HTML/HTTP behavior, responsive CSS
  breakpoints, and component logic; no rendered screenshots.
- **Pre-existing lint warnings** (`react-hooks/set-state-in-effect`,
  `react/no-unescaped-entities`, `react-hooks/static-components`) are stylistic,
  don't fail the build, and were intentionally left as-is.
- **Deferred features** (video upload, quizzes) remain intentionally unbuilt —
  they need MinIO / schema migrations, not bug fixes.

---

## Commit summary

| Commit    | Type  | Description |
|-----------|-------|-------------|
| `45e5d48` | fix   | protect `/grades` and `/assignments` from logged-out access |
| `18313cd` | fix   | theme-aware marketing header background (`--header-bg`) |
| `1c720e6` | fix   | handle account approvals in moderation queue resolver |
| `0ea22d1` | fix   | re-add account approval case after parallel refactor dropped it |
| `710072c` | fix   | make "Forgot password?" a working affordance |
| `304b58a` | feat  | branded 404 not-found page |
