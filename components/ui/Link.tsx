import NextLink from "next/link";
import type { ComponentProps } from "react";

/** next/link with prefetching OFF by default. Next prefetches every link that
 *  scrolls into view; with a navbar, footer and exam cards that was ~60 extra
 *  requests (and server renders) per visit. A page now loads when clicked.
 *  Pass prefetch={true} on the rare link worth warming up. */
export default function Link({ prefetch = false, ...props }: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={prefetch} {...props} />;
}
