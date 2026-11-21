import { getDictionary } from "@/i18n/dictionaries";
import { FAMILIES } from "@/content/taxonomy";
import { productCount } from "@/content/catalogue";

/**
 * Setup placeholder. Replaced by the T1 Home template (hero signal lines,
 * three routes, families, proof bar, showrooms) in the build phase.
 */
export default async function Home() {
  const t = await getDictionary();
  return (
    <main id="main" className="mx-auto w-full max-w-(--container-page) flex-1 px-4 py-16 sm:px-6">
      <p className="text-sm font-medium tracking-wide text-green-700">{t.common.partner}</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        AIMS<span className="text-lime">.</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-ink-600">
        Project setup is in place. {productCount()} products imported across {FAMILIES.length} families.
      </p>
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FAMILIES.map((f) => (
          <li key={f.slug} className="rounded-lg border border-line p-5">
            <p className="font-semibold text-ink">{f.name}</p>
            <p className="mt-1 text-sm text-ink-600">{f.summary}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
