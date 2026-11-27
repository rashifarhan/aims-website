import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { softwareBySlug, softwareList } from "@/content/catalogue";
import { StagePill } from "@/components/inside/StagePill";

/**
 * Software (direction 2, paper): the four packages AIMS leads with, listed on a terminal's screen, each opening its
 * software page. Names from the catalogue, purposes from AIMS's own copy; the count is the software centre's.
 */
export async function InsideSoftware() {
  const t = await getDictionary();
  const locale = await getLocale();
  const s = t.home.software;
  const rows = [
    { slug: "biotime-9-5", purpose: s.purposeAttendance, runs: s.runsAttendance },
    { slug: "biotimecloud", purpose: s.purposeCloud, runs: s.runsCloud },
    { slug: "zkbio-cvsecurity", purpose: s.purposeCvsecurity, runs: s.runsBrowser },
    { slug: "zkbio-cvaccess", purpose: s.purposeCvaccess, runs: s.runsBrowser },
  ].flatMap((row) => {
    const item = softwareBySlug(row.slug);
    return item ? [{ ...row, name: item.name }] : [];
  });
  return (
    <section id="software" className="in-paper in-section hs" aria-labelledby="software-title">
      <div className="hs-grid">
        <div data-reveal>
          <p className="in-eyebrow">{t.nav.software}</p>
          <h2 id="software-title" className="in-h2">
            {s.heading}
          </h2>
          <p className="in-lead">{s.lead}</p>
          <p className="hs-action">
            <StagePill href={localePath(locale, "/software")}>{s.centre}</StagePill>
          </p>
        </div>
        <div className="hs-bezel" data-reveal>
          <div className="hs-screen">
            <p className="hs-bar in-mono" aria-hidden="true">
              <span>{t.home.inside.softwareBar}</span>
              <span>{fmt(t.home.inside.softwareShown, { shown: rows.length, count: softwareList().length })}</span>
            </p>
            <ol className="hs-list">
              {rows.map((row, index) => (
                <li key={row.slug}>
                  <Link href={localePath(locale, `/software/${row.slug}`)} className="hs-row">
                    <span className="hs-index in-mono" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="hs-name">
                      <h3>
                        <bdi dir="ltr">{row.name}</bdi>
                      </h3>
                      <span>{row.purpose}</span>
                    </span>
                    <span className="hs-runs in-mono">{row.runs}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
