import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { Magnetic } from "@/components/ui/Magnetic";

/**
 * The inner hero's primary with the home hero's lean toward the pointer (premium pass, client decision 7). PageHero
 * renders a plain link, so the locations pages hand it this ready element instead.
 */
export function HeroPrimary({ href, label }: { href: string; label: string }) {
  return (
    <Magnetic>
      <Link href={href} className="home-button">
        {label}
        <ArrowIcon width="18" height="18" className="home-action-arrow" />
      </Link>
    </Magnetic>
  );
}
