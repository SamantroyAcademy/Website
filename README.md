# Samantroy Academy website

Marketing site and content manager for Samantroy Academy, a defence and government-job
coaching institute in Odisha (Army Agniveer, Navy SSR and MR, Air Force X and Y, SSC GD
for the CAPFs, Odisha Police, Railways and SSC, with officer entries alongside).

Built with **Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase
(Postgres, Auth, Storage), GSAP + ScrollTrigger + Lenis and Resend.**

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
admins, stores leads and scores mock tests. Never expose it or commit `.env.local`.

## Database

Run the files in `supabase/migrations/` in order (Supabase, SQL Editor), then the seed:

| File | Creates |
| --- | --- |
| `0001_cms_init.sql` | Roles, `site_content` (draft/published), versions, candidates, testimonials, faculty, FAQs, media, audit log, storage bucket |
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
- Replace the placeholder photography with the academy's own ground and campus photos.
- See `public/images/credits.json` for the licences of the bundled photographs.

## Deploy (Vercel)

Import the repository, add the variables from `.env.example` to Production and Preview,
deploy, then add the domain and update `SITE.url` in `lib/data.ts` if it differs.
