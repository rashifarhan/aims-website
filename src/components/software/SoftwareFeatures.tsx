import { Overview } from "@/components/product/Overview";
import { fmt } from "@/i18n/format";
import { listAfter, splitFeature, type BuiltSoftware } from "@/lib/software";
import { loadSoftwarePage } from "./softwareCopy";

/** Six cards fill two rows of three; AIMS's longer lists stay whole in the full description below. */
const MAX_FEATURES = 6;

/**
 * T6 detail, "what it does" and requirements (Plan 12 #29). Every item is AIMS's own text
 * (content/software.json, English as published); a platform with no published capacity list shows
 * none rather than an invented one (CLAUDE.md §1). The full description stays one click away for
 * readers and search, in a native disclosure.
 */
export async function SoftwareFeatures({ slug }: { slug: BuiltSoftware }) {
  const { software, c } = await loadSoftwarePage(slug);
  const features = listAfter(software, /key features/i)
    .slice(0, MAX_FEATURES)
    .map(splitFeature);
  const system = listAfter(software, /capabilit|requirement/i);
  return (
    <section className="sw-section sw-screen page-container" aria-labelledby="sw-features-title">
      <div className="t3-heading">
        <h2 id="sw-features-title" className="t3-title">
          {fmt(c.features.heading, { name: software.name })}
        </h2>
        <p className="t3-lead">{c.features.lead}</p>
      </div>
      <div className={system.length ? "sw-features sw-features-split" : "sw-features"}>
        <ul className="sw-feature-grid" lang="en">
          {features.map((f) => (
            <li key={f.title} className="sw-feature">
              <h3>{f.title}</h3>
              {f.body && <p>{f.body}</p>}
            </li>
          ))}
        </ul>
        {system.length > 0 && (
          <div className="sw-system">
            <h3>{c.features.system}</h3>
            <ul lang="en">
              {system.map((item) => (
                <li key={item} className="tabular-nums">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <details className="sw-full">
        <summary>{c.features.full}</summary>
        <Overview blocks={software.overview} lang="en" />
      </details>
    </section>
  );
}
