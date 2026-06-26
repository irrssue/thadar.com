import "server-only";

/**
 * server/admin — the platform-admin data + control layer, split by concern.
 *
 * This barrel preserves the original `@/server/admin` import surface: every
 * function that routes and the panel layout consume is re-exported here, so
 * callers are unaffected by the internal module layout.
 *
 *   shared      time/format helpers, role classifiers, fetchUsers (private)
 *   overview    getOverview
 *   queue       getQueue (read)
 *   directory   listUsers, listClasses
 *   system      getSystem
 *   audit       listAudit
 *   profile     getAdminProfile
 *   settings    SETTING_DEFAULTS, getSettings, updateSetting
 *   mutations   setUserStatus … resolveMembership, resolveQueueItem
 */

export { getOverview } from "./overview";
export { getQueue } from "./queue";
export { listUsers, listClasses } from "./directory";
export { getSystem } from "./system";
export { listAudit } from "./audit";
export { getAdminProfile } from "./profile";
export { SETTING_DEFAULTS, getSettings, updateSetting } from "./settings";
export {
  setUserStatus,
  setTeacherStatus,
  setPlatformRole,
  deleteUser,
  setClassArchived,
  deleteClass,
  resolveMessage,
  setClassDiscovery,
  resolveMembership,
  resolveQueueItem,
} from "./mutations";
