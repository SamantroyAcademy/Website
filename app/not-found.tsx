import type { Metadata } from "next";
import Logo from "@/components/Logo";
import NotFoundContent from "@/components/site/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist. Find exams, eligibility and batches at Samantroy Academy, Brahmapur.",
  robots: { index: false },
};

/** Any URL that matches no route. Built once at deploy time, so stray links
 *  and bots cost nothing; it sits outside the site layout, so it brings its
 *  own small header. */
export default function RootNotFound() {
  return (
    <>
      {/* No translation runs here: show the page at once in Odia mode too. */}
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('i18n-ready')" }} />
      <header className="container-x flex h-16 items-center lg:h-[68px]">
        <Logo />
      </header>
      <main className="container-x flex min-h-[80dvh] flex-col justify-center pb-20 pt-12">
        <NotFoundContent />
      </main>
    </>
  );
}
