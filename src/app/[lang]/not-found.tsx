import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";

export default async function NotFound() {
  const t = await getDictionary();
  const locale = await getLocale();
  return (
    <main id="main" className="mx-auto w-full max-w-(--container-page) flex-1 px-4 py-24 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{t.notFound.title}</h1>
      <p className="mt-3 max-w-lg text-ink-600">{t.notFound.body}</p>
      <Link
        href={localePath(locale, "/products")}
        className="mt-8 inline-flex h-11 items-center rounded-pill bg-green-700 px-5 font-medium text-white transition-colors duration-(--duration-base) hover:bg-green-800"
      >
        {t.notFound.cta}
      </Link>
    </main>
  );
}
