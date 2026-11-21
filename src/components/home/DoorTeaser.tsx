import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { DoorIllustration } from "./DoorIllustration";

export async function DoorTeaser() {
  const {
    home: { door },
  } = await getDictionary();
  const locale = await getLocale();
  return (
    <section className="home-section home-door page-container" aria-labelledby="door-title">
      <div>
        <h2 id="door-title" className="home-section-title">
          {door.heading}
        </h2>
        <p className="home-section-lead">{door.body}</p>
        <Link href={localePath(locale, "/products/access-control")} className="home-text-link">
          {door.action}
        </Link>
      </div>
      <DoorIllustration labels={door} />
    </section>
  );
}
