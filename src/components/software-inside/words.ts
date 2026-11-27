import type { FamilySlug } from "@/content/taxonomy";
import type { BuiltSoftware } from "@/lib/software";

/**
 * A software page's giant word and the family ground its stage glows with (direction 2). The words come from the
 * platforms' own names (BioTime, BioTime Cloud, ZKBio CVSecurity, ZKBio CVAccess), Latin and left to right on every
 * locale like the family words.
 */
export const SOFTWARE_STAGE: Record<BuiltSoftware, { word: string; ground: FamilySlug }> = {
  "biotime-9-5": { word: "BIOTIME", ground: "time-attendance" },
  biotimecloud: { word: "CLOUD", ground: "time-attendance" },
  "zkbio-cvsecurity": { word: "CVSECURITY", ground: "access-control" },
  "zkbio-cvaccess": { word: "CVACCESS", ground: "access-control" },
};
