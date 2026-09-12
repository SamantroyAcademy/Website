import Link from "@/components/ui/Link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";

/** The 404 message and ways back, shared by the site 404 and the root one. */
export default function NotFoundContent() {
  return (
    <>
      <p className="numeral text-[clamp(5rem,16vw,11rem)] text-accent-ink">404</p>
      <h1 className="display-lg mt-2 max-w-2xl text-ink">This page is off the parade ground.</h1>
      <p className="lede mt-5">The link may be old, or the page was moved. These will get you back on track.</p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary group">Go to the homepage <ArrowRightIcon size={18} weight="bold" className="arrow" /></Link>
        <Link href="/exams" className="btn btn-ghost">Browse exams</Link>
        <Link href="/eligibility" className="btn btn-ghost">Check eligibility</Link>
        <Link href="/contact" className="btn btn-ghost">Contact us</Link>
      </div>
    </>
  );
}
