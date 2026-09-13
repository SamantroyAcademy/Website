# Samantroy Academy website

Website and content manager for **Samantroy Academy for Defence Career Studies**,
Brahmapur (Berhampur), Ganjam, Odisha: coaching since 2001 for the Army, Navy, Air Force,
CAPF (BSF, CRPF, CISF, ITBP, SSB), Odisha Police and SI, OSSC, OSSSC, OPSC and ASO, Bank,
Railway and SSC, plus NDA, CDS and AFCAT. Live at https://www.samantroyacademy.com.

Built with **Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase
(Postgres, Auth), Cloudflare R2 (images and files), GSAP + ScrollTrigger + Lenis and Resend.**
Hosting is Vercel.

It has a full content manager (draft, publish, rollback), an admin panel with roles,
and a content model built for other-rank recruitment. The full specification is in
[`docs/PROJECT-BLUEPRINT.md`](docs/PROJECT-BLUEPRINT.md); the admin guide is
[`docs/CMS.md`](docs/CMS.md).

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
npm test                     # unit tests (node --test)
npm run build && npm start   # production
```

The site renders without Supabase too: every section falls back to the built-in
defaults in `lib/`, so a missing env var never breaks a page.

## Environment

See [`.env.example`](.env.example). `SUPABASE_SERVICE_ROLE_KEY` is server-only: it creates
admins, stores leads and scores mock tests. `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`
are server-only too: they sign uploads. Never expose them or commit `.env.local`. Add every
variable to Vercel (Production and Preview) as well.

## Images and files (Cloudflare R2)

Vercel hosts the app and Supabase holds the data, but **no image or file is stored in or
served through either**. Everything lives in the R2 bucket and the visitor's browser loads
it straight from `NEXT_PUBLIC_R2_PUBLIC_URL`, so Vercel's bandwidth is never spent on media.

- **Uploads**: the admin asks `POST /api/admin/upload` (admins only) for a five-minute signed
  URL, then PUTs the file directly to R2. Type, size (images 10 MB, PDFs 25 MB) and cache
  headers are part of the signature. Rules live in `lib/r2-keys.ts`, signing in `lib/r2.ts`.
- **Reading**: `mediaUrl()` (`lib/supabase/media.ts`) turns a stored key such as
  `candidates/1718-name.webp`, or a bundled `/images/...` path, into the R2 URL.
  `next/image` runs with `unoptimized: true`, so Vercel never proxies images; uploads
  are already cropped and compressed to WebP in the browser.
- **Bundled photos** sit in `assets/images` (not served). To load them into a new bucket:
  `node scripts/prepare-bundled-images.mjs && node scripts/upload-bundled-images.mjs`.
- **Bucket settings**: public access (r2.dev URL now; connect a custom domain such as
  `media.samantroyacademy.com` once the domain is on Cloudflare, then change
  `NEXT_PUBLIC_R2_PUBLIC_URL`), and a CORS rule allowing `GET, PUT, HEAD` from the site's
  origins. **Add the production domain to the CORS rule before launch**, or admin
  uploads on the live site will fail.

## Odia language switch

The navbar has an **EN / ଓଡ଼ିଆ** switch. Translation is automatic and costs nothing:

- `lib/i18n/sync.ts` crawls every public page, queues each new English string in
  `public.translations` (migration 0007), translates pending rows in batches through
  **OpenRouter's free models** (fallback list in `FREE_MODELS`), and publishes all finished
  rows as one gzipped, versioned dictionary on R2 (`i18n/or-<hash>.json`).
- It runs **after every admin save** (`/api/admin/revalidate`, in the background), **every
  night** (Vercel cron, `vercel.json`, calls `/api/cron/i18n`, needs `CRON_SECRET`), and on
  demand from **Admin, Odia Translations**, where any translation can be corrected by hand.
- In the browser (`components/i18n/`, `lib/i18n/dom.ts`) the dictionary is fetched from R2 in
  the background on every visit; in Odia mode the page text is swapped after hydration and
  kept in sync as React renders. Names, phone numbers and the logo are marked
  `translate="no"`. Text a visitor sees without a translation is reported
  (`/api/i18n/missing`, rate-limited) and translated in the next sync.
- Free models are rate-limited per day and sometimes slow, so a large backlog is translated
  over a few runs. Odia uses Noto Sans Oriya (served from R2, loaded only for Odia text).
- The text on the site at launch was translated and reviewed by hand (model `claude-opus-5`
  in the table); the free models only pick up text added or changed after that. To load a
  reviewed batch yourself: `node scripts/i18n-import.mjs file.json --model=manual --base=<site>`
  with `file.json` an array of `{ "source", "odia" }` (it reads `.env.local` and publishes when
  done; `--publish-only` just republishes).
- English questions in the mock test stay in English in Odia mode, and image attributions on
  `/credits` stay exactly as licensed.

## Performance and security

- **Few requests per visit** (about 23 on the homepage): links do not prefetch
  (`components/ui/Link.tsx`), only the 7 font files in use ship, the hero mounts posters
  one ahead of the carousel, and images come from R2, not Vercel.
- **Cached pages**: public pages are static with a 5-minute revalidate; a CMS publish
  refreshes them at once (`revalidateTag`). Admin draft preview uses Next draft mode
  (`/api/admin/preview`), so only the previewing admin gets fresh renders.
- **Bots and floods**: Cloudflare Turnstile on the enquiry, eligibility and mock-test forms
  (verified server-side, `lib/security.ts`), a honeypot field, per-IP rate limits shared by
  every serverless instance (Postgres, migration 0006) with per-day caps, 16 KB request
  body limits, and admin-only YouTube lookups.
- **Headers**: strict CSP (scripts only from this site and Turnstile; browser connections
  only to this site, Supabase, R2 and Turnstile), HSTS, frame, MIME, referrer, COOP and
  permissions policies; the admin is `noindex` and never cached.
- **Data**: row-level security on every table, service-role key server-only, signed
  R2 uploads (type, size and cache headers signed), last super admin protected.
- **In the dashboards** (not in code): Vercel Firewall Bot Protection and Attack Challenge
  Mode, Supabase Auth captcha (Turnstile) and sign-ups off.
- **Admin login captcha**: Supabase, Authentication, Bot and Abuse Protection is on with
  Turnstile. Its "Captcha secret" must be the Turnstile widget's **secret key** (the same
  value as `TURNSTILE_SECRET_KEY`; Cloudflare, Turnstile, the widget, Settings), never a
  name or password. The login form sends a fresh token with every attempt. For local
  admin work, `localhost` must be in the widget's allowed hostnames, or turn the captcha
  off while developing.

## Database

Run the files in `supabase/migrations/` in order (Supabase, SQL Editor), then the seed:

| File | Creates |
| --- | --- |
| `0001_cms_init.sql` | Roles, `site_content` (draft/published), versions, candidates, testimonials, faculty, FAQs, media, audit log, legacy storage bucket (unused while R2 is configured) |
| `0002_features.sql` | Enquiries CRM, blog, selection tracker, mock questions, analytics RPC |
| `0003_resources.sql` | Resource folders and files |
| `0004_exams_standards.sql` | Exam catalogue and physical standards |
| `0005_candidate_hometown.sql` | Hometown on selected candidates |
| `0006_rate_limits.sql` | Shared rate-limit counter for the public API |
| `0007_translations.sql` | Odia translations (source text, Odia, status, model) |
| `seed/0001_catalogue.sql` | 27 exams, 20 standards rows, sample questions, FAQs (idempotent) |

Regenerate the seed after editing `lib/exams.ts` or `lib/standards.ts`:
`node scripts/generate-seed.ts`.

### First admin

1. Supabase, Authentication, Users, **Add user** (email and password). The **first**
   user becomes **super admin** automatically; later sign-ups are `pending` with no access.
2. Supabase, Authentication, Providers, Email: **turn off "Allow new users to sign up"**.
3. Sign in at `/admin/login`. Add more admins under **Users**.

## Design system

- **Type**: Cabinet Grotesk (display), Switzer (text), Bespoke Stencil (numerals and
  wordmark), self-hosted from Fontshare (Indian Type Foundry, free commercial licence).
- **Colour**: from the academy logo: logo red `#ce0608` as the single accent, a deep
  regimental navy brand, clean paper neutrals. Light theme; the CTA banner and footer form
  the only dark block.
- **Logo**: traced to vectors in `lib/logo-art.ts` (navbar mark, footer lockup, preloader,
  favicon, share card). Regenerate icons with `node scripts/generate-brand-assets.mjs` and
  the share card with `node scripts/generate-og-image.mjs`.
- **Shape**: pill buttons, 20px cards, 12px inputs.
- **Motion**: Lenis smooth scroll synced to GSAP ScrollTrigger. Sections opt in with
  `data-reveal`, `data-split` and `data-parallax` (see `components/motion/`). Everything
  switches off under `prefers-reduced-motion`.

## Project map

| Path | Purpose |
| --- | --- |
| `app/(site)/` | Public pages (17 routes) |
| `app/admin/` | Content manager (31 screens) |
| `app/api/` | Enquiry, lead, mock scoring, YouTube lookup and admin endpoints |
| `components/home/` | Homepage sections, each reading its own CMS document |
| `components/pages/` | Interactive tools: eligibility finder, standards calculator, mock quiz, resources |
| `components/admin/` | CMS editors (section editor, record manager, exams and standards managers...) |
| `lib/content.ts` | CMS read layer: published or draft, cached, sanitised, with fallback |
| `lib/public-data.ts` | Server loaders for every public collection |
| `lib/sections.ts` | Field schema that drives the universal section editor |
| `lib/exams.ts`, `lib/standards.ts`, `lib/eligibility.ts` | Exam catalogue, PST/PET data, eligibility engine |
| `lib/sample-content.ts` | Labelled sample entries shown only until real ones are added |
| `lib/structured-data.ts`, `lib/seo.ts`, `app/llms.txt` | JSON-LD (local business, FAQ), per-page meta and share cards, AI summary |
| `lib/shorts.ts` | Student stories (YouTube Shorts) defaults; managed at Admin, Student Shorts |
| `supabase/` | Migrations and seed |

## Before launch

- Contact details, socials and 192 selected candidates are in. Add an email address and
  office hours (Admin, Footer and Contact) if you want them shown; they stay hidden while blank.
- Add real faculty and testimonials (samples disappear automatically).
- **Verify every physical and medical standard and exam age band against the current
  official notifications.** They are indicative and change each cycle.
- Resend is connected (samantroyacademy.com verified); enquiries go to CONTACT_ADMIN_EMAIL.
- R2: the production domain is in the CORS rule. Move from the r2.dev URL (rate-limited)
  to a custom domain once the DNS is on Cloudflare.
- Confirm the Google Maps pin (`mapUrl` and `LOCATION` coordinates in `lib/data.ts`).
- Replace the placeholder photography with the academy's own ground and campus photos.
- See `lib/image-credits.json` for the licences of the bundled photographs.

## Deploy (Vercel)

The repository deploys to Vercel on every push to `main`; the domain is
`www.samantroyacademy.com` (the apex redirects to it). Add every variable from
`.env.example` to Production and Preview (Supabase, R2, Resend, CONTACT_*).
