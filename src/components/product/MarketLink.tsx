"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, type ComponentProps } from "react";
import { destinationFromSearch, withDestination } from "@/lib/quote/context";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/** Keep the product page static while its catalogue and accessory links inherit the current market. */
export function MarketLink(props: Props) {
  return (
    <Suspense fallback={<Link {...props} />}>
      <DestinationLink {...props} />
    </Suspense>
  );
}

function DestinationLink({ href, ...props }: Props) {
  const params = useSearchParams();
  return <Link {...props} href={withDestination(href, destinationFromSearch(params.toString()))} />;
}
