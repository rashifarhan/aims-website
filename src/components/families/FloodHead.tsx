import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

/**
 * A section's opening (Design rules → Layout): a kicker naming the menu it previews, the h2 (marked for the shared
 * title reveal) and an optional lead on the start side; one text link on the end side.
 */
export function FloodHead({
  id,
  kicker,
  title,
  lead,
  link,
}: {
  id: string;
  kicker: string;
  title: string;
  lead?: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flood-head">
      <div>
        <p className="flood-kicker">{kicker}</p>
        <h2 id={id} className="flood-title" data-heading-reveal>
          {title}
        </h2>
        {lead && <p className="flood-lead">{lead}</p>}
      </div>
      {link && (
        <Link href={link.href} className="flood-link">
          {link.label}
          <ArrowIcon width="16" height="16" className="rtl:-scale-x-100" />
        </Link>
      )}
    </div>
  );
}
