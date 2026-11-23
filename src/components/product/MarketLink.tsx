"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ComponentProps } from "react";
import { destinationFromSearch, withDestination } from "@/lib/quote/context";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

const noop = () => () => {};

/**
 * Keep the product page static while its catalogue and accessory links inherit the current market. The server
 * renders the plain link; after hydration the same element gains the market from the browser URL. No Suspense
 * swap: replacing the node on hydration dropped focus and broke measurements (as in LanguageSwitch).
 */
export function MarketLink({ href, ...props }: Props) {
  usePathname(); // re-render on client navigation
  const search = useSyncExternalStore(
    noop,
    () => window.location.search,
    () => "",
  );
  return <Link {...props} href={withDestination(href, destinationFromSearch(search))} />;
}
