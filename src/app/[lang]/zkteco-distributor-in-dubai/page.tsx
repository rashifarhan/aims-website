import { LocationPage, locationMetadata } from "@/components/locations/LocationPage";
import "@/components/signature/reach.css";
import "@/components/locations/locations.css";

export const generateMetadata = () => locationMetadata("dubai");

/** T7 location page, URL kept from aimsuae.me (CLAUDE.md §6). English URL of the Dubai page (Plan 12 #32); its /ar alias 301s to /ar/zkteco-dubai. */
export default function Page() {
  return <LocationPage market="dubai" />;
}
