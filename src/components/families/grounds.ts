import type { FamilySlug } from "@/content/taxonomy";

/** Each family's ground token (CLAUDE.md → Design rules → Palette), wherever the family appears. */
export const FAMILY_GROUND: Record<FamilySlug, string> = {
  "access-control": "var(--color-ground-access)",
  "time-attendance": "var(--color-ground-time)",
  "entrance-control": "var(--color-ground-entry)",
  "door-locks": "var(--color-ground-locks)",
  "door-hardware": "var(--color-ground-parts)",
  pos: "var(--color-ground-pos)",
};
