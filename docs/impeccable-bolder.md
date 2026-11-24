# Impeccable bolder: home page trial

A one-screen trial of Impeccable's `bolder` command on `/` and `/ar` (branch `claude/impeccable-bolder`, from main
75219c6). The client gave Impeccable priority over the taste skill and the Design Doc's design rules where they
conflict; CLAUDE.md §1, §4–§8 and tokens-only still bind. One line per change:

- Hero: headline up to 76–88px from 1280px (44px on phones), the device about a fifth taller on the same signal
  target, and the kicker above the h1 moved under the actions as the hero's hard fact.
- Section titles on home up to 48px (32px on phones), scoped to `.home-page`; buyer routes rebuilt from three
  same-size cards into an editorial split: the heading on the start columns, three large linked rows between hairlines.
- Product families: time attendance and access control lead as two large cards with their products shown big, the
  other four families in one row of four, in place of six same-size cards (phones: the two leads full width).
- Fix: the lead-family class (Prettier's Tailwind plugin had trimmed its space); buyer routes stack below 1280px.
- Arabic keeps a 40px title in the stacked hero (below 1024px): at 44px the fallback font wrapped one line more
  than IBM Plex Sans Arabic and the swap shifted the hero.
