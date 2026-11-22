import { LegalPage, legalMetadata } from "@/components/editorial/legal";

export const generateMetadata = () => legalMetadata("terms", "/terms-and-conditions");

/** T10 legal, Master Plan 12 #12. URL unchanged from aimsuae.me. */
export default function TermsAndConditions() {
  return <LegalPage keyName="terms" path="/terms-and-conditions" />;
}
