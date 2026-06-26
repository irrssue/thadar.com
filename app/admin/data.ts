// data.ts — re-exports the admin control panel's shared types + presentation
// helpers from ./types.
//
// The static representative dataset that used to live here has been removed:
// every admin view now renders live data fetched from /api/admin/* (see
// ./useAdmin and server/admin/*). Types and colour/role helpers stay shared
// between the server data layer and the client pages.

export * from "./types";
