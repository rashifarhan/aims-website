# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Trade buyers lead; UAE end users come second (confirmed 21 Nov 2026).

1. **Installers and IT resellers** (trade) in Dubai, Sharjah and Abu Dhabi, doing roughly 5–50 doors a month. They
   search by model code (F18, SpeedFace-V5L, inBio), need specs, datasheets, compatible accessories and software
   versions fast, and send mixed multi-item quotes. Their objections: "Is it genuine? Is it in stock? What's my
   price?"
2. **UAE office and HR managers** (end users, 40–500 staff, one or more branches) who need accurate attendance that
   feeds payroll, without buddy punching, across branches. Low hardware knowledge; they ask which device, whether it
   works with their software, and who installs and trains. Objections: reliability and hidden costs.

Also served, reusing those journeys: facilities and security managers (turnstiles, barriers, locks, site surveys),
export resellers in the GCC and Africa (mixed-model quotes with a destination, documents, warranty), restaurant and
retail owners (POS hardware and setup), and hotel and property operators (hotel locks for N rooms). Persona detail:
`docs/master-plan-v2.0.pdf` ch. 6.

## Product Purpose

A redesign of aimsuae.me for AIMS Security Systems Trading LLC, built as a hiring-assignment proposal: a working
Next.js preview judged against the competitor NUZON (nuzon.me). It turns visits into structured quote requests (model,
quantity, need, location attached) and makes AIMS's real advantages visible. Success: measurably faster, more
accessible and cleaner for search than both aimsuae.me and NUZON (Master Plan ch. 18, AT-01…AT-14), and a reviewer
can find, compare and quote a product in seconds.

The preview never contacts AIMS sales: submissions use a demo adapter labelled "Demo: nothing was sent to AIMS",
contact links open a preview notice, and every deployment is `noindex`.

## Positioning

The ZKTeco specialist you can visit, verify and order from with confidence. AIMS has what NUZON lacks: an Authorized
ZKTeco Distributor status, years of trading, a head office, a Deira showroom and an Abu Dhabi office, full
specification tables and datasheets, software download pages and an existing Arabic page. NUZON has better digital
execution; this build gives AIMS's substance better execution than NUZON's.

## Operating Context

- Three customer routes: buy for projects and stock (trade), supply and installation in the UAE, delivery to the GCC
  and Africa. Software download and setup is a shortcut into the first two.
- Quotation-based: no public prices, no cart. Ordering happens by quote request or WhatsApp; WhatsApp is a primary
  channel.
- Buyers arrive by model-code search and compare specifications; consultants validate against datasheets.
- Markets: Dubai and the Northern Emirates and Abu Dhabi first, then Oman, Bahrain and Kuwait, then Kenya, Tanzania,
  Cameroon, Nigeria and Uganda.
- English first, Arabic under `/ar` with right-to-left layout.

## Capabilities and Constraints

- **Catalogue:** 159 unique products (imported from 162 with duplicates merged) in six families: time attendance,
  access control, entrance and parking, smart and hotel locks, door hardware, POS. Brands: ZKTeco and Alpha. Eight
  software platforms (BioTime 8.5, 9.5, Cloud and mobile app; ZKAccess 3.5; ZKBio Security, CVAccess, CVSecurity).
- **Built:** homepage, products and six family listings, compare, all product pages, quote list (T8), solutions hub,
  time attendance solution page. Route registry and status: `src/lib/routes.ts` (39 designed routes).
- **Signature features:** the multi-item quote list with need, quantities and destination; search with spec filters
  and compare; the Software Download Centre (planned).
- **Stack:** Next.js 16 App Router with Cache Components, React 19, TypeScript strict, Tailwind v4 tokens, Zod,
  MiniSearch, Playwright + axe. pnpm 10, Node 22.
- **Hard constraints:** WCAG 2.2 AA with zero axe violations; throttled mobile LCP ≤ 2.5 s, CLS ≤ 0.05, homepage
  transfer ≤ 1 MB; existing product, software and location URLs never change; 301s for anything moved; no third-party
  runtime requests or trackers in the preview.
- **Undecided or not built:** software pages, location pages, contact, about, support, services, other solution
  pages, blog; real CRM or email submission; trade accounts and price lists (out of scope).

## Brand Commitments

- AIMS is the brand; ZKTeco is the partner. ZKTeco logos appear only where they identify a product.
- **Authorized ZKTeco Distributor: confirmed by AIMS on 21 Nov 2026,** so the site may state it (the code flag
  `ZKTECO_AUTHORIZATION_CONFIRMED` in `src/lib/site.ts` still needs switching on).
- No logo file has been supplied; an interim typeset wordmark ("AIMS." with a lime full stop) stands in.
- Voice: clear, factual, confident, B2B. Short sentences that lead with what the customer gets. No superlatives
  unless AIMS can evidence them. British spelling.
- NUZON is a benchmark only: never use its brand, copy, layout trade dress or imagery.

## Evidence on Hand

- **Product data:** names, model codes, spec tables, summaries, overviews and 1000×1000 white-background product
  photographs for every product (`content/products.json`, `public/images/`); datasheet links where AIMS publishes
  them.
- **Software:** names, summaries and AIMS's software pages (`content/software.json`).
- **Contacts:** head office +971 4 252 3253, Deira showroom +971 4 880 8445 (Showroom #14, Naif Bazar Building,
  Deira, Dubai, with a map link), Abu Dhabi office +971 2 546 6047, mobile and WhatsApp +971 56 524 0495,
  info@aimsuae.me (`src/lib/site.ts`).
- **Company figures, confirmed by AIMS on 21 Nov 2026 as published:** 11+ years trading, 2,200+ installations, 200+
  corporate clients, 30+ countries supplied.
- **Reviews:** three short published excerpts with names (Sneha Paul, Traffic Burger Head Office, Arjun), as on
  aimsuae.me.
- **Still to supply, never to be invented:** the founding year (confirmed to exist, but the live site says both 2011
  and 2014), opening hours (confirmed, values not yet given), the logo file, showroom and installation photographs,
  team names and photos, exact addresses and maps for the head office and Abu Dhabi, which phone serves which need,
  permission to link datasheets and software files, and an Arabic copy reviewer.

## Product Principles

1. **Truth over polish.** Only published or confirmed facts; missing data is shown honestly ("Specs on request"),
   and anything simulated says so.
2. **Ask once.** Carry product, quantity, need and destination into the quote and the WhatsApp message; buyers never
   retype what they chose.
3. **Model-code first.** A trade buyer finds a model by code in two actions and can verify it against real specs and
   datasheets.
4. **Show the real thing.** AIMS's actual products, places and specifications prove the claim, not stock imagery or
   generic promises.
5. **Fast and accessible by default,** on a phone first, in English and Arabic.

## Accessibility & Inclusion

WCAG 2.2 AA built in: 44×44 px touch targets, visible focus never hidden under sticky bars, keyboard completion of
search, compare and quote, reduced motion honoured, pinch-zoom never disabled, reflow at 320 px and 400 % zoom.
Bilingual English and Arabic with correct `lang` and `dir`; phone numbers, model codes and the wordmark stay
left-to-right inside Arabic text. Arabic copy is a draft until AIMS's reviewer approves it.
