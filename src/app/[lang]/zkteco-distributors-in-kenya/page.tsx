import { LocationPage, locationMetadata } from "@/components/locations/LocationPage";

export const generateMetadata = () => locationMetadata("kenya");

export default function Page() {
  return <LocationPage market="kenya" />;
}
