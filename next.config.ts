import type { NextConfig } from "next";

// The control panel lives at admin.thadar.com but is implemented under the
// /admin route tree (so it also works locally at /admin). This host rewrite
// serves the panel at the root of the admin host: admin.thadar.com/ → /admin,
// admin.thadar.com/users → /admin/users, etc.
//
// The source excludes paths that already start with /admin (the in-app links
// use absolute /admin/* hrefs, so they must pass through un-prefixed), plus
// /api, /_next and /favicon. The `has` host condition scopes the rule to the
// admin host only — the main thadar.com app and localhost are untouched.
const ADMIN_HOST = process.env.ADMIN_HOST ?? "admin.thadar.com";

// The read-only parent portal mirrors the admin pattern: it's implemented under
// the /parent route tree (so it also works locally at /parent) and served at the
// root of the parent host — parents.thadar.com/ → /parent, /grades → /parent/grades.
// Same exclusions as admin (the in-app links use absolute /parent/* hrefs).
const PARENT_HOST = process.env.PARENT_HOST ?? "parents.thadar.com";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:path((?!admin|api|_next|favicon).*)",
          has: [{ type: "host", value: ADMIN_HOST }],
          destination: "/admin/:path",
        },
        {
          source: "/:path((?!parent|api|_next|favicon).*)",
          has: [{ type: "host", value: PARENT_HOST }],
          destination: "/parent/:path",
        },
      ],
    };
  },
};

export default nextConfig;
