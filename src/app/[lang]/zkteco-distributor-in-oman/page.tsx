import { LocationPage, locationMetadata } from "@/components/locations/LocationPage";

export const generateMetadata = () => locationMetadata("oman");

export default function Page() {
  return <LocationPage market="oman" />;
}
