import "server-only";
import { prisma } from "@/server/db";
import { writeAudit } from "@/server/events";
import type { SettingsData, SettingValue } from "@/app/admin/types";

/* ----------------------------- settings ----------------------------- */

export const SETTING_DEFAULTS: SettingsData = {
  "security.enforce2fa": true,
  "security.adminDomainLock": true,
  "security.sessionTimeout": "30 min",
  "security.selfRegistration": true,
  "moderation.autoFilter": true,
  "moderation.requireTeacherVerification": true,
  "moderation.profanityBlock": false,
  "moderation.dataRetention": "24 months",
  "branding.platformName": "thadar.",
  "branding.supportEmail": "help@thadar.edu",
  "maintenance.nightlyBackups": true,
  "maintenance.maintenanceMode": false,
  "maintenance.releaseChannel": "stable",
};

export async function getSettings(): Promise<SettingsData> {
  const rows = await prisma.platformSetting.findMany({ select: { key: true, value: true } });
  const stored: SettingsData = {};
  for (const r of rows) {
    try {
      stored[r.key] = JSON.parse(r.value) as SettingValue;
    } catch {
      stored[r.key] = r.value;
    }
  }
  return { ...SETTING_DEFAULTS, ...stored };
}

export async function updateSetting(actorId: string, key: string, value: SettingValue): Promise<SettingsData> {
  if (!(key in SETTING_DEFAULTS)) throw new Error("Unknown setting");
  const json = JSON.stringify(value);
  await prisma.platformSetting.upsert({
    where: { key },
    update: { value: json, updatedBy: actorId },
    create: { key, value: json, updatedBy: actorId },
  });
  await writeAudit({ actorId, action: "setting.update", target: key, metadata: { value } });
  return getSettings();
}
