import { LocationPage, locationMetadata } from "@/components/locations/LocationPage";
import "@/components/home/sections.css";
import "@/components/solution/solution.css";
import "@/components/signature/reach.css";
import "@/components/locations/locations.css";

export const generateMetadata = () => locationMetadata("oman");

/** T7 location page, URL kept from aimsuae.me (CLAUDE.md §6). */
export default function Page() {
  return <LocationPage market="oman" />;
}
