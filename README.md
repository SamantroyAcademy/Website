# Samantroy Academy website

Marketing site and content manager for Samantroy Academy, a defence and government-job
coaching institute in Odisha (Army Agniveer, Navy SSR and MR, Air Force X and Y, SSC GD
for the CAPFs, Odisha Police, Railways and SSC, with officer entries alongside).

Built with **Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase
(Postgres, Auth), Cloudflare R2 (images and files), GSAP + ScrollTrigger + Lenis and Resend.**
Hosting is Vercel.

It carries over every feature of the SSB Wings reference build (same CMS, same admin,
same security model) with a new design system and a content model rebuilt for
other-rank recruitment. The full specification is in
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

## Database

Run the files in `supabase/migrations/` in order (Supabase, SQL Editor), then the seed:

| File | Creates |
| --- | --- |
| `0001_cms_init.sql` | Roles, `site_content` (draft/published), versions, candidates, testimonials, faculty, FAQs, media, audit log, legacy storage bucket (unused while R2 is configured) |
| `0002_features.sql` | Enquiries CRM, blog, selection tracker, mock questions, analytics RPC |
| `0003_resources.sql` | Resource folders and files |
| `0004_exams_standards.sql` | Exam catalogue and physical standards |
| `seed/0001_catalogue.sql` | 22 exams, 20 standards rows, sample questions, FAQs (idempotent) |

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
- **Colour**: cool paper neutrals, regimental green brand, a single saffron accent. Light
  theme; the CTA banner and footer form the only dark block.
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
| `supabase/` | Migrations and seed |

## Before launch

- Replace the placeholder phone, WhatsApp, email and address (Admin, Footer and Contact).
- Add real selected candidates, faculty and testimonials (samples disappear automatically).
- **Verify every physical and medical standard and exam age band against the current
  official notifications.** They are indicative and change each cycle.
- Add a Resend API key and verified sending domain so enquiries are emailed.
- R2: add the production domain to the bucket's CORS rule, and move from the r2.dev URL
  (rate-limited, meant for development) to a custom domain on Cloudflare.
- Replace the placeholder photography with the academy's own ground and campus photos.
- See `lib/image-credits.json` for the licences of the bundled photographs.

## Deploy (Vercel)

Import the repository, add the variables from `.env.example` to Production and Preview,
deploy, then add the domain and update `SITE.url` in `lib/data.ts` if it differs.
