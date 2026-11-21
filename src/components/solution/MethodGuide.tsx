import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { countLabel } from "@/i18n/format";
import { ArrowIcon } from "@/components/icons";
import { productsInFamily } from "@/content/catalogue";
import { TA_METHODS } from "@/content/timeAttendance";

/** Line icons on the 32px explainer grid (Design Doc 7). */
const ICONS: Record<(typeof TA_METHODS)[number]["key"], string> = {
  face: "M9 4H6a2 2 0 0 0-2 2v3m19-5h3a2 2 0 0 1 2 2v3M9 28H6a2 2 0 0 1-2-2v-3m19 5h3a2 2 0 0 0 2-2v-3M12 13v1m8-1v1m-6 6c1.5 1.3 3.5 1.3 5 0M16 13v4",
  fingerprint:
    "M10 25c1.5-2.5 2-5.5 2-9a4 4 0 0 1 8 0c0 2 0 4-.5 6M8 8a11 11 0 0 1 19 6c0 3-.3 6-1 8.5M5 14a11 11 0 0 1 1.5-4M16 16c0 4-1 8-3 11m7-6c-.4 2.3-1.1 4.4-2 6.3",
  card: "M4 9a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Zm0 4h24M8 20h6",
  mobile:
    "M10 4h12a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm4 20h4M12 11h3v3h-3Zm5 0h3v3h-3Zm-5 5h3v3h-3Zm5 2h3",
};

/** T3 row 3: "Choose your method" guide; each option opens the filtered listing (Plan 14). */
export async function MethodGuide() {
  const { solutionTimeAttendance: c } = await getDictionary();
  const locale = await getLocale();
  const terminals = productsInFamily("time-attendance");
  return (
    <section className="t3-section page-container" aria-labelledby="ta-methods-title">
      <div className="t3-heading">
        <h2 id="ta-methods-title" className="t3-title">
          {c.methods.heading}
        </h2>
        <p className="t3-lead">{c.methods.lead}</p>
      </div>
      <ul className="method-grid">
        {TA_METHODS.map(({ key, match }) => {
          const count = terminals.filter((p) => p.methods.some((m) => (match as readonly string[]).includes(m))).length;
          const item = c.methods.items[key];
          return (
            <li key={key}>
              <Link
                href={localePath(locale, `/products/time-attendance?verify=${match.join(",")}`)}
                className="method-card"
              >
                <span className="method-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 32 32"
                    width="28"
                    height="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={ICONS[key]} />
                  </svg>
                </span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span className="method-count">
                  <span className="tabular-nums">{countLabel(count, c.methods.countOne, c.methods.count)}</span>
                  <ArrowIcon width="16" height="16" className="home-action-arrow" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
