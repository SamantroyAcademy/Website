import Image from "next/image";
import { mediaUrl } from "@/lib/supabase/media";

const TONES = ["bg-brand-100 text-brand-800", "bg-accent-100 text-accent-ink", "bg-tint-2 text-ink-2", "bg-brand-200 text-brand-900"];

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "SA";

/** A person's photo, or a stencil monogram when there is none. Monograms make
 *  it obvious that no photo was supplied (never a fake stock face). */
export default function Portrait({
  src,
  name,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  className = "",
  rounded = "rounded-[var(--radius-card)]",
  priority = false,
  monoClass = "text-[clamp(2rem,6vw,3.5rem)]",
}: {
  src?: string | null;
  name: string;
  sizes?: string;
  className?: string;
  rounded?: string;
  priority?: boolean;
  /** Monogram text size (pass a small size for avatars). */
  monoClass?: string;
}) {
  const tone = TONES[[...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % TONES.length];
  return (
    <div className={`relative overflow-hidden ${rounded} ${src ? "bg-tint" : tone} ${className}`}>
      {src ? (
        <Image src={mediaUrl(src)} alt={name} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <span aria-hidden translate="no" className={`absolute inset-0 flex items-center justify-center font-stencil font-extrabold ${monoClass}`}>
          {initials(name)}
        </span>
      )}
    </div>
  );
}
