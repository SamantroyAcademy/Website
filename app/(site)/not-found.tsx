import type { Metadata } from "next";
import NotFoundContent from "@/components/site/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist. Find exams, eligibility and batches at Samantroy Academy, Brahmapur.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="container-x flex min-h-[80dvh] flex-col justify-center pb-20 pt-32">
      <NotFoundContent />
    </main>
  );
}
