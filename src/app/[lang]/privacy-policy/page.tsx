import { LegalPage, legalMetadata } from "@/components/editorial/legal";

export const generateMetadata = () => legalMetadata("privacy", "/privacy-policy");

/** T10 legal, Master Plan 12 #11. URL unchanged from aimsuae.me. */
export default function PrivacyPolicy() {
  return <LegalPage keyName="privacy" path="/privacy-policy" />;
}
