import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

type Props = {
  id: string;
  heading: string;
  body: string;
  action: { href: string; label: string };
  secondary: { href: string; label: string };
};

/** The closing band (ui/sections.css .t3-cta): one action and one link (Design Doc 2, principle 1). */
export function CompanyClose({ id, heading, body, action, secondary }: Props) {
  return (
    <section className="t3-cta page-container" aria-labelledby={id}>
      <div className="t3-cta-panel">
        <div>
          <h2 id={id} className="t3-title">
            {heading}
          </h2>
          <p className="t3-lead">{body}</p>
        </div>
        <div className="t3-cta-actions">
          <Link href={action.href} className="home-button">
            {action.label}
            <ArrowIcon width="18" height="18" className="home-action-arrow" />
          </Link>
          <Link href={secondary.href} className="home-text-link">
            {secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
