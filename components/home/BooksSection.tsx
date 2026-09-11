import Image from "next/image";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { getPublished } from "@/lib/content";
import { BOOKS, type BookItem } from "@/lib/data";
import { asArray } from "@/lib/shape";
import { mediaUrl } from "@/lib/supabase/media";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";

/** Study material (CMS: books). Hidden until the academy adds a book. */
export default async function BooksSection() {
  const doc = await getPublished<{ items: BookItem[] }>("books", { items: BOOKS });
  const books = asArray<BookItem>(doc.items).filter((b) => b?.title);
  if (!books.length) return null;

  return (
    <section className="section-y" aria-label="Study material">
      <div className="container-x">
        <CmsSectionHeading sectionKey="books" />
        <ul className="mt-10 grid gap-6 md:grid-cols-2" data-reveal="stagger">
          {books.map((b) => (
            <li key={b.title} className="card flex gap-6 p-6">
              <div className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-[12px] bg-tint sm:w-36">
                {b.cover && <Image src={mediaUrl(b.cover)} alt={`Cover of ${b.title}`} fill sizes="144px" className="object-cover" />}
              </div>
              <div className="flex flex-col">
                <h3 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">{b.title}</h3>
                {b.subtitle && <p className="text-sm font-medium text-brand-600">{b.subtitle}</p>}
                <p className="mt-1 text-sm text-muted">{[b.author, b.edition].filter(Boolean).join(", ")}</p>
                <div className="rich-html mt-3 line-clamp-4 text-sm leading-relaxed text-ink-2" dangerouslySetInnerHTML={{ __html: b.blurb }} />
                {b.buyUrl && (
                  <a href={b.buyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm mt-auto self-start">
                    Buy the book <ArrowUpRightIcon size={16} weight="bold" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
