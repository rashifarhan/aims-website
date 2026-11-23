import { ChevronDownIcon } from "@/components/icons";
import { Overview } from "@/components/product/Overview";
import { englishData } from "@/components/product/englishData";
import { getLocale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import { listAfter, splitFeature, type BuiltSoftware } from "@/lib/software";
import { loadSoftwarePage } from "./softwareCopy";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Section } from "@/components/ui/Section";

/** Six items fill three ruled rows of two; AIMS's longer lists stay whole in the full description below. */
const MAX_FEATURES = 6;

/**
 * T6 detail, "what it does" and requirements (Plan 12 #29). Every item is AIMS's own text
 * (content/software.json, English as published); a platform with no published capacity list shows
 * none rather than an invented one (CLAUDE.md §1). The full description stays one click away for
 * readers and search, in a native disclosure. Features are a ruled list, not a wall of same-size
 * cards (impeccable craft floor); the one card is the capacity box beside them (actions.css .ui-card).
 * The copy is English, so on Arabic pages it is marked lang="en" dir="ltr" (Design Doc 13).
 */
export async function SoftwareFeatures({ slug }: { slug: BuiltSoftware }) {
  const { software, c } = await loadSoftwarePage(slug);
  const features = listAfter(software, /key features/i)
    .slice(0, MAX_FEATURES)
    .map(splitFeature);
  const system = listAfter(software, /capabilit|requirement/i);
  const data = englishData(await getLocale());
  return (
    <Section labelledBy="sw-features-title" className="sw-screen">
      <SectionHeader
        id="sw-features-title"
        title={fmt(c.features.heading, { name: software.name })}
        lead={c.features.lead}
      />
      <div className={system.length ? "sw-features sw-features-split" : "sw-features"}>
        <ul className="sw-feature-list" {...data}>
          {features.map((f) => (
            <li key={f.title} className="sw-feature">
              <h3>{f.title}</h3>
              {f.body && <p>{f.body}</p>}
            </li>
          ))}
        </ul>
        {system.length > 0 && (
          <div className="sw-system ui-panel">
            <h3>{c.features.system}</h3>
            <ul {...data}>
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
        <summary>
          {c.features.full}
          <ChevronDownIcon aria-hidden="true" />
        </summary>
        <Overview blocks={software.overview} data={data} />
      </details>
    </Section>
  );
}
