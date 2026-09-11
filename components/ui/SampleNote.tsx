import { InfoIcon } from "@phosphor-icons/react/ssr";

/** Shown wherever the site is rendering design-review sample content, so no
 *  visitor could mistake a placeholder for a real result. Disappears once the
 *  admin adds real entries. */
export default function SampleNote({ className = "" }: { className?: string }) {
  return (
    <p className={`inline-flex items-center gap-2 rounded-full bg-accent-50 px-3.5 py-1.5 text-xs font-semibold text-accent-ink ${className}`}>
      <InfoIcon size={14} weight="bold" />
      Sample entries for preview. Real results appear here once added in the admin.
    </p>
  );
}
