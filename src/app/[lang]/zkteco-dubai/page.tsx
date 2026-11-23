import { LocationPage, locationMetadata } from "@/components/locations/LocationPage";

export const generateMetadata = () => locationMetadata("dubai");

export default function Page() {
  return <LocationPage market="dubai" />;
}
