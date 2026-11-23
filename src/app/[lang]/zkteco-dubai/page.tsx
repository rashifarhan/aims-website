import { LocationPage, locationMetadata } from "@/components/locations/LocationPage";
import "@/components/home/sections.css";
import "@/components/solution/solution.css";
import "@/components/signature/reach.css";
import "@/components/locations/locations.css";

export const generateMetadata = () => locationMetadata("dubai");

/** T7 location page, URL kept from aimsuae.me (CLAUDE.md §6). Arabic URL of the Dubai page (Plan 12 #35); /zkteco-dubai 301s to the English one. */
export default function Page() {
  return <LocationPage market="dubai" />;
}
