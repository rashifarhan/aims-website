import type { Dictionary } from "@/i18n/dictionaries";
import type { MessageLabels } from "./message";

/** Message labels from the dictionary, so the message follows the page language. */
export const messageLabels = (q: Dictionary["quote"]): MessageLabels => ({
  ...q.message,
  needs: q.needs,
  timings: q.timings,
  buyers: q.buyers,
  emirates: q.emirates,
  siteTypes: q.siteTypes,
  replyChannels: q.replyChannels,
});
