"use client";

import type { Ref } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";
import type { QuoteContext } from "@/lib/quote/context";
import type { Contact, FieldError, FieldId } from "@/lib/quote/request";
import type { QuoteLine } from "@/lib/quote/store";
import { DetailsPanel } from "./DetailsPanel";
import { ErrorSummary } from "./ErrorSummary";
import { Panel } from "./fields";
import { NeedPanel } from "./NeedPanel";
import { QuoteItems, type CatalogEntry } from "./QuoteItems";

const FIELD_TARGET: Record<FieldId, string> = {
  items: "quote-items",
  need: "need",
  emirate: "quote-emirate",
  country: "quote-country",
  name: "quote-name",
  phone: "quote-phone",
  email: "quote-email",
};

type Props = {
  lines: QuoteLine[];
  context: QuoteContext;
  contact: Contact;
  onContact: (patch: Partial<Contact>) => void;
  errors: FieldError[];
  summaryRef: Ref<HTMLDivElement>;
  catalog: Record<string, CatalogEntry>;
  t: Dictionary["quote"];
  stepper: { qty: string; decrease: string; increase: string };
  hrefs: { products: string; productBase: string };
};

/** The three numbered panels under the error summary (Design Doc 10, T8: Items · need · details). */
export function QuotePanels({
  lines,
  context,
  contact,
  onContact,
  errors,
  summaryRef,
  catalog,
  t,
  stepper,
  hrefs,
}: Props) {
  const errorText = (field: FieldId) => {
    const e = errors.find((x) => x.field === field);
    return e ? t.errors[e.code] : undefined;
  };
  // An installation or export enquiry with nothing listed yet leads with "Describe your site" (T7).
  const preset = !lines.length && (context.need === "install" || context.need === "export") ? context.need : undefined;
  return (
    <div className="space-y-4">
      {errors.length > 0 && (
        <ErrorSummary
          ref={summaryRef}
          heading={errors.length === 1 ? t.errorsOne : fmt(t.errorsHeading, { count: errors.length })}
          errors={errors.map((e) => ({ fieldId: FIELD_TARGET[e.field], message: t.errors[e.code] }))}
        />
      )}
      <Panel n={1} id="panel-items" title={`${t.itemsHeading} · ${lines.length}`}>
        <QuoteItems
          lines={lines}
          catalog={catalog}
          t={t}
          stepper={stepper}
          productHref={(s) => `${hrefs.productBase}/${s}`}
          productsHref={hrefs.products}
          error={errorText("items")}
          preset={preset}
        />
      </Panel>
      <Panel n={2} id="panel-need" title={t.needHeading}>
        <NeedPanel
          context={context}
          t={t}
          errors={{ need: errorText("need"), emirate: errorText("emirate"), country: errorText("country") }}
        />
      </Panel>
      <Panel n={3} id="panel-details" title={t.detailsHeading}>
        <DetailsPanel
          contact={contact}
          onChange={onContact}
          t={t}
          errors={{ name: errorText("name"), phone: errorText("phone"), email: errorText("email") }}
        />
      </Panel>
    </div>
  );
}
