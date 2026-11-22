import type { Metadata } from "next";
import { ContactLink } from "@/components/contact/ContactLink";
import { EditorialBlocks } from "@/components/editorial/EditorialBlocks";
import { EditorialPage } from "@/components/editorial/EditorialPage";
import { ChevronDownIcon } from "@/components/icons";
import { pageContent } from "@/content/pages";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { groupQuestions } from "@/lib/editorial";
import { alternates } from "@/lib/seo";
import { CONTACT, whatsappUrl } from "@/lib/site";
import "@/components/editorial/editorial.css";
import "@/components/solution/solution.css";

export async function generateMetadata(): Promise<Metadata> {
  const { support: c } = await getDictionary();
  return { title: c.metaTitle, description: c.metaDescription, alternates: alternates(await getLocale(), "/support") };
}

/**
 * T10 support (Master Plan 12 #10; Design Doc 10.1): the ZKTeco warranty policy and AIMS's FAQ as
 * published, then the channels. `/zkteco-warranty-policy` and `/faq` redirect to #warranty and #faq.
 */
export default async function Support() {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.support;
  const lang = locale === "en" ? undefined : "en";
  const questions = groupQuestions(pageContent("faq").blocks);
  return (
    <EditorialPage
      crumbs={[
        { href: localePath(locale, "/"), label: t.common.home },
        { href: localePath(locale, "/support"), label: c.title },
      ]}
      title={c.title}
      lead={c.lead}
    >
      <section className="ed-section" id="warranty" aria-labelledby="warranty-title">
        <h2 id="warranty-title">{c.warrantyHeading}</h2>
        <EditorialBlocks blocks={pageContent("warranty").blocks} lang={lang} level={3} />
      </section>
      <section className="ed-section" id="faq" aria-labelledby="faq-title">
        <h2 id="faq-title">{c.faqHeading}</h2>
        <div className="t3-questions ed-faq" lang={lang}>
          <div>
            {questions.map((q) => (
              <details key={q.question}>
                <summary>
                  {q.question}
                  <ChevronDownIcon />
                </summary>
                <EditorialBlocks blocks={q.answer} />
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="ed-section" aria-labelledby="support-contact-title">
        <h2 id="support-contact-title">{c.contactHeading}</h2>
        <p className="t3-lead">{c.contactBody}</p>
        <div className="ed-actions">
          <ContactLink kind="whatsapp" href={whatsappUrl()} target={CONTACT.whatsapp} className="home-button">
            {c.whatsapp}
          </ContactLink>
          <ContactLink
            kind="phone"
            href={`tel:${CONTACT.lines.headOffice.tel}`}
            target={CONTACT.lines.headOffice.display}
            className="home-secondary"
          >
            {c.call}
          </ContactLink>
        </div>
      </section>
    </EditorialPage>
  );
}
