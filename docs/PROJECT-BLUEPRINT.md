# SAMANTROY ACADEMY — Complete Website Blueprint

**Version** 1.0 · **Date** 10 September 2026 · **Status** Pre-development specification
**Reference implementation** a private Next.js 16 + Supabase CMS codebase

---

## 0. How to read this document

This is the complete, implementation-ready specification for the Samantroy Academy
website. It replicates **every** functionality of the reference build, re-mapped to
Samantroy Academy's domain (other-ranks / Agniveer / CAPF / Odisha State / Railways
recruitment, with officer entries as a secondary vertical).

Sections are ordered so you can build top-to-bottom:

| § | Section | What it gives you |
|---|---------|-------------------|
| 1 | Domain & positioning | What the site is, who it serves |
| 2 | Feature parity matrix | Every reference feature → Samantroy equivalent |
| 3 | Tech stack | Exact packages and versions |
| 4 | Environment variables | Every secret and config value |
| 5 | Repository structure | Every folder and file |
| 6 | Design system | Colours, fonts, motion, components |
| 7 | Public pages | All 17 pages, section by section |
| 8 | Component inventory | All ~85 components and what they do |
| 9 | Content architecture | Draft → publish → live, fallback, caching |
| 10 | Database schema | Every table, column, view, policy, trigger |
| 11 | `site_content` key registry | Every CMS document and its shape |
| 12 | API endpoints | Every route: method, auth, body, response |
| 13 | Admin panel | All 31 admin screens and their functionality |
| 14 | Connection maps | How every piece wires to every other piece |
| 15 | Security model | Four-layer defence in depth |
| 16 | Performance & caching | Egress control, image pipeline |
| 17 | SEO & structured data | Metadata, sitemap, JSON-LD |
| 18 | Delivery phases | Build order with acceptance criteria |
| 19 | Deployment | Vercel + Supabase setup runbook |
| 20 | Appendices | Migration order, seed data, checklists |

---

## 1. Domain & positioning

### 1.1 What Samantroy Academy is

Samantroy Academy is a defence and government-jobs coaching institute in **Odisha**.
Unlike the reference build (which is exclusively an officer-entry / SSB-interview academy),
Samantroy Academy's centre of gravity is **other-rank and constable-level recruitment**,
where the decisive filters are the **written CBT/CEE**, the **Physical Standard Test
(PST)**, the **Physical Efficiency Test (PET)** and the **Medical Board** — not a
five-day psychological assessment.

Officer-entry coaching (NDA, CDS, AFCAT, SSB interview) is offered, but as a
secondary vertical.

**What this changes versus the reference build:**

1. Physical standards are a *primary* content pillar, not a footnote. They get their
   own page, their own database table, and an interactive calculator.
2. The "5-Day SSB" explainer becomes a **7-stage recruitment journey** that applies
   across every force and exam.
3. The exam catalogue is far larger (35+ exams vs ~30 officer entries) and needs
   per-exam detail pages, so it is promoted from a JSON blob to a real table.
4. Odia-language content matters for this audience.
5. Mobile performance matters more — the audience is overwhelmingly on mid-range
   Android phones on patchy connections.

### 1.2 The exam catalogue (six verticals)

This catalogue is the backbone of the site. It drives the Exams page, the Eligibility
Finder, the Standards page, the enquiry-form dropdown, the mock-test bank and the
Selection Tracker.

**A · Armed Forces — Other Ranks / Agniveer**

- Army Agniveer General Duty (GD)
- Army Agniveer Technical / Technical (Aviation & Ammunition Examiner)
- Army Agniveer Clerk / Store Keeper Technical (SKT)
- Army Agniveer Tradesman (10th & 8th pass)
- Army Soldier Nursing Assistant / Nursing Assistant Veterinary
- Army Havildar Education (Group X & Y)
- Navy Agniveer SSR (Senior Secondary Recruit)
- Navy Agniveer MR (Matric Recruit — Chef, Steward, Hygienist)
- Navy Tradesman Mate / civilian entries
- Air Force Agniveervayu Intake — **Science (X) Group**
- Air Force Agniveervayu Intake — **Non-Science (Y) Group**
- Indian Coast Guard Navik (General Duty)
- Indian Coast Guard Navik (Domestic Branch)
- Indian Coast Guard Yantrik

**B · Central Armed Police Forces (CAPF)**

- SSC GD Constable — **BSF · CISF · CRPF · ITBP · SSB · Assam Rifles · NCB · SSF**
- SSC CPO — Sub-Inspector in Delhi Police & CAPF
- CISF / BSF Head Constable (Ministerial), ASI (Stenographer)
- CAPF Tradesman / Constable (Technical & Tradesmen)

**C · Odisha State**

- Odisha Police Constable (OPRB — Odisha Police Recruitment Board)
- Odisha Police Sub-Inspector (SI)
- Odisha Excise Constable / Excise SI
- Odisha Forest Guard / Forester / Wildlife Guard
- Odisha Fire Services (Fireman / Fireman Driver)
- OSSSC / OSSC posts — Revenue Inspector, Amin, Statistical Field Surveyor, Junior Clerk
- Odisha Home Guard / Special Security Battalion

**D · Railways**

- RRB Group D (Level 1)
- RRB NTPC — Undergraduate & Graduate levels
- RRB ALP (Assistant Loco Pilot) & Technician
- RPF / RPSF Constable & Sub-Inspector

**E · Other Central Government**

- SSC MTS & Havaldar (CBIC / CBN)
- SSC CHSL (10+2 level)
- SSC CGL (graduate level)
- India Post GDS / Postman / Mail Guard

**F · Officer Entries (secondary vertical)**

- NDA & NA (Army / Navy / Air Force)
- CDS — IMA / INA / AFA / OTA
- AFCAT — Flying & Ground Duty
- SSB Interview coaching (5-day process) for all of the above
- Agniveer → Officer progression guidance

> The catalogue above is the seed data for the `exams` table (§10.18). Each row
> becomes a filterable card on `/exams` and, optionally, its own detail page at
> `/exams/[slug]`.

### 1.3 The Recruitment Journey (7 stages)

The reference build's flagship "5-Day SSB Process" page becomes Samantroy's **7-Stage Recruitment
Journey** — the single most important explainer on the site, reused on the homepage
and on its own page at `/recruitment-process`.

| Stage | Name | Code | What it covers |
|-------|------|------|----------------|
| 1 | Notification & Online Application | `APPLY` | Reading the notification, eligibility check, online form, photo/signature specs, fee, common application rejections |
| 2 | Admit Card & Written Exam (CBT / CEE) | `WRITTEN` | Exam pattern per force, syllabus, marking scheme, negative marking, normalisation, exam-day drill |
| 3 | Physical Standard Test (PST) | `PST` | Height, chest (unexpanded / expanded), weight, category & tribal relaxations, re-measurement appeal |
| 4 | Physical Efficiency Test (PET) | `PET` | 1600 m run, long jump, high jump, beam / pull-ups, 9-foot ditch, zig-zag balance — per-force timings and groups |
| 5 | Document Verification | `DV` | Certificate list, domicile, caste, NCC / sports bonus marks, relation certificate, common DV rejections |
| 6 | Medical Examination (DME / RME) | `MEDICAL` | Vision, dental, flat foot, knock knees, varicocele, tattoo policy, hearing, BMI, RME / AME appeal |
| 7 | Merit List, Training & Joining | `MERIT` | Merit calculation, cut-offs, joining letter, training centre, allowances |

Each stage carries: `icon`, `stage` label, `code`, `service` colour theme, `title`,
`subtitle`, `brief` (rich text), `drill` ("Our Drill" — what Samantroy Academy does to
prepare you for this stage) and a nested repeater of `tests` (name + detail).

This maps **exactly** onto the reference build's `journey` repeater section
(§11.9), so the admin editor, the homepage `<JourneySection>` and the standalone
page all work unchanged.

### 1.4 Brand identity — to confirm before development

| Token | Value |
|-------|-------|
| Name | Samantroy Academy |
| Legal entity | *(to confirm — e.g. Samantroy Academy Pvt. Ltd. / LLP)* |
| Tagline | *(to confirm — suggested: "Discipline. Fitness. Selection.")* |
| Domain | *(to confirm — e.g. `samantroyacademy.com`)* |
| Address | *(to confirm — full postal address in Odisha)* |
| Google Maps URL | *(to confirm — used by footer, contact page and embedded map)* |
| Languages | English + **Odia** |
| Primary phone | *(to confirm)* |
| Secondary phone | *(optional — blank hides it everywhere)* |
| WhatsApp link | *(to confirm — `https://wa.me/91XXXXXXXXXX?text=...`)* |
| Email | *(to confirm)* |
| Instagram / YouTube / Telegram / Facebook | *(to confirm)* |
| Brochure PDF | *(to confirm — served from `/public`, toggleable in CMS)* |
| Payment links | *(to confirm — Razorpay pages for offline / online batch)* |

> **Action required.** These values seed `lib/data.ts → SITE` (the code defaults) and
> the `settings` CMS document (§11.1). Every one of them is editable in the admin
> panel afterwards, so placeholders are acceptable to start development — but they
> must be real before launch.

---

## 2. Feature parity matrix — Reference build → Samantroy Academy

Every feature in the reference build, with its Samantroy equivalent. Nothing is dropped.

### 2.1 Public-site features (41)

| # | Reference feature | Samantroy Academy equivalent | Change |
|---|-------------------|------------------------------|--------|
| 1 | Lottie preloader + wordmark | Same, Samantroy wordmark + tricolour | Rebrand |
| 2 | Custom cursor (dot + easing ring), desktop only | Same | 1:1 |
| 3 | Sticky navbar with tricolour scroll-progress bar | Same, new menu tree (§7.1) | Rebrand |
| 4 | Animated hero with typewriter rotating words | Same — words become *Agniveer · Constable · Navik · Airman · Sub-Inspector* | Copy |
| 5 | Hero Showcase carousel (passing-out photos) | Passing-out / training photos: INS Chilka, ARO, BSF Tekanpur, Biju Patnaik State Police Academy | Content |
| 6 | Entries marquee (entry + recommended count) | **Exams marquee** (exam + selected count) | Rename |
| 7 | AIR-1 marquee (rank holders) | **Top Rank marquee** (state / all-India rank holders) | Rename |
| 8 | Wall of Honour (recommended candidates) | **Wall of Selection** (name, force, post, year) | Rename |
| 9 | Courses section + price show/hide toggle | Same — batch types re-scoped (§7.6) | Content |
| 10 | Campus gallery | Campus **+ ground / PET track** gallery | Content |
| 11 | Books section (2 books, buy links) | Study material / books by faculty (optional, toggleable) | 1:1 |
| 12 | Mentors ("Your Commanding Officers") | **Faculty & Physical Trainers** (ex-servicemen, PT instructors) | Rename |
| 13 | Four Forces cards (Army/Navy/AF/ICG) | **Six Verticals cards** (Armed Forces · CAPF · Odisha State · Railways · SSC · Officer Entries) | Extend |
| 14 | Why Us cards (6) | Same | Copy |
| 15 | Batch & exam countdown timers | Same — Agniveer / SSC GD / RRB / OPRB notification & exam dates | Content |
| 16 | Scoreboard stats (animated count-up) | Same | Copy |
| 17 | Selection tracker (year / exam / centre bar chart) | Same — year / exam / **district or force** | 1:1 |
| 18 | 5-Day SSB Journey timeline | **7-Stage Recruitment Journey** timeline | Re-map |
| 19 | "Now Serving" officer banners marquee | **"Now Serving"** alumni-in-uniform marquee | 1:1 |
| 20 | YouTube video grid (facade-loaded) | Same | 1:1 |
| 21 | Google Reviews (Places API + manual) | Same | 1:1 |
| 22 | Testimonials carousel | Same | 1:1 |
| 23 | Instagram feed | Same | 1:1 |
| 24 | FAQ accordion | Same | 1:1 |
| 25 | CTA banner | Same | Copy |
| 26 | Eligibility Finder quiz → lead | **Eligibility Finder** — adds **height, chest, domicile, category** to age / education / gender / marital | Extend |
| 27 | Free mock tests (OIR + SRT), server-scored | **CEE / CBT mock tests** — subject-wise MCQ, server-scored, negative marking | Extend |
| 28 | Blog + `[slug]` detail | Same | 1:1 |
| 29 | Resources centre (folders, PDFs, YouTube) | Same — syllabi, previous papers, Odia notes | 1:1 |
| 30 | Contact form → CRM + email + auto-responder | Same | 1:1 |
| 31 | Auto-popup enquiry modal (once per session) | Same | 1:1 |
| 32 | Floating WhatsApp button | Same | 1:1 |
| 33 | Floating call button | Same | 1:1 |
| 34 | ChatBot widget + brochure download | Same | 1:1 |
| 35 | Back-to-top button | Same | 1:1 |
| 36 | Preview bar (admin click-to-edit on live site) | Same | 1:1 |
| 37 | Page-view tracker (privacy-friendly) | Same | 1:1 |
| 38 | Academies page (IMA/OTA/INA/AFA) | **Training Centres & Recruiting Bodies** (ARO, INS Chilka, BTI Belagavi, BSF Tekanpur, Biju Patnaik State Police Academy, RRB Bhubaneswar) | Re-map |
| 39 | Medical process page | **Physical & Medical Standards** — PST/PET benchmark tables **plus** medical standards | Extend |
| 40 | — | **PST/PET Standards Calculator** — force + category + gender + age → required height, chest, run timing | **New** |
| 41 | — | **Odia content support** on key explainers (font + optional per-field Odia copy) | **New (optional)** |

### 2.2 Admin / CMS features (29)

| # | Reference capability | Samantroy Academy | Change |
|---|----------------------|-------------------|--------|
| 1 | Email/password auth; first user = `super_admin` | Same | 1:1 |
| 2 | Roles: `pending` / `admin` / `super_admin` | Same | 1:1 |
| 3 | Add / promote / demote / remove admins (service role) | Same | 1:1 |
| 4 | Last-super-admin lockout protection (trigger + advisory lock) | Same | 1:1 |
| 5 | Change own password | Same | 1:1 |
| 6 | Draft → Publish → Rollback on every section | Same | 1:1 |
| 7 | Autosave drafts (1.6 s debounce) | Same | 1:1 |
| 8 | Live preview via preview cookie + device-framed iframe | Same (cookie → `sa-preview`) | Rename |
| 9 | Rich-text editor: fonts, colours, highlight, size, align, tricolour word-art | Same | 1:1 |
| 10 | Image cropper (aspect-locked, pan / zoom) | Same | 1:1 |
| 11 | Client-side compress → WebP before upload | Same | 1:1 |
| 12 | Media library (upload / browse / delete) | Same | 1:1 |
| 13 | Activity log (audit trail) | Same | 1:1 |
| 14 | Content version history + one-click rollback | Same | 1:1 |
| 15 | Enquiry CRM (pipeline, notes, CSV export) | Same | 1:1 |
| 16 | Analytics (daily page views) | Same | 1:1 |
| 17 | Homepage section reorder + enable / disable | Same | 1:1 |
| 18 | Per-page SEO editor with Google preview | Same | 1:1 |
| 19 | Footer & contact settings editor | Same | 1:1 |
| 20 | Configurable contact form (labels, required, show/hide, dropdown options) | Same | 1:1 |
| 21 | Collection managers (candidates, testimonials, mentors, FAQs, blog, mocks, selections, resources) | Same, renamed | Rename |
| 22 | Google Reviews import + manual entry | Same | 1:1 |
| 23 | Countdown editor with colour pickers | Same | 1:1 |
| 24 | Scoreboard stats editor | Same | 1:1 |
| 25 | Image-list managers (campus, AIR-1, officer banners, hero slides) | Same, renamed | Rename |
| 26 | Four Forces manager | **Six Verticals manager** | Extend |
| 27 | Courses manager | **Batches & Courses manager** | Rename |
| 28 | — | **Exams manager** — full exam catalogue as a first-class table | **New** |
| 29 | — | **Physical Standards manager** — PST/PET benchmark rows | **New** |

> **Why #28 and #29 are new tables rather than JSON repeaters.** the reference build stored its
> ~30 entry routes inside a single `site_content.join_routes` JSONB repeater. Samantroy
> has 35+ exams, each needing its own detail page, its own SEO record, its own
> selected-candidate filter and its own standards rows. A JSON blob of that size becomes
> slow to edit, impossible to search, and can't be published or unpublished per item.
> Promoting them to real tables keeps every other pattern identical while making the
> admin experience workable. **This is the only structural deviation from the
> reference build.**

---

## 3. Tech stack

Identical to the reference build. Do not substitute — the content layer, caching
model and auth flow all depend on these specific APIs.

### 3.1 Runtime & framework

| Layer | Choice | Version | Why |
|-------|--------|---------|-----|
| Framework | **Next.js** (App Router) | `16.2.x` | Server Components, `generateMetadata`, `unstable_cache`, metadata routes, `proxy.ts` convention |
| Language | **TypeScript** | `^5.9` | `strict` mode |
| UI library | **React** | `^19.2` | Server + Client Components |
| Styling | **Tailwind CSS v4** | `^4.3` | CSS-first `@theme` config in `globals.css` — **no** `tailwind.config.js` |
| PostCSS | `@tailwindcss/postcss` | `^4.3` | |
| Database · Auth · Storage | **Supabase** | — | Postgres 15+, GoTrue, Storage, Row-Level Security |
| Supabase client | `@supabase/supabase-js` | `2.112.0` | |
| Supabase SSR | `@supabase/ssr` | `0.12.4` | Cookie-based session in App Router |
| Transactional email | **Resend** | `^6.17` | Enquiry notification + auto-responder |
| HTML sanitization | `sanitize-html` | `^2.17` | Server-side, on every CMS string |
| Animation | `@lottiefiles/dotlottie-react` | `^0.19` | Preloader |
| Testing | `node --test` (built in) | — | Pure-logic unit tests, zero test dependencies |
| Hosting | **Vercel** | — | Free tier is sufficient |

### 3.2 `package.json`

```json
{
  "name": "samantroy-academy",
  "version": "1.0.0",
  "private": true,
  "description": "Samantroy Academy — Defence & Government Job Coaching, Odisha.",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "node --test"
  },
  "dependencies": {
    "@lottiefiles/dotlottie-react": "^0.19.7",
    "@supabase/ssr": "0.12.4",
    "@supabase/supabase-js": "2.112.0",
    "next": "16.2.10",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "resend": "^6.17.1",
    "sanitize-html": "^2.17.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.2",
    "@types/node": "^24.0.0",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@types/sanitize-html": "^2.16.1",
    "tailwindcss": "^4.3.2",
    "typescript": "^5.9.0"
  }
}
```

### 3.3 Deliberate non-choices

| Not used | Why |
|----------|-----|
| Sanity / Strapi / WordPress | The CMS is custom and Supabase-backed — no extra hosting cost, full control, no per-seat licensing |
| Prisma / Drizzle | All DB access goes through `supabase-js`'s parameterized query builder; RLS is the authorization layer, and an ORM would bypass the mental model |
| NextAuth | Supabase Auth already issues and refreshes the session cookie that RLS reads |
| Redux / Zustand | Server Components hold the data; local `useState` covers the rest |
| A component library (MUI, shadcn) | The design is bespoke and skeuomorphic; a generic kit would fight it |
| An external analytics SDK | `page_view_daily` + a `track_view` RPC is privacy-friendly, GDPR-clean and free |
| An image CDN (Cloudinary, imgkit) | Supabase Storage + Next.js `<Image>` + a 31-day `minimumCacheTTL` is enough at this scale |

---

## 4. Environment variables

`.env.example` — commit this file; `.env.local` stays gitignored.

```env
# ─────────────────────────────────────────────────────────────
# Resend — transactional email  (https://resend.com/api-keys)
# ─────────────────────────────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Where enquiry-form submissions are delivered
CONTACT_ADMIN_EMAIL=info@samantroyacademy.com

# Verified sender on your Resend domain.
# Before you verify a domain use onboarding@resend.dev — Resend will then only
# deliver to the address that owns the API key.
CONTACT_FROM_EMAIL=Samantroy Academy <noreply@samantroyacademy.com>

# ─────────────────────────────────────────────────────────────
# Supabase — powers the admin CMS (content, auth, image storage)
# Project → Settings → API.   Free project at https://supabase.com
# ─────────────────────────────────────────────────────────────
# Safe to expose to the browser:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...anon-or-publishable-key

# SERVER ONLY — never expose. Bypasses RLS.
# Used for: creating/managing admins, inserting enquiries, scoring mock tests.
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...service-role-key

# Storage bucket for uploaded media (create it in Supabase → Storage)
NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET=media

# ─────────────────────────────────────────────────────────────
# Google Reviews (optional)
# Google does NOT expose review text to link-readers, so automatic import
# requires the official Places API. Without a key the admin can still add
# reviews manually — they publish identically.
#   1. Enable "Places API" in Google Cloud, create an API key.
#   2. Optionally pin the exact place so no lookup is needed.
# ─────────────────────────────────────────────────────────────
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
GOOGLE_PLACE_QUERY=Samantroy Academy, Odisha
```

### 4.1 Variable reference

| Variable | Scope | Required | Consumed by |
|----------|-------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Yes (for CMS) | `lib/supabase/env.ts` → every client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server | Yes (for CMS) | Public reads, admin session |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser + server | Alternative | Accepted as a fallback for the anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | For user mgmt, CRM, scoring | `lib/supabase/admin.ts` (guarded by `import "server-only"`) |
| `NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET` | Browser + server | Defaults to `media` | `lib/supabase/media.ts` |
| `RESEND_API_KEY` | Server | For email | `lib/mailer.ts`, `/api/contact` |
| `CONTACT_ADMIN_EMAIL` | Server | For email | `lib/mailer.ts` |
| `CONTACT_FROM_EMAIL` | Server | For email | `lib/mailer.ts`, auto-responder |
| `GOOGLE_PLACES_API_KEY` | Server | Optional | `/api/admin/google-review` |
| `GOOGLE_PLACE_ID` | Server | Optional | `/api/admin/google-review` |
| `GOOGLE_PLACE_QUERY` | Server | Optional | Place lookup fallback |

### 4.2 Graceful degradation is a hard requirement

`isSupabaseConfigured()` gates every Supabase call. With **no** env set:

- the public site renders entirely from `lib/data.ts` defaults;
- `/admin` shows a friendly "not configured" screen instead of crashing;
- `npm run build` succeeds.

The same applies to Resend: a missing key is logged and execution continues — the
lead is still captured in the CRM. **No visitor-facing action may ever fail because
a downstream service is unavailable.**

---

## 5. Repository structure

```
samantroy-academy/
├── app/
│   ├── layout.tsx                      # Root: fonts, global metadata, OG, icons
│   ├── globals.css                     # Tailwind v4 @theme, animations, utilities
│   ├── robots.ts                       # Metadata route → /robots.txt
│   ├── sitemap.ts                      # Metadata route → /sitemap.xml
│   │
│   ├── (site)/                         # PUBLIC SITE route group
│   │   ├── layout.tsx                  # Preloader, cursor, navbar, footer, floats, JSON-LD
│   │   ├── loading.tsx                 # Skeleton fallback
│   │   ├── page.tsx                    # Home — order-driven section composition
│   │   ├── about/page.tsx
│   │   ├── recruitment-process/page.tsx    # 7-stage journey   (was ssb-process)
│   │   ├── exams/page.tsx                  # exam catalogue    (was entries)
│   │   ├── exams/[slug]/page.tsx           # single-exam detail       ★ new
│   │   ├── standards/page.tsx              # PST/PET + medical (was medical)
│   │   ├── training-centres/page.tsx       # recruiting bodies (was academies)
│   │   ├── courses/page.tsx
│   │   ├── eligibility/page.tsx
│   │   ├── mock-tests/page.tsx
│   │   ├── resources/page.tsx
│   │   ├── gallery/page.tsx
│   │   ├── selected/page.tsx               # full Wall of Selection (was recommended)
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   ├── testimonials/page.tsx
│   │   └── contact/page.tsx
│   │
│   ├── admin/
│   │   ├── layout.tsx                  # Bare shell (no site chrome)
│   │   ├── login/page.tsx              # Email/password sign-in
│   │   └── (dashboard)/                # AUTH-GATED route group
│   │       ├── layout.tsx              # Role gate + sidebar + session guard
│   │       ├── loading.tsx
│   │       ├── page.tsx                # Dashboard
│   │       ├── enquiries/page.tsx
│   │       ├── analytics/page.tsx
│   │       ├── candidates/page.tsx     # Selected candidates
│   │       ├── testimonials/page.tsx
│   │       ├── mentors/page.tsx        # Faculty & trainers
│   │       ├── exams/page.tsx          ★ new
│   │       ├── standards/page.tsx      ★ new
│   │       ├── selections/page.tsx
│   │       ├── faqs/page.tsx
│   │       ├── blog/page.tsx
│   │       ├── mock-tests/page.tsx
│   │       ├── resources/page.tsx
│   │       ├── homepage/page.tsx       # Section order + on/off
│   │       ├── sections/page.tsx       # Section index
│   │       ├── sections/[key]/page.tsx # Universal section editor
│   │       ├── hero-showcase/page.tsx
│   │       ├── verticals/page.tsx      # Six Verticals (was four-forces)
│   │       ├── campus/page.tsx
│   │       ├── toppers/page.tsx        # Top-rank marquee (was air1)
│   │       ├── officer-banners/page.tsx
│   │       ├── google-reviews/page.tsx
│   │       ├── contact-form/page.tsx
│   │       ├── stats/page.tsx
│   │       ├── countdown/page.tsx
│   │       ├── settings/page.tsx
│   │       ├── seo/page.tsx
│   │       ├── media/page.tsx
│   │       ├── activity/page.tsx
│   │       ├── users/page.tsx          # super_admin only
│   │       └── account/page.tsx
│   │
│   └── api/
│       ├── contact/route.ts
│       ├── lead/route.ts
│       ├── mock/score/route.ts
│       ├── resources/youtube/route.ts
│       └── admin/
│           ├── create-user/route.ts
│           ├── manage-user/route.ts
│           ├── revalidate/route.ts
│           └── google-review/route.ts
│
├── components/                         # ~55 public components  (§8.1)
├── components/admin/                   # ~30 admin components   (§8.2)
│
├── lib/
│   ├── data.ts                         # Built-in content defaults (SITE, STATS, …)
│   ├── content.ts                      # getPublished / getCollection + fallback
│   ├── auth.ts                         # getCurrentAdmin() — fail-closed
│   ├── sections.ts                     # Section registry (admin field schema)
│   ├── section-defaults.ts             # Default document per section key
│   ├── pagehero-defaults.ts
│   ├── homepage-defaults.ts
│   ├── homepage-order.ts               # Home section registry + order resolver
│   ├── seo-pages.ts                    # Per-page SEO defaults
│   ├── seo.ts                          # pageMetadata()
│   ├── form-defaults.ts                # Contact-form config + phone helpers
│   ├── eligibility.ts                  # Eligibility rules engine
│   ├── exams.ts                        ★ Exam catalogue types + defaults
│   ├── standards.ts                    ★ PST/PET + medical types + defaults
│   ├── centres.ts                      # Training centres (was academies.ts)
│   ├── selection-defaults.ts
│   ├── countdown-defaults.ts
│   ├── verticals.ts                    # Six Verticals (was four-forces.ts)
│   ├── hero-slides.ts
│   ├── videos.ts
│   ├── candidates.ts
│   ├── enquiries.ts                    # saveEnquiry() — server-only
│   ├── mailer.ts                       # notifyAdmin(), emailShell(), escapeHtml()
│   ├── sanitize.ts                     # sanitizeHtml()
│   ├── shape.ts                        # coerceShape(), asArray()
│   ├── crop.ts                         # Pure crop maths
│   ├── image-client.ts                 # Client compress → WebP
│   ├── device.ts                       # isMobileOrTablet()
│   ├── rate-limit.ts                   # In-memory limiter
│   ├── revalidate-client.ts            # bustCmsCache()
│   └── supabase/
│       ├── env.ts                      # Central env access + isSupabaseConfigured()
│       ├── client.ts                   # Browser client
│       ├── server.ts                   # Cookie-bound server client
│       ├── public.ts                   # Cookie-free anon client (cacheable)
│       ├── admin.ts                    # Service-role client (server-only)
│       ├── middleware.ts               # updateSession() — refresh + route guard
│       └── media.ts                    # mediaUrl(), MEDIA_CACHE_CONTROL
│
├── lib/*.test.ts                       # node:test unit tests
├── supabase/migrations/*.sql           # Ordered, idempotent schema migrations
├── public/                             # Images, logo, preloader.lottie, brochure PDF
├── docs/
│   ├── PROJECT-BLUEPRINT.md            # ← this document
│   └── CMS.md                          # Admin-facing CMS guide
├── proxy.ts                            # Next 16 middleware convention
├── next.config.ts                      # Security headers + image config
├── postcss.config.mjs
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

### 5.1 Conventions

- **Path alias** — `tsconfig.json` maps `@/*` → `./*`; all imports are `@/lib/...`,
  `@/components/...`.
- **Route groups** — `(site)` and `(dashboard)` are parenthesised so they add a
  layout without adding a URL segment.
- **`"use client"`** — only on components that need state, effects or browser APIs.
  Everything else stays a Server Component so it can read the CMS directly.
- **Plain-data modules** — anything imported by *both* server and client code
  (`homepage-order.ts`, `form-defaults.ts`, `seo-pages.ts`, `hero-slides.ts`,
  `shape.ts`, `crop.ts`) must have **no** `"use client"` directive and **no**
  server-only imports. Values exported from a `"use client"` module become client
  references on the server and will break the build.

---

## 6. Design system

### 6.1 Direction

Samantroy Academy's audience is rural and semi-urban Odisha aspirants preparing for
physically demanding recruitment. The design must read as **disciplined, credible and
proof-heavy** — photographs of real selected candidates and real ground training, not
stock imagery.

Reference direction carried from the reference build: **light tricolour + skeuomorphic** — warm
paper canvas, brass/gold plates, tactile pressable buttons, inset form fields,
medal-ringed avatars. No dark overlays, no flat grid patterns.

### 6.2 Colour tokens

Declared in `app/globals.css` inside Tailwind v4's `@theme` block.

| Token | Role | Suggested value |
|-------|------|-----------------|
| `--color-paper` | Page canvas | `#f7f3ea` warm paper |
| `--color-ink` | Body text | `#1a1a1a` |
| `--color-gold` | Brand plate / accent | `#c8a23c` |
| `--color-gold-deep` | Pressed state / border | `#8a6d1f` |
| `--color-saffron` | Tricolour 1 | `#ff9933` |
| `--color-white-tri` | Tricolour 2 | `#ffffff` |
| `--color-green-tri` | Tricolour 3 | `#138808` |
| `--color-chakra` | Ashoka chakra / links | `#000080` |
| `--color-army` | Army vertical | `#4b5320` olive |
| `--color-navy` | Navy vertical | `#0f2650` deep blue |
| `--color-airforce` | Air Force vertical | `#5aa0e0` sky |
| `--color-capf` | CAPF vertical | `#8b7355` khaki |
| `--color-odisha` | Odisha State vertical | `#7b2d26` Konark red |
| `--color-railway` | Railways vertical | `#1e4d6b` |

The tricolour drives the navbar scroll-progress bar, the `.tricolour-text` word-art
class used by the rich-text editor, and section dividers.

### 6.3 Typography

| Role | Font | Loaded via | CSS variable |
|------|------|-----------|--------------|
| Display / headings | **Barlow Condensed** (400–900) | `next/font/google` | `--font-barlow` |
| Body / UI | **Inter** | `next/font/google` | `--font-inter` |
| Odia content | **Noto Sans Oriya** | `next/font/google` | `--font-odia` ★ new |

All three use `display: "swap"`. Odia is added because a meaningful share of this
audience reads syllabus and notification content more comfortably in Odia.

### 6.4 Motion & micro-interactions

| Behaviour | Where | Notes |
|-----------|-------|-------|
| Custom cursor (dot + easing ring) | Site-wide, **desktop only** | Suppressed by `isMobileOrTablet()` |
| Scroll reveal | `<Reveal>` wrapper | IntersectionObserver; respects `prefers-reduced-motion` |
| Count-up numbers | Stats, selection tracker | `<CountUp>` / `<Counter>` |
| Marquees | Exams, toppers, now-serving | CSS keyframes; pause on hover |
| Typewriter | Hero rotating words | Word list configurable from the CMS |
| Skeleton loaders | `loading.tsx`, `<Skeleton>` | Prevents layout shift |
| Preloader | First load only | Lottie + wordmark; CMS-toggleable on/off |

**Accessibility floor:** every animation disabled under
`@media (prefers-reduced-motion: reduce)`; every image carries a meaningful `alt`;
colour contrast meets WCAG AA on the paper canvas; every interactive element is
keyboard-reachable with a visible focus ring.

### 6.5 Responsive breakpoints

Tailwind defaults — `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.

Mobile-first is not a preference here, it is the requirement: this audience is
overwhelmingly on mid-range Android phones on patchy connections. **Optimise for a
4G-throttled Moto-class device, then let desktop inherit.**

### 6.6 Shared UI primitives

| Component | Purpose |
|-----------|---------|
| `<SectionHeading>` / `<CmsSectionHeading>` | Kicker + title + subtitle, with a CMS-driven variant |
| `<PageHero>` / `<CmsHero>` | Interior-page banner, CMS-driven |
| `<Reveal>` | Scroll-triggered fade/slide wrapper |
| `<CountUp>` / `<Counter>` | Animated number |
| `<Skeleton>` | Loading placeholder |
| `<BookButton>` | Primary skeuomorphic CTA |
| `<SocialIcons>` | Footer / contact social row |
| `<VideoFacade>` | Click-to-load YouTube thumbnail (no iframe until clicked) |

---

## 7. Public pages — complete specification

17 public routes. Every one is a Server Component that reads the CMS with a code-level
fallback, and every one exports `generateMetadata()` that reads its `seo.<key>` document.

### 7.0 Route table

| # | Route | Page | SEO key | Data sources |
|---|-------|------|---------|--------------|
| 1 | `/` | Home | `home` | `homepage_order` + ~20 section docs & collections |
| 2 | `/about` | About | `about` | `pagehero.about`, `about_mission`, `about_values`, `mentors` |
| 3 | `/recruitment-process` | 7-Stage Recruitment Journey | `recruitment-process` | `pagehero.recruitment-process`, `journey` |
| 4 | `/exams` | Exam catalogue | `exams` | `pagehero.exams`, `gateways`, `published_exams` |
| 5 | `/exams/[slug]` | Single exam detail ★ | dynamic | `published_exams`, `published_physical_standards` |
| 6 | `/standards` | Physical & Medical Standards | `standards` | `pagehero.standards`, `standards` doc, `published_physical_standards` |
| 7 | `/training-centres` | Training Centres & Recruiting Bodies | `training-centres` | `pagehero.training-centres`, `centres` |
| 8 | `/courses` | Courses & Batches | `courses` | `pagehero.courses`, `courses` doc, `courses_options` |
| 9 | `/eligibility` | Eligibility Finder | `eligibility` | `pagehero.eligibility`, `lib/eligibility.ts` |
| 10 | `/mock-tests` | Free Mock Tests | `mock-tests` | `pagehero.mock-tests`, `published_mock_questions` |
| 11 | `/resources` | Resources Centre | `resources` | `pagehero.resources`, `resource_folders`, `resources` |
| 12 | `/gallery` | Gallery | `gallery` | `pagehero.gallery`, `campus_images`, `toppers`, `officer_banners` |
| 13 | `/selected` | Wall of Selection (full) | `selected` | `pagehero.selected`, `published_selected_candidates` |
| 14 | `/blog` | Blog index | `blog` | `pagehero.blog`, `published_posts` |
| 15 | `/blog/[slug]` | Blog post | dynamic | `published_posts` |
| 16 | `/testimonials` | Testimonials | `testimonials` | `pagehero.testimonials`, `published_testimonials`, videos, Instagram |
| 17 | `/contact` | Contact | `contact` | `pagehero.contact`, `contact_form`, `settings` |

### 7.1 Navigation structure

`lib/data.ts → NAV` is a tree of `NavLink | NavGroup`, consumed by `<Navbar>` (desktop
mega-menu + mobile drawer) and, in flattened form, by `<Footer>`.

```
Home                        →  /
About                       →  /about
Exams  ▾
   ├ All Exams              →  /exams
   ├ Armed Forces (Agniveer)→  /exams?vertical=armed-forces
   ├ CAPF & Police          →  /exams?vertical=capf
   ├ Odisha State           →  /exams?vertical=odisha
   ├ Railways               →  /exams?vertical=railways
   ├ SSC & Central Govt     →  /exams?vertical=ssc
   └ Officer Entries        →  /exams?vertical=officer
Preparation  ▾
   ├ Recruitment Process    →  /recruitment-process
   ├ Physical & Medical     →  /standards
   ├ Eligibility Finder     →  /eligibility
   ├ Free Mock Tests        →  /mock-tests
   ├ Resources & Notes      →  /resources
   └ Training Centres       →  /training-centres
Courses                     →  /courses
Results  ▾
   ├ Wall of Selection      →  /selected
   ├ Gallery                →  /gallery
   └ Testimonials           →  /testimonials
Blog                        →  /blog
Contact                     →  /contact
```

`NavGroup` is distinguished by the `isNavGroup()` type guard (`"items" in entry`).
The navbar renders a tricolour scroll-progress bar across its bottom edge.

---

### 7.2 `/` — Home

The homepage is **not** a fixed composition. It reads the `homepage_order` CMS
document, resolves it against the `HOME_SECTIONS` registry, and renders only the
enabled sections in the admin's chosen order.

```tsx
// app/(site)/page.tsx  (structure)
const SECTION_VIEWS: Record<HomeSectionKey, ReactNode> = {
  exams_marquee:    <ExamsTicker />,
  toppers_marquee:  <ToppersMarquee />,
  wall:             <SelectionWall limit={24} showCta />,
  courses:          <Courses />,
  campus:           <CampusGallery />,
  books:            <BooksSection />,
  mentors:          <Mentors />,
  verticals:        <VerticalsStrip />,
  whyus:            <WhyUs />,
  countdown:        <CountdownStrip />,
  stats:            <StatsStrip />,
  selection_tracker:<SelectionTracker />,
  journey:          <JourneySection />,
  officer_banners:  <OfficerBanners />,
  videos:           <VideosSection />,
  google_reviews:   <GoogleReviews />,
  testimonials:     <Testimonials />,
  instagram:        <InstagramFeed />,
  faq:              <Faq />,
  cta:              <CtaBanner />,
};

export default async function Home() {
  const doc = await getPublished<{ items: unknown }>("homepage_order", { items: [] });
  const order = resolveHomeOrder(doc.items);
  return (
    <main>
      <HeroSection />                                {/* always first, not reorderable */}
      {order.filter(s => s.enabled)
            .map(s => <div key={s.key}>{SECTION_VIEWS[s.key]}</div>)}
    </main>
  );
}
```

`export const dynamic = "force-dynamic"` — the page reads per-request cookies for
preview mode; the CMS reads underneath are cached separately (§16).

#### Section-by-section

| Order | Section key | Component | Content source | What it shows |
|-------|-------------|-----------|----------------|---------------|
| — | *(fixed)* | `<HeroSection>` | `hero` doc, `hero_slides`, `settings` | Badge pill, two heading lines, typewriter rotating words, rich paragraph, rating line, two CTA buttons, photo showcase carousel |
| 1 | `exams_marquee` | `<ExamsTicker>` | `exam_counts` doc | Scrolling band: *"SSC GD Constable — 84 selected"* |
| 2 | `toppers_marquee` | `<ToppersMarquee>` | `toppers` image list | Rank-holder result cards, infinite marquee |
| 3 | `wall` | `<SelectionWall limit={24} showCta>` | `published_selected_candidates` | Photo grid of selected candidates + "See all" CTA → `/selected` |
| 4 | `courses` | `<Courses>` | `courses` doc, `courses_options`, `courses_note` | Batch cards with optional price, features, enrol CTA, facilities note |
| 5 | `campus` | `<CampusGallery>` | `campus_images` | Campus + PET-ground photo carousel |
| 6 | `books` | `<BooksSection>` | `BOOKS` in `lib/data.ts` | Study-material / book cards with buy links |
| 7 | `mentors` | `<Mentors>` | `published_mentors` | Faculty & PT instructor cards (photo, role, specialty, bio) |
| 8 | `verticals` | `<VerticalsStrip>` | `verticals` doc | Six vertical cards with photo, motto, exam chips, link |
| 9 | `whyus` | `<WhyUs>` | `whyus`, `whyus_items` | Heading + six trust cards |
| 10 | `countdown` | `<CountdownStrip>` | `countdown` doc | Live timers to notification / exam / batch dates |
| 11 | `stats` | `<StatsStrip>` | `stats` doc + `recent_wins` | Animated scoreboard plates + recent-wins ticker |
| 12 | `selection_tracker` | `<SelectionTracker>` | `selection_tracker` doc + `published_selections` | Three number cards + bar chart by year |
| 13 | `journey` | `<JourneySection>` | `journey` doc | 7-stage recruitment timeline |
| 14 | `officer_banners` | `<OfficerBanners>` | `officer_banners` image list | "Now Serving" alumni-in-uniform marquee |
| 15 | `videos` | `<VideosSection>` | `resources` rows where `kind='youtube'` | Facade-loaded YouTube grid |
| 16 | `google_reviews` | `<GoogleReviews>` | `google_reviews` doc | Review cards + overall rating + "Review us" link |
| 17 | `testimonials` | `<Testimonials>` | `published_testimonials` | Written testimonial carousel |
| 18 | `instagram` | `<InstagramFeed>` | `settings.instagram` | Embedded Instagram feed |
| 19 | `faq` | `<Faq>` | `published_faqs` | Accordion, rich-text answers |
| 20 | `cta` | `<CtaBanner>` | `cta` doc | Closing call-to-action banner |

Every one of these 20 sections can be **reordered or switched off** from
`/admin/homepage` without a code change.

---

### 7.3 `/about`

| Block | Component | Source |
|-------|-----------|--------|
| Page hero | `<CmsHero>` | `pagehero.about` |
| Mission | `<Story>` | `about_mission` — kicker, title, rich body, photo |
| Core values | value cards | `about_values` repeater — icon, title, body |
| Faculty | `<Mentors>` | `published_mentors` |
| Journey preview | `<Journey compact>` | `journey` |
| Stats | `<StatsStrip>` | `stats` |
| CTA | `<CtaBanner>` | `cta` |

---

### 7.4 `/recruitment-process` — the 7-stage journey

The flagship explainer. Structure mirrors the reference build's `/ssb-process`.

| Block | Source |
|-------|--------|
| Page hero | `pagehero.recruitment-process` |
| Intro paragraph | `journey_intro` doc |
| Stage timeline | `journey` repeater — one panel per stage |
| Per stage | icon · stage label · code chip · colour theme · title · subtitle · **Brief** (rich) · **Our Drill** (rich) · nested `tests[]` (name + detail) |
| Downloadable syllabus CTA | links into `/resources` |
| FAQ | `published_faqs` filtered to process questions |
| CTA | `cta` |

Colour theme per stage uses the vertical tokens (`army` / `navy` / `airforce` /
`capf` / `odisha` / `railway`) so the timeline is visually chaptered.

---

### 7.5 `/exams` and `/exams/[slug]` ★

**`/exams` — catalogue**

| Block | Source |
|-------|--------|
| Page hero | `pagehero.exams` |
| "Where do you stand today?" gateway cards | `gateways` repeater — e.g. *After 8th/10th · After 12th · After Graduation · Already Serving* |
| Vertical filter chips | `published_exams.vertical` (six verticals) |
| Exam cards grid | `published_exams` — name, short name, vertical, qualification, age band, gender, quick standards summary, "View details" |
| Compare strip | height/chest/run at a glance across popular exams |
| CTA | `cta` |

The filter is a URL search param (`?vertical=capf`) so it is linkable from the navbar
mega-menu and shareable.

**`/exams/[slug]` — single exam detail ★ new**

Generated from the `exams` table. Each page carries:

| Block | Field(s) |
|-------|----------|
| Hero | `name`, `short_name`, `vertical`, `banner_path` |
| Overview | `intro` (rich HTML) |
| Eligibility | `qualification`, `age_min`, `age_max`, `gender`, `marital_status`, `domicile` |
| Exam pattern | `pattern` (rich) — subjects, marks, duration, negative marking |
| Syllabus | `syllabus` (rich) |
| Physical standards | joined rows from `published_physical_standards` where `exam_id` matches |
| Selection process | `stages` (tags) mapped onto the 7-stage journey |
| Salary & career | `salary` (rich) |
| Important dates | `notification_month`, `exam_month` |
| Official link | `official_url` |
| Our course for this exam | link into `/courses` |
| Selected candidates in this exam | `published_selected_candidates` filtered by `exam` |
| Related blog posts | `published_posts` filtered by `tag` |
| Enquiry CTA | opens the enquiry modal pre-filled with this exam |

`generateStaticParams()` pre-renders published exams; `generateMetadata()` builds the
title/description from the row (falling back to a template).

---

### 7.6 `/courses`

| Block | Source |
|-------|--------|
| Page hero | `pagehero.courses` |
| Course / batch cards | `courses` doc repeater |
| Price visibility | `courses_options.showPrices` — `"on"` shows price, `"off"` shows *"Enquire for fees"* |
| Facilities note | `courses_note` |
| Batch cadence | `BATCH_INFO` in `lib/data.ts` |
| Enrol buttons | `settings.enrollOffline` / `settings.enrollOnline` (payment links) |
| FAQ | `published_faqs` |
| CTA | `cta` |

**Suggested batch structure for Samantroy:**

| Batch | Focus | Mode |
|-------|-------|------|
| Complete Selection Batch | Written (CBT) + PST/PET ground training + medical guidance | Offline, residential option |
| Written-Only Batch | CBT / CEE subjects: GK, Maths, Reasoning, Science, English, Odia | Offline + online |
| Physical-Only Batch | Daily ground training — run, jump, beam, ditch, balance | Offline, early morning |
| Online Live Batch | Live classes + recorded backup + test series | Online |
| Test Series / Crash Course | Full-length mocks close to exam date | Online + offline |
| Officer Entry (NDA/CDS/AFCAT + SSB) | Written + SSB interview prep | Offline + online |

Each card carries: title, tag, duration, mode, price, `features[]`, highlight flag,
and a CTA.

---

### 7.7 `/standards` — Physical & Medical Standards

The domain-critical page. Replaces the reference build's `/medical` and absorbs PST/PET.

| Block | Source |
|-------|--------|
| Page hero | `pagehero.standards` |
| Process intro | `standards.processTitle` / `processIntro` |
| Stage cards | `standards.stages` repeater — PST → PET → DME → RME |
| **PST table** | `published_physical_standards` — height, chest unexpanded, chest expanded, weight, per force / category / gender |
| **PET table** | same table — run distance & timing, long jump, high jump, beam/pull-ups, ditch, zig-zag |
| **★ Standards Calculator** | Client component: select force + post + gender + category + state/district → returns the exact required numbers, with relaxations applied |
| Photos | `standards.image1`, `standards.image2` |
| Common rejection reasons | `standards.common` (tags) |
| Medical standards | `standards.medical` repeater — vision, dental, flat foot, knock knees, varicocele, tattoo policy, hearing, BMI |
| Appeal process | `standards.appealTitle` / `appealBody` — DME → RME → AME |
| Medical & physical FAQs | `standards.faqs` repeater |
| CTA | `cta` |

The calculator is pure client-side logic reading the same `published_physical_standards`
rows the tables render — no API round trip, no extra endpoint.

---

### 7.8 `/training-centres`

| Block | Source |
|-------|--------|
| Page hero | `pagehero.training-centres` |
| Heading | `centres.kicker` / `title` / `subtitle` |
| Centre cards | `centres.items` repeater |
| Per centre | short name · full name · motto · location · service & branch · established · photo · intro (rich) · `courses[]` (name, duration, who trains here) · `highlights[]` (tags) |

**Centres to cover:** Army Recruiting Offices in Odisha (ARO Cuttack / Gopalpur),
INS Chilka (Navy sailor training, in Odisha — a strong local hook), Air Force BTI
Belagavi, BSF Academy Tekanpur, CISF RTC, CRPF Academy, ITBP Academy, Biju Patnaik
State Police Academy Bhubaneswar, RRB Bhubaneswar zone, RPF training centres.

---

### 7.9 `/eligibility` — Eligibility Finder

A short quiz that returns matching exams and captures a lead.

**Inputs** (extended from the reference build):

| Field | Type | Note |
|-------|------|------|
| Age | number | as on a reference date |
| Gender | `male` / `female` | |
| Marital status | `unmarried` / `married` | |
| Education | `8th` · `10th` · `10+2 (Science)` · `10+2 (Other)` · `ITI/Diploma` · `Graduate` | ★ extended |
| Height (cm) | number | ★ new — gates most other-rank entries |
| Chest (cm, unexpanded) | number | ★ new — male entries |
| Category | `UR` · `OBC` · `SC` · `ST` · `Ex-serviceman` | ★ new — drives relaxations |
| Domicile | `Odisha` / `Other state` | ★ new — gates state exams |

**Engine** — `lib/eligibility.ts` exports `findEligible(input): Entry[]`, a pure
function over a rules array. Pure logic, so it is unit-tested with `node --test`
(`lib/eligibility.test.ts`).

**Output** — a ranked list of eligible exams, each linking to `/exams/[slug]`, plus a
"near miss" list explaining exactly which criterion failed (e.g. *"2 cm short of the
SSC GD height requirement for your category"*). Below it, a lead form posting to
`/api/lead` with `source: "eligibility"` and the full quiz answers in `meta`.

---

### 7.10 `/mock-tests` — Free Mock Tests

| Block | Source |
|-------|--------|
| Page hero | `pagehero.mock-tests` |
| Subject / exam filter | `published_mock_questions.subject` / `.exam` ★ |
| Quiz | `<MockQuiz>` client component |
| Scoring | POST `/api/mock/score` — **server-side** |
| Result | Score, per-question correctness, explanation, negative-marking breakdown |
| Lead capture | POST `/api/lead` with `source: "mock_test"` |
| CTA | `cta` |

**Security-critical:** the public view `published_mock_questions` **excludes** the
`answer` and `explanation` columns, so the correct answers are never in the network
tab before submission. Scoring happens server-side with the service-role client.

**Subjects** (replacing OIR / SRT): General Knowledge · Mathematics · General Science ·
Reasoning · English · **Odia** · Computer Awareness · Current Affairs.

---

### 7.11 `/resources`

| Block | Source |
|-------|--------|
| Page hero | `pagehero.resources` |
| Folder tree | `resource_folders` (self-referencing `parent_id`) |
| Files | `resources` where `kind='file'` — PDF, image, doc; downloadable from Storage |
| Videos | `resources` where `kind='youtube'` — title + thumbnail + link |
| Browser UI | `<ResourceBrowser>` — breadcrumb navigation, folder drill-down |

Public read is open (anon `select` policy) so any visitor can browse and download.
The **same** `kind='youtube'` rows feed the homepage `<VideosSection>` via
`lib/videos.ts → getSiteVideos()`, so the admin maintains one list, not two.

---

### 7.12 `/gallery`

| Block | Source |
|-------|--------|
| Page hero | `pagehero.gallery` |
| Wall of Selection preview | `published_selected_candidates` |
| Top-rank cards | `toppers` image list |
| "Now Serving" banners | `officer_banners` image list |
| Campus & ground photos | `campus_images` |
| Lightbox | `<PhotoCarousel>` |

---

### 7.13 `/selected` — full Wall of Selection

| Block | Source |
|-------|--------|
| Page hero | `pagehero.selected` |
| Filters | year · exam · force |
| Grid | `published_selected_candidates`, ordered `selected_on DESC NULLS LAST, sort_order ASC` |
| Card | photo, name, exam, post, force, date of selection |
| Count strip | totals by exam |

---

### 7.14 `/blog` and `/blog/[slug]`

| Block | Source |
|-------|--------|
| Index hero | `pagehero.blog` |
| Post list | `published_posts` — cover, title, excerpt, tag, author, date |
| Tag filter | `posts.tag` |
| Detail | `published_posts` by `slug` — cover, title, sanitized rich `body`, author, date |
| Related | same `tag` |
| Article JSON-LD | on the detail page |

Publishing rule (enforced by the view): a post is public only when
`published = true` **and** (`published_at IS NULL` **or** `published_at <= now()`),
which gives date-gated publishing for free.

---

### 7.15 `/testimonials`

| Block | Source |
|-------|--------|
| Page hero | `pagehero.testimonials` |
| Written testimonials | `published_testimonials` |
| Video testimonials | YouTube rows from `resources` |
| Google reviews | `google_reviews` |
| Instagram | `<InstagramFeed>` |
| CTA | `cta` |

---

### 7.16 `/contact`

| Block | Source |
|-------|--------|
| Page hero | `pagehero.contact` |
| Contact form | `<ContactForm>` driven by the `contact_form` doc |
| Contact details | `settings` — phone(s), WhatsApp, email, address |
| Map | `mapEmbedSrc(settings)` — pulls `@lat,lng` out of the saved Maps URL so the pin sits exactly where the admin dropped it, falling back to an address query |
| Directions link | `mapHref(settings)` |
| Socials | `<SocialIcons>` |
| Office hours | `settings` |

The form is **fully configurable from the admin panel** — every label, placeholder,
required flag, visibility toggle and dropdown option list. `/api/contact` validates
against the *same* document, so hiding a field can never cause a server-side
"field is required" rejection.

---

## 8. Component inventory

### 8.1 Public components (~55)

**Layout & chrome**

| Component | Client? | Purpose |
|-----------|---------|---------|
| `Navbar` | ✓ | Sticky header, mega-menu, mobile drawer, tricolour scroll-progress bar |
| `Footer` | — | Nav columns, contact block, socials, brochure link, legal line |
| `Preloader` / `PreloaderSection` | ✓ / — | Lottie + wordmark on first load; CMS-toggleable |
| `Cursor` | ✓ | Custom dot + easing ring; desktop only |
| `ModalProvider` | ✓ | Context for the auto-popup enquiry modal (once per session) |
| `WhatsAppButton` | ✓ | Floating WhatsApp CTA |
| `CallButton` | ✓ | Floating tel: CTA |
| `ChatBot` | ✓ | Guided-answer widget + brochure download |
| `BackToTop` | ✓ | Scroll-to-top |
| `PreviewBar` | ✓ | Admin-only bar on the live site: "you are viewing drafts", click-to-edit |
| `PageViewTracker` | ✓ | Calls the `track_view` RPC once per route change |
| `Skeleton` | — | Loading placeholder |

**Homepage & shared sections**

| Component | Purpose |
|-----------|---------|
| `HeroSection` → `Hero` | Server wrapper reads CMS; client renders typewriter + parallax |
| `HeroShowcase` | Passing-out photo carousel with academy/term captions |
| `ExamsTicker` | Exam + selected-count marquee *(was `EntriesTicker`)* |
| `ToppersMarquee` | Rank-holder cards *(was `Air1Marquee`)* |
| `SelectionWall` | Selected-candidate photo grid *(was `StudentWall`)* |
| `RecommendedWall` → `SelectionWallFull` | Full filterable wall for `/selected` |
| `Courses` | Batch cards with CMS price toggle |
| `CampusGallery` | Campus / ground photo carousel |
| `BooksSection` | Study-material cards |
| `Mentors` | Faculty & PT instructor cards |
| `VerticalsStrip` | Six vertical cards *(was `ServicesStrip`)* |
| `WhyUs` | Trust cards |
| `CountdownStrip` → `CountdownTicker` | Live countdown timers |
| `StatsStrip` → `CountUp` / `Counter` | Animated scoreboard |
| `SelectionTracker` | Number cards + bar chart |
| `JourneySection` → `Journey` | 7-stage timeline |
| `OfficerBanners` | "Now Serving" marquee |
| `VideosSection` → `YouTubeGrid` → `VideoFacade` | Click-to-load YouTube grid |
| `GoogleReviews` | Review cards + aggregate rating |
| `Testimonials` → `TestimonialsCarousel` | Written testimonials |
| `InstagramFeed` | Embedded feed |
| `Faq` → `FaqAccordion` | Accordion with rich answers |
| `CtaBannerSection` → `CtaBanner` | Closing CTA |
| `AchievementCards` | Result / achievement tiles |
| `Story` / `StorySection` | Narrative block with photo |
| `ServicesStrip` | *(renamed to `VerticalsStrip`)* |

**Interactive tools**

| Component | Purpose |
|-----------|---------|
| `EligibilityFinder` | The quiz + results + lead form |
| `StandardsCalculator` ★ | PST/PET requirement lookup |
| `MockQuiz` | Timed MCQ runner + server-scored result |
| `ResourceBrowser` | Folder tree + file/video browser |
| `ContactForm` | CMS-configurable enquiry form |
| `ContactSection` | Form + details + map composite |
| `PhotoCarousel` | Lightbox gallery |

**Primitives**

`SectionHeading` · `CmsSectionHeading` · `PageHero` · `CmsHero` · `Reveal` ·
`CountUp` · `Counter` · `BookButton` · `SocialIcons` · `VideoFacade` · `Skeleton`

### 8.2 Admin components (~30)

| Component | Purpose |
|-----------|---------|
| `Sidebar` | Nav with role filtering (`superOnly` items hidden from plain admins) |
| `AdminSessionGuard` | Client watchdog — redirects to `/admin/login` when the session dies |
| `AdminNotConfigured` | Friendly screen when Supabase env is missing |
| `SignOutButton` | Ends the session |
| `RecordManager` | **Generic CRUD** for any collection table: add/edit/delete, reorder, publish toggle, image upload with crop |
| `SectionEditor` | **Universal section editor** driven by the field schema in `lib/sections.ts` — text, rich, image, tags, select, nested repeaters; autosave, publish, rollback |
| `RichText` | Rich-text editor: bold/italic/underline, font family, size, colour, highlight, alignment, link, tricolour word-art presets |
| `ImageCropper` + `useImageCropper` + `CropFileInput` | Aspect-locked crop with pan/zoom, driven by pure maths in `lib/crop.ts` |
| `MediaLibrary` | Upload, browse, copy-path, delete Storage objects |
| `ImageListManager` | Ordered image lists (campus, toppers, banners) |
| `HeroSlidesManager` | Hero showcase slides with captions |
| `HomeOrderManager` | Drag/reorder + enable/disable homepage sections |
| `CandidatesManager` | Selected candidates (adds bulk import + date-of-selection) |
| `TestimonialsManager` | *(via `RecordManager`)* |
| `MentorsManager` | *(via `RecordManager`)* |
| `ExamsManager` ★ | Exam catalogue CRUD with vertical filter and slug generation |
| `StandardsManager` ★ | PST/PET benchmark rows, grouped by force |
| `SelectionsManager` | Year / exam / centre counts for the tracker |
| `CoursesManager` | Batch cards |
| `VerticalsManager` | Six vertical cards *(was `FourForcesManager`)* |
| `BlogManager` | Posts with cover, rich body, tag, slug, publish date |
| `MockManager` | Question bank with options, answer index, explanation, subject |
| `ResourcesManager` | Folders, file uploads, YouTube link import |
| `EnquiryInbox` | CRM pipeline: status, notes, filters, CSV export |
| `ContactFormManager` | Field labels, required, visibility, dropdown option lists |
| `CountdownEditor` | Items + colour pickers for background / text / kicker |
| `StatsEditor` | Scoreboard plates (value, label, suffix) |
| `SettingsEditor` | Footer & contact settings |
| `SeoEditor` | Per-page title/description with a live Google-result preview |
| `GoogleReviewsManager` | Places API import + manual entry |
| `CreateAdminForm` | Super-admin: add a new admin |
| `UserActions` | Promote / demote / remove admins |
| `ChangePasswordForm` | Self-service password change |

**The two components that carry the CMS.** `RecordManager` and `SectionEditor` are
schema-driven — adding a new collection or a new editable section is a **data**
change (one entry in `lib/sections.ts` or one new admin page passing a `fields`
array), not new UI code. Preserve this property; it is what makes the panel
maintainable.

---

## 9. Content architecture

This is the heart of the system. Understand this section and the rest follows.

### 9.1 The flow

```
   ┌──────────────┐   edit    ┌───────────┐  publish  ┌─────────────┐   read   ┌──────────────┐
   │ Admin panel  │──────────▶│  draft    │──────────▶│  published  │─────────▶│ Public site  │
   │ /admin/...   │  autosave │  (JSONB)  │  snapshot │   (JSONB)   │  cached  │              │
   └──────────────┘           └───────────┘     │     └─────────────┘          └──────────────┘
          │                         ▲            │            ▲                        ▲
          │                         │            ▼            │                        │
          │                         │     ┌──────────────┐    │                 ┌──────────────┐
          │                         └─────│content_      │────┘                 │ lib/data.ts  │
          │                    rollback   │versions      │                      │  DEFAULTS    │
          │                               └──────────────┘                      └──────────────┘
          │                                                                            ▲
          └─── sa-preview cookie ──▶ admin sees DRAFT on the live site ─────────────────┘
                                                                        fallback when empty
```

Three guarantees fall out of this design:

1. **The public site can never break.** Every read falls back to a hard-coded default
   in `lib/data.ts`. No Supabase, no row, empty document, malformed JSON — the page
   still renders.
2. **Nothing is public until Publish.** Editing writes only `draft`. The public site
   reads `published`.
3. **Every publish is reversible.** The previous `published` value is snapshotted into
   `content_versions` before being overwritten.

### 9.2 Two content shapes

| Shape | Storage | Read helper | Used for |
|-------|---------|-------------|----------|
| **Singleton document** | one `site_content` row, keyed by name, with `draft` + `published` JSONB | `getPublished(key, fallback)` | Hero, headings, journey, standards, settings, SEO, countdown, homepage order — anything that exists exactly once |
| **Collection** | one row per item in a dedicated table, with a `published` boolean | `getCollection(view, fallback, opts)` | Selected candidates, testimonials, mentors, FAQs, posts, selections, mock questions, exams, standards, resources |

Collections are read by anon users through `published_*` **views** that filter
`published = true` and drop private columns. Anonymous users never touch the base tables.

### 9.3 `lib/content.ts` — the read layer

```ts
export const CMS_REVALIDATE = 300;   // seconds
export const CMS_TAG = "cms";        // revalidateTag target

// Cached, cookie-free fetch of one published document.
const fetchPublishedDoc = unstable_cache(
  async (key: string) => {
    const supabase = createPublicClient();          // anon, no cookies → cacheable
    const { data, error } = await supabase
      .from("published_content").select("published")
      .eq("key", key).maybeSingle();
    return error || !data?.published ? null : data.published;
  },
  ["cms-doc"],
  { revalidate: CMS_REVALIDATE, tags: [CMS_TAG] },
);

export async function getPublished<T>(key: string, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    if (await isPreview()) {                        // admin previewing drafts
      const supabase = await createClient();        // cookie-bound; RLS limits to admins
      const { data } = await supabase.from("site_content")
        .select("draft").eq("key", key).maybeSingle();
      if (data?.draft && Object.keys(data.draft).length)
        return deepSanitize(coerceShape({ ...fallback, ...data.draft }, fallback));
    }
    const published = await fetchPublishedDoc(key);
    if (!published || !Object.keys(published).length) return fallback;
    return deepSanitize(coerceShape({ ...fallback, ...published }, fallback));
  } catch {
    return fallback;                                // never throw at render time
  }
}
```

Five things happen on every read, in order:

| # | Step | Why |
|---|------|-----|
| 1 | **Config gate** — `isSupabaseConfigured()` | Site works before the CMS exists |
| 2 | **Preview branch** — `sa-preview` cookie → read `draft` | Admins see unpublished work; never cached (per-admin, must be instant) |
| 3 | **Cached published read** | One `unstable_cache` entry per key, 300 s, tagged `cms` |
| 4 | **Merge over the fallback** — `{ ...fallback, ...published }` | A document saved before a field existed still renders that field |
| 5 | **`coerceShape` then `deepSanitize`** | Structural safety, then XSS safety |

### 9.4 `coerceShape` — structural safety

The admin editor can legitimately save a list field as `""` (a repeater row added but
never filled). Calling `.map()` on that would crash the render. `coerceShape` uses the
fallback as a schema: wherever the fallback says "array" but the stored value is not
one, it substitutes an empty array — recursing through `fallback[0]` to cover nested
repeaters (exam → standards → rows, journey → stage → tests).

Pure and dependency-free, so it is importable from server *and* client code, and unit-
tested in `lib/shape.test.ts`.

### 9.5 `deepSanitize` — XSS safety

Rich-text fields are rendered with `dangerouslySetInnerHTML`. `deepSanitize` walks the
whole payload and runs every string through `lib/sanitize.ts`, which strips:

- `<script>`, `<iframe>`, `<object>`, `<embed>`
- inline `on*` event-handler attributes
- `javascript:` and `data:` URLs
- anything outside the allow-list of tags and attributes

Applied **once, in the content layer**, so every downstream consumer is safe by
construction. An admin cannot XSS the site even if their account is compromised.

### 9.6 `getCollection` — the collection reader

```ts
export async function getCollection<T>(
  view: string,
  fallback: T[],
  opts?: {
    limit?: number;                                              // fetch only what renders
    order?: { column: string; ascending?: boolean; nullsFirst?: boolean }[];
    columns?: string;                                            // fetch only rendered columns
  },
): Promise<T[]>
```

`limit` and `columns` exist for egress control: the homepage wall renders 24 tiles, so
it fetches 24 rows with 4 columns — not the whole table with every column.

### 9.7 Preview mode

| Piece | Behaviour |
|-------|-----------|
| Cookie | `sa-preview=1`, path `/`, `SameSite=Lax` |
| Set by | `SectionEditor` on mount; cleared on unmount |
| Effect | `getPublished` reads `draft` instead of `published` |
| Safety | RLS on `site_content` restricts draft reads to admins — a non-admin who forges the cookie silently gets published content |
| Surfacing | `<PreviewBar>` shows a banner on the live site with a "you are viewing drafts" notice and click-to-edit links |
| Live preview | `SectionEditor` renders `previewPath` in a device-framed iframe (mobile / tablet / desktop) — this is why the CSP uses `frame-ancestors 'self'` and `X-Frame-Options: SAMEORIGIN` rather than `DENY` |

### 9.8 Cache invalidation

Publishing writes to Postgres, but the site holds a 300-second `unstable_cache` entry.
To make a publish appear immediately:

```
Admin clicks Publish
   → SectionEditor writes site_content.published
   → bustCmsCache()  →  POST /api/admin/revalidate
        → re-authenticates + re-checks admin role
        → revalidateTag(CMS_TAG, { expire: 0 })
   → next request re-reads from Postgres
```

Fire-and-forget: a failure here means the change appears within 5 minutes instead of
instantly, so it must never block or fail the save the admin just made.

### 9.9 The fallback chain, in one line

```
draft (preview only) → published (cached 300 s) → lib/data.ts default → empty-but-valid shape
```

At no point in that chain can the public site throw.

---

## 10. Database schema

Supabase Postgres. **19 tables · 10 views · 2 schemas · 4 functions · 2 triggers ·
1 storage bucket.**

Migrations are ordered and idempotent (`create table if not exists`,
`drop policy if exists` before `create policy`) so they can be re-run safely.

### 10.0 Migration order

| File | Contents |
|------|----------|
| `0001_cms_init.sql` | `private` schema, `profiles`, `site_content`, `selected_candidates`, `testimonials`, `mentors`, `media`, `activity_log`, auth helpers, RLS, grants, storage bucket |
| `0002_seed.sql` | Seed `site_content` documents from the code defaults |
| `0003_versions.sql` | `content_versions` (rollback) |
| `0004_faqs.sql` | `faqs` + `published_faqs` |
| `0005_security.sql` | `pending` role, least-privilege signup trigger, last-super-admin guard |
| `0006_features.sql` | `enquiries`, `posts`, `selections`, `mock_questions`, `page_view_daily` + `track_view()` |
| `0007_seed_mock.sql` | Starter mock questions |
| `0008_role_locks.sql` | Advisory lock to serialise super-admin count decisions |
| `0009_selected_on.sql` | `selected_on` date on selected candidates |
| `0010_resources.sql` | `resource_folders`, `resources` |
| `0011_exams.sql` ★ | `exams` + `published_exams` |
| `0012_standards.sql` ★ | `physical_standards` + `published_physical_standards` |
| `0013_mock_subjects.sql` ★ | `subject`, `exam_id`, `marks`, `negative_marks` on `mock_questions` |
| `0014_contact_details.sql` | Post-launch settings corrections (pattern for future data fixes) |

### 10.1 `private` schema — authorization helpers

Kept out of the Data API so PostgREST can never expose them.

```sql
create schema if not exists private;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('admin','super_admin')
  );
$$;

create or replace function private.is_super_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'super_admin'
  );
$$;
```

`security definer` + `set search_path = ''` is deliberate: the function runs as its
owner (so it can read `profiles` regardless of the caller's RLS) but cannot be
hijacked by a caller-controlled `search_path`. **Every write policy in the database
calls one of these two functions.** Roles are never read from user-editable JWT
metadata.

### 10.2 `profiles` — admin accounts

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | FK → `auth.users(id)` `on delete cascade` |
| `email` | `text` | Mirrored from the auth user |
| `full_name` | `text` | |
| `role` | `text` NOT NULL default `'admin'` | `check (role in ('pending','admin','super_admin'))` |
| `created_at` | `timestamptz` default `now()` | |

**Policies**

```sql
-- A user reads their own profile; super-admins read all (for user management).
create policy "profiles_select" on public.profiles
  for select to authenticated
  using ( id = (select auth.uid()) or private.is_super_admin() );

-- Only super-admins may change roles / manage profile rows.
create policy "profiles_write" on public.profiles
  for all to authenticated
  using ( private.is_super_admin() ) with check ( private.is_super_admin() );
```

**Trigger — new-user handling (least privilege + race-safe)**

```sql
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtext('samantroy_role_guard')::bigint);
  insert into public.profiles (id, email, role)
  values (
    new.id, new.email,
    case when (select count(*) from public.profiles) = 0
         then 'super_admin' else 'pending' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
```

The **first** user bootstraps as `super_admin`; every later self-service signup lands
as `pending`, which has **no** access — `private.is_admin()` matches only
`admin`/`super_admin`. Admins are minted only by a super-admin through the service-role
API route. The advisory lock stops two concurrent first-signups from both becoming
super-admin.

**Trigger — last-super-admin protection**

```sql
create or replace function private.protect_last_super_admin()
returns trigger language plpgsql security definer set search_path = '' as $$
declare supers int;
begin
  perform pg_advisory_xact_lock(hashtext('samantroy_role_guard')::bigint);
  if (tg_op = 'DELETE') then
    if old.role = 'super_admin' then
      select count(*) into supers from public.profiles where role = 'super_admin';
      if supers <= 1 then raise exception 'Cannot remove the last super admin.'; end if;
    end if;
    return old;
  end if;
  if old.role = 'super_admin' and new.role <> 'super_admin' then
    select count(*) into supers from public.profiles where role = 'super_admin';
    if supers <= 1 then raise exception 'Cannot demote the last super admin.'; end if;
  end if;
  return new;
end;
$$;

create trigger trg_protect_last_super_admin
  before update or delete on public.profiles
  for each row execute function private.protect_last_super_admin();
```

The same advisory lock serialises the count so two concurrent demotions cannot both
succeed and leave the project with zero super-admins.

### 10.3 `site_content` — singleton documents

| Column | Type | Notes |
|--------|------|-------|
| `key` | `text` PK | e.g. `hero`, `settings`, `seo.home`, `pagehero.exams` |
| `label` | `text` | Human name shown in the admin |
| `draft` | `jsonb` NOT NULL default `'{}'` | Work in progress |
| `published` | `jsonb` NOT NULL default `'{}'` | Live content |
| `updated_at` | `timestamptz` default `now()` | |
| `updated_by` | `uuid` | FK → `auth.users(id)` |

```sql
create policy "content_admin_all" on public.site_content
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

-- Anon reads PUBLISHED only, through a view that hides the draft column.
create or replace view public.published_content as
  select key, published from public.site_content;
```

The draft column is **structurally invisible** to anonymous users — not filtered by a
policy that could be misconfigured, but absent from the view they are granted.

### 10.4 `selected_candidates` — Wall of Selection

*(the reference build: `recommended_candidates`)*

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK default `gen_random_uuid()` | |
| `name` | `text` NOT NULL | |
| `exam` | `text` NOT NULL | e.g. `SSC GD Constable` |
| `post` | `text` | ★ e.g. `Constable (GD) — CRPF` |
| `force` | `text` | ★ `Army` · `Navy` · `Air Force` · `CAPF` · `Odisha Police` · `Railways` |
| `year` | `int` | ★ selection year, for filtering |
| `image_path` | `text` | Storage path in the media bucket |
| `selected_on` | `date` | Orders the wall latest-first; NULLs sort last |
| `sort_order` | `int` NOT NULL default `0` | |
| `published` | `boolean` NOT NULL default `true` | |
| `created_at` | `timestamptz` default `now()` | |

```sql
create policy "candidates_admin_all" on public.selected_candidates
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

create or replace view public.published_selected_candidates as
  select id, name, exam, post, force, year, image_path, sort_order, selected_on
  from public.selected_candidates where published = true;
```

### 10.5 `testimonials`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `name` | `text` NOT NULL | |
| `rank` | `text` | Post / force achieved |
| `body` | `text` NOT NULL | Rich HTML |
| `image_path` | `text` | |
| `sort_order` | `int` default `0` | |
| `published` | `boolean` default `true` | |
| `created_at` | `timestamptz` | |

View: `published_testimonials` (id, name, rank, body, image_path, sort_order).

### 10.6 `mentors` — Faculty & Physical Trainers

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `name` | `text` NOT NULL | |
| `role` | `text` | e.g. *Ex-Havildar, Indian Army* |
| `specialty` | `text` | e.g. *PET Ground Training* · *Mathematics & Reasoning* |
| `bio` | `text` | Rich HTML |
| `image_path` | `text` | |
| `sort_order` | `int` default `0` | |
| `published` | `boolean` default `true` | |
| `created_at` | `timestamptz` | |

View: `published_mentors`.

### 10.7 `media` — media library metadata

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `path` | `text` NOT NULL | Storage object path |
| `alt` | `text` | |
| `width` / `height` | `int` | |
| `uploaded_by` | `uuid` | FK → `auth.users(id)` |
| `created_at` | `timestamptz` | |

Admin-only (`private.is_admin()`); the files themselves live in Storage and are
publicly readable.

### 10.8 `activity_log` — audit trail

| Column | Type | Notes |
|--------|------|-------|
| `id` | `bigint` identity PK | |
| `actor` | `uuid` | FK → `auth.users(id)` |
| `actor_email` | `text` | Denormalised so the log survives user deletion |
| `action` | `text` NOT NULL | `publish` · `rollback` · `create_admin` · `user_remove` … |
| `target` | `text` | `section:hero` · an email · a user id |
| `created_at` | `timestamptz` | |

Admins may `select` and `insert`; **no update or delete policy exists**, so the trail
is append-only from the application's perspective.

### 10.9 `content_versions` — rollback snapshots

| Column | Type | Notes |
|--------|------|-------|
| `id` | `bigint` identity PK | |
| `key` | `text` NOT NULL | The `site_content` key |
| `snapshot` | `jsonb` NOT NULL | The **previously** published document |
| `created_at` | `timestamptz` | |
| `created_by` | `uuid` | |

On Publish, the current `published` value is inserted here *before* being overwritten.
Rollback reads the newest snapshot for the key, restores it into both `published` and
`draft`, then deletes that snapshot row — so repeated rollbacks walk back through
history.

### 10.10 `faqs`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK · `question` `text` NOT NULL · `answer` `text` NOT NULL (rich HTML) · `sort_order` `int` · `published` `boolean` · `created_at` | |

View: `published_faqs`.

### 10.11 `enquiries` — lead CRM

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `name` | `text` NOT NULL | |
| `email` | `text` NOT NULL | Blank string when the form hides the email field |
| `phone` | `text` | Stored as `+91XXXXXXXXXX` |
| `entry` | `text` | Target exam |
| `message` | `text` | |
| `source` | `text` NOT NULL default `'contact_form'` | `contact_form` · `eligibility` · `mock_test` |
| `status` | `text` NOT NULL default `'new'` | `check (status in ('new','contacted','enrolled','dropped'))` |
| `notes` | `text` | Internal follow-up notes |
| `meta` | `jsonb` NOT NULL default `'{}'` | Quiz answers, batch preference, score |
| `created_at` | `timestamptz` | |

```sql
create policy "enquiries_admin_all" on public.enquiries
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );
```

**There is deliberately no anon insert policy.** Leads are inserted server-side with
the service-role client (`lib/enquiries.ts`), which bypasses RLS. This means the
public can submit leads but can never *read* them, and cannot flood the table by
calling PostgREST directly.

### 10.12 `posts` — blog

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `slug` | `text` NOT NULL **unique** | |
| `title` | `text` NOT NULL | |
| `excerpt` | `text` | |
| `cover_path` | `text` | |
| `body` | `text` NOT NULL default `''` | Rich HTML |
| `tag` | `text` | |
| `author` | `text` | |
| `published` | `boolean` default `false` | |
| `published_at` | `timestamptz` | Date-gated publishing |
| `created_at` / `updated_at` | `timestamptz` | |

```sql
create or replace view public.published_posts as
  select id, slug, title, excerpt, cover_path, body, tag, author, published_at
  from public.posts
  where published = true and (published_at is null or published_at <= now());
```

### 10.13 `selections` — results tracker

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK · `year` `int` NOT NULL · `exam` `text` NOT NULL · `center` `text` (SSB centre → **district / force**) · `count` `int` default `1` · `sort_order` `int` · `published` `boolean` · `created_at` | |

View: `published_selections`. Feeds the homepage bar chart and the three number cards.

### 10.14 `mock_questions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `type` | `text` default `'MCQ'` | `check (type in ('MCQ','TF'))` ★ *(was OIR/SRT)* |
| `subject` | `text` ★ | `GK` · `Maths` · `Science` · `Reasoning` · `English` · `Odia` · `Computer` · `Current Affairs` |
| `exam_id` | `uuid` ★ | FK → `exams(id)` `on delete set null` — scope a question to one exam |
| `question` | `text` NOT NULL | |
| `options` | `jsonb` NOT NULL default `'[]'` | `string[]` |
| `answer` | `int` | Index into `options` |
| `explanation` | `text` | |
| `difficulty` | `text` default `'medium'` | `easy` · `medium` · `hard` |
| `marks` | `numeric` default `1` ★ | |
| `negative_marks` | `numeric` default `0.25` ★ | Matches real CBT marking |
| `sort_order` | `int` · `published` `boolean` · `created_at` | |

```sql
-- The public view HIDES answer & explanation so the quiz cannot be read from
-- the network tab. Scoring happens server-side in /api/mock/score.
create or replace view public.published_mock_questions as
  select id, type, subject, exam_id, question, options, difficulty,
         marks, negative_marks, sort_order
  from public.mock_questions where published = true;
```

### 10.15 `page_view_daily` — privacy-friendly analytics

| Column | Type | Notes |
|--------|------|-------|
| `path` | `text` | PK part 1 |
| `day` | `date` | PK part 2 |
| `views` | `int` default `0` | |

No IPs, no cookies, no user agents, no per-visitor rows — just a daily counter per
path. Nothing personal is stored, so there is no consent banner to build.

```sql
-- Anonymous visitors increment counts ONLY through this SECURITY DEFINER RPC,
-- which validates and normalises the path. No direct table write is exposed.
create or replace function public.track_view(p text)
returns void language plpgsql security definer set search_path = '' as $$
declare clean text;
begin
  clean := split_part(split_part(coalesce(p,'/'), '?', 1), '#', 1);
  if clean = '' or left(clean,1) <> '/' then clean := '/'; end if;
  if length(clean) > 120 then clean := left(clean,120); end if;
  insert into public.page_view_daily (path, day, views)
  values (clean, current_date, 1)
  on conflict (path, day) do update
    set views = public.page_view_daily.views + 1;
end;
$$;

grant execute on function public.track_view(text) to anon, authenticated;
```

The function strips query strings and fragments, rejects anything that is not a
same-origin path, and caps the length — so a visitor cannot poison the table with
arbitrary rows. Only admins may `select` from it.

### 10.16 `resource_folders` & `resources`

**`resource_folders`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK · `name` `text` NOT NULL · `parent_id` `uuid` FK → self `on delete cascade` (nesting) · `sort_order` `int` · `created_at` | |

**`resources`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `folder_id` | `uuid` | FK → `resource_folders(id)` `on delete cascade` |
| `kind` | `text` NOT NULL default `'file'` | `check (kind in ('file','youtube'))` |
| `title` | `text` NOT NULL | |
| `path` | `text` | Storage path (files) |
| `url` | `text` | External URL (YouTube) |
| `mime` | `text` | `application/pdf`, `image/png`, … |
| `thumbnail` | `text` | YouTube thumbnail URL |
| `sort_order` | `int` · `created_at` | |

Unlike the other collections these have an **open public read policy** (not a
`published_*` view) because the resources centre is meant to be browsed by everyone:

```sql
create policy "rf_public_read" on public.resource_folders
  for select to anon, authenticated using ( true );
create policy "res_public_read" on public.resources
  for select to anon, authenticated using ( true );
```

The same `kind='youtube'` rows feed the homepage video grid — one list, two surfaces.

### 10.17 `exams` ★ new

The exam catalogue. Promoted from a JSON repeater because it needs per-item detail
pages, SEO, filtering and publish control.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK default `gen_random_uuid()` | |
| `slug` | `text` NOT NULL **unique** | `/exams/ssc-gd-constable` |
| `name` | `text` NOT NULL | `SSC GD Constable` |
| `short_name` | `text` | `SSC GD` |
| `vertical` | `text` NOT NULL | `check (vertical in ('armed-forces','capf','odisha','railways','ssc','officer'))` |
| `force` | `text` | `BSF` · `CRPF` · `Indian Navy` · `RRB` · `Odisha Police` |
| `stage` | `text` | `After 8th` · `After 10th` · `After 12th` · `After Graduation` · `For Serving Personnel` |
| `qualification` | `text` | Minimum education |
| `age_min` / `age_max` | `int` | Age band in years |
| `gender` | `text` default `'both'` | `check (gender in ('male','female','both'))` |
| `marital_status` | `text` | |
| `domicile` | `text` | `All India` · `Odisha only` |
| `intro` | `text` | Rich HTML |
| `pattern` | `text` | Rich HTML — exam pattern |
| `syllabus` | `text` | Rich HTML |
| `salary` | `text` | Rich HTML |
| `stages` | `jsonb` default `'[]'` | Which of the 7 journey stages apply |
| `notification_month` / `exam_month` | `text` | Typical calendar |
| `official_url` | `text` | Recruiting body's site |
| `banner_path` | `text` | Storage path |
| `sort_order` | `int` · `published` `boolean` default `true` · `created_at` / `updated_at` | |

```sql
create policy "exams_admin_all" on public.exams
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

create or replace view public.published_exams as
  select id, slug, name, short_name, vertical, force, stage, qualification,
         age_min, age_max, gender, marital_status, domicile, intro, pattern,
         syllabus, salary, stages, notification_month, exam_month,
         official_url, banner_path, sort_order
  from public.exams where published = true;

create index if not exists exams_vertical_idx on public.exams (vertical);
create index if not exists exams_slug_idx     on public.exams (slug);
```

### 10.18 `physical_standards` ★ new

One row per (exam × category × gender) combination. Drives the standards tables, the
calculator, and the summary block on each exam detail page.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `exam_id` | `uuid` | FK → `exams(id)` `on delete cascade` |
| `label` | `text` | Free-text scope, e.g. *ST candidates, Odisha* |
| `gender` | `text` NOT NULL default `'male'` | `check (gender in ('male','female'))` |
| `category` | `text` NOT NULL default `'UR'` | `UR` · `OBC` · `SC` · `ST` · `Ex-serviceman` |
| `region` | `text` | State / hill-tribe relaxation scope |
| **PST** | | |
| `height_cm` | `numeric` | Minimum height |
| `chest_cm` | `numeric` | Unexpanded |
| `chest_expanded_cm` | `numeric` | Expanded |
| `weight_kg` | `text` | Often "proportionate to height" |
| **PET** | | |
| `run_distance_m` | `int` | e.g. `1600` |
| `run_time` | `text` | e.g. `5 min 45 sec` |
| `long_jump` | `text` | |
| `high_jump` | `text` | |
| `beam_pullups` | `text` | |
| `ditch` | `text` | 9-foot ditch |
| `zigzag` | `text` | Balance |
| **Other** | | |
| `vision` | `text` | e.g. `6/6 & 6/9` |
| `notes` | `text` | Relaxations, exceptions |
| `sort_order` | `int` · `published` `boolean` · `created_at` | |

```sql
create or replace view public.published_physical_standards as
  select id, exam_id, label, gender, category, region,
         height_cm, chest_cm, chest_expanded_cm, weight_kg,
         run_distance_m, run_time, long_jump, high_jump,
         beam_pullups, ditch, zigzag, vision, notes, sort_order
  from public.physical_standards where published = true;

create index if not exists ps_exam_idx on public.physical_standards (exam_id);
```

> **Content-accuracy warning.** Physical and medical standards are published by the
> recruiting bodies and change between notifications. Every row must carry a source
> and be re-verified against the current notification each cycle. The site should
> display a visible "verified as on \<date\> — always confirm with the official
> notification" line above these tables. Publishing a wrong height or timing is a real
> harm to an aspirant, and a liability for the academy.

### 10.19 Grants

PostgREST checks role grants first, then RLS restricts rows. Both layers are required.

```sql
grant usage on schema public to anon, authenticated;

-- Admin tables: authenticated may operate; RLS narrows to admins.
grant select, insert, update, delete on
  public.profiles, public.site_content, public.selected_candidates,
  public.testimonials, public.mentors, public.media, public.activity_log,
  public.content_versions, public.faqs, public.enquiries, public.posts,
  public.selections, public.mock_questions, public.exams,
  public.physical_standards, public.resource_folders, public.resources
  to authenticated;

-- Public read of PUBLISHED content only, through the views.
grant select on
  public.published_content, public.published_selected_candidates,
  public.published_testimonials, public.published_mentors,
  public.published_faqs, public.published_posts, public.published_selections,
  public.published_mock_questions, public.published_exams,
  public.published_physical_standards
  to anon, authenticated;

grant select on public.resource_folders, public.resources to anon;
grant select on public.page_view_daily to authenticated;
grant execute on function public.track_view(text) to anon, authenticated;
```

Note what anon is **never** granted: `site_content` (drafts), `enquiries` (leads),
`profiles` (accounts), `activity_log`, `mock_questions` (answers), `page_view_daily`.

### 10.20 Storage

```sql
insert into storage.buckets (id, name, public)
values ('media', 'media', true) on conflict (id) do nothing;

create policy "media_public_read" on storage.objects
  for select to anon, authenticated using ( bucket_id = 'media' );

create policy "media_admin_insert" on storage.objects
  for insert to authenticated
  with check ( bucket_id = 'media' and private.is_admin() );

create policy "media_admin_update" on storage.objects
  for update to authenticated
  using ( bucket_id = 'media' and private.is_admin() )
  with check ( bucket_id = 'media' and private.is_admin() );

create policy "media_admin_delete" on storage.objects
  for delete to authenticated
  using ( bucket_id = 'media' and private.is_admin() );
```

Upsert needs INSERT + SELECT + UPDATE, which is why all three admin policies exist.

**Path convention** — `<table-or-section>/<timestamp>-<slug>.webp`, e.g.
`selected_candidates/1757500000000-sanjay-behera.webp`. The timestamp makes every
object immutable, which is what licenses the one-year `Cache-Control` in §16.

### 10.21 Entity relationships

```
auth.users ─1:1─ profiles ─┬─(actor)──▶ activity_log
                           ├─(uploaded_by)──▶ media
                           └─(updated_by)──▶ site_content

site_content ──(key)──▶ content_versions          (snapshot per publish)
site_content ──(view)─▶ published_content         (anon read)

exams ─1:N─ physical_standards                    (exam_id, cascade delete)
exams ─1:N─ mock_questions                        (exam_id, set null)
exams ◀─(text match)─ selected_candidates.exam    (soft link, for filtering)
exams ◀─(text match)─ selections.exam             (soft link, for the tracker)

resource_folders ─1:N─ resource_folders           (parent_id, nesting)
resource_folders ─1:N─ resources
resources (kind='youtube') ──▶ homepage VideosSection   (shared source)

enquiries ◀── /api/contact  (source='contact_form')
          ◀── /api/lead     (source='eligibility' | 'mock_test')

page_view_daily ◀── track_view() RPC ◀── PageViewTracker
```

---

## 11. `site_content` key registry

Every singleton CMS document, its shape, its code default and where it renders.
Field types map to the editor widgets in `SectionEditor`:
`text` · `rich` · `image` · `tags` · `select` · `repeater`.

### 11.0 Key index

| Key | Label | Page | Editor route |
|-----|-------|------|--------------|
| `settings` | Footer & Contact | Site-wide | `/admin/settings` |
| `hero` | Hero | Home | `/admin/sections/hero` |
| `homepage_order` | Homepage section order | Home | `/admin/homepage` |
| `hero_slides` | Hero showcase slides | Home | `/admin/hero-showcase` |
| `exam_counts` | Exams marquee | Home | `/admin/sections/exam_counts` |
| `toppers` | Top-rank marquee images | Home | `/admin/toppers` |
| `campus_images` | Campus gallery images | Home | `/admin/campus` |
| `officer_banners` | "Now Serving" images | Home | `/admin/officer-banners` |
| `courses` | Course / batch cards | Courses | `/admin/courses` |
| `courses_options` | Price show/hide | Home + Courses | `/admin/sections/courses_options` |
| `courses_note` | Facilities note | Home | `/admin/sections/courses_note` |
| `verticals` | Six Verticals | Home | `/admin/verticals` |
| `whyus` | Why Us heading | Home | `/admin/sections/whyus` |
| `whyus_items` | Why Us cards | Home | `/admin/sections/whyus_items` |
| `stats` | Scoreboard plates | Home | `/admin/stats` |
| `recent_wins` | Recent-wins ticker | Home | `/admin/sections/recent_wins` |
| `countdown` | Batch & exam countdown | Home | `/admin/countdown` |
| `selection_tracker` | Selection tracker copy | Home | `/admin/sections/selection_tracker` |
| `journey` | 7-stage journey | Home + process page | `/admin/sections/journey` |
| `journey_intro` | Process page intro | Recruitment process | `/admin/sections/journey_intro` |
| `story` | The Hard Truth | Home | `/admin/sections/story` |
| `story_gaps` | The Hard Truth cards | Home | `/admin/sections/story_gaps` |
| `cta` | CTA banner | Site-wide | `/admin/sections/cta` |
| `about_mission` | Mission block | About | `/admin/sections/about_mission` |
| `about_values` | Core values | About | `/admin/sections/about_values` |
| `gateways` | "Where do you stand" cards | Exams | `/admin/sections/gateways` |
| `standards` | Physical & medical content | Standards | `/admin/sections/standards` |
| `centres` | Training centres | Training centres | `/admin/sections/centres` |
| `google_reviews` | Google reviews | Home | `/admin/google-reviews` |
| `contact_form` | Enquiry form config | Contact + modal | `/admin/contact-form` |
| `enquiry_popup` | Auto-popup modal | Site-wide | `/admin/sections/enquiry_popup` |
| `preloader` | Preloader on/off | Site-wide | `/admin/sections/preloader` |
| `heading.<key>` | Per-section headings (11 keys) | Home | `/admin/sections/heading.<key>` |
| `pagehero.<key>` | Per-page hero (14 keys) | Interior pages | `/admin/sections/pagehero.<key>` |
| `seo.<key>` | Per-page SEO (17 keys) | All pages | `/admin/seo` |

### 11.1 `settings` — site-wide

Shape (also the `SITE` default in `lib/data.ts`):

```ts
export const SITE = {
  name:            "Samantroy Academy",
  tagline:         "Discipline. Fitness. Selection.",
  phone1:          "+91 XXXXX XXXXX",
  phone1Href:      "tel:+91XXXXXXXXXX",
  phone2:          "",            // blank hides it everywhere
  phone2Href:      "",
  whatsapp:        "https://wa.me/91XXXXXXXXXX?text=...",
  email:           "info@samantroyacademy.com",
  address:         "…, Odisha — XXXXXX",
  mapUrl:          "https://www.google.com/maps/place/…@LAT,LNG,17z/…",
  instagram:       "https://www.instagram.com/…",
  youtube:         "https://www.youtube.com/@…",
  telegram:        "https://t.me/…",
  facebook:        "https://www.facebook.com/…",
  url:             "https://www.samantroyacademy.com",
  brochure:        "/Samantroy-Academy-Brochure.pdf",
  brochureEnabled: "on",          // "off" → brochure links go to /contact instead
  enrollOffline:   "https://pages.razorpay.com/…",
  enrollOnline:    "https://pages.razorpay.com/…",
  officeHours:     "Mon–Sat, 7:00 AM – 8:00 PM",
};
```

Helpers in `lib/content.ts` derive from this document:

| Helper | Returns |
|--------|---------|
| `getSettings()` | The merged settings document |
| `telHref(phone)` | `tel:` href with non-digits stripped |
| `brochureOn(s)` | `s.brochureEnabled !== "off"` |
| `brochureHref(s)` | The brochure URL, or `/contact` when downloads are off |
| `mapHref(s)` | `s.mapUrl`, falling back to a Maps search on the address |
| `mapEmbedSrc(s)` | Embed URL, extracting `@lat,lng` from `mapUrl` so the pin is exact |

### 11.2 `hero`

| Field | Type | Purpose |
|-------|------|---------|
| `badge` | text | Small pill above the heading |
| `headingLine1` / `headingLine2` | text | Two-line display heading |
| `typedPrefix` | text | Fixed start of the animated line, e.g. *"Become an "* |
| `typedWords` | tags | Rotating words: *Agniveer, Constable, Navik, Airman, Sub-Inspector* |
| `paragraph` | rich | Intro paragraph with word-art support |
| `rating` | text | Rating / social-proof line (HTML allowed) |
| `primaryCta` / `primaryCtaHref` | text | Primary button |
| `secondaryCta` / `secondaryCtaHref` | text | Secondary button |

### 11.3 `homepage_order`

```ts
{ items: [ { key: "exams_marquee", enabled: true }, … ] }
```

Resolved by `resolveHomeOrder(saved)`, which keeps the admin's order, drops keys no
longer in the registry, and appends newly-shipped sections at the end — so a code
deploy that adds a section never requires the admin to re-save.

### 11.4 `exam_counts`

`{ items: [ { entry: "SSC GD Constable", count: "84" }, … ] }` — the marquee band.

### 11.5 `courses`

Repeater. Per card: `title` · `tag` · `duration` · `mode` · `price` · `features[]` ·
`highlight` · `ctaLabel` · `ctaHref` · `image`.

### 11.6 `courses_options`

`{ showPrices: "on" | "off" }` — a single `select` that governs price visibility on
**both** the homepage and `/courses` at once.

### 11.7 `verticals` — Six Verticals

| Field | Type |
|-------|------|
| `kicker` / `title` / `subtitle` | text / text / text |
| `cards` | repeater |

Per card: `name` · `motto` · `desc` · `image` · `alt` · `scrim` (overlay colour) ·
`accent` · `icon` · `entries[]` (exam chips) · `link`.

### 11.8 `stats` & `recent_wins`

`stats` → `{ items: [ { value: 1240, label: "Selections", suffix: "+" }, … ] }`.
`suffix` defaults to `"+"` but can be blanked or set to `%`, `★`, etc.

`recent_wins` → `{ items: [ { text: "Sanjay B. — SSC GD, CRPF" }, … ] }`.

### 11.9 `journey` — the 7-stage document

```ts
{
  items: [
    {
      day: "Stage 1",           // stage label
      code: "APPLY",            // chip
      service: "army",          // colour theme token
      title: "Notification & Online Application",
      subtitle: "Read it right, apply once, apply correctly",
      brief: "<rich html>",
      drill: "<rich html>",     // "Our Drill" — what the academy does for you
      tests: [ { name: "Eligibility audit", detail: "Age, height, chest, education cross-check" }, … ]
    },
    … 6 more
  ]
}
```

Consumed by `<JourneySection>` (home) and `/recruitment-process`.

### 11.10 `standards`

| Field | Type | Purpose |
|-------|------|---------|
| `kicker` | text | |
| `processTitle` / `processIntro` | text | |
| `stages` | repeater | `icon` · `step` · `title` · `detail` (rich) |
| `image1` / `image2` | image | Ground / medical photos |
| `standardsTitle` / `standardsIntro` | text | |
| `medical` | repeater | `area` · `requirement` · `notes` |
| `commonTitle` | text | |
| `common` | tags | Common rejection reasons |
| `appealTitle` / `appealBody` | text / rich | DME → RME → AME |
| `faqs` | repeater | `q` · `a` (rich) |
| `verifiedOn` | text ★ | *"Verified as on …"* line above the tables |

The numeric PST/PET tables come from the `physical_standards` **table**, not this
document — this document holds the surrounding explanatory copy.

### 11.11 `centres`

`kicker` · `title` · `subtitle` · `items` repeater. Per centre: `short` · `name` ·
`motto` · `location` · `service` · `established` · `image` · `intro` (rich) ·
`courses[]` (name, duration, who) · `highlights[]`.

### 11.12 `gateways`

Repeater: `icon` · `title` · `body` (rich) · `tags[]` — the *"Where do you stand
today?"* cards on `/exams` (After 8th / After 10th / After 12th / After Graduation /
Already Serving).

### 11.13 `countdown`

```ts
{
  kicker: "Mark your calendar",
  heading: "Countdown to your next milestone",
  bg: "#0a1524", textColor: "#ffffff", kickerColor: "#c8a23c",
  items: [ { label: "SSC GD 2026 CBT", date: "2026-11-20", kind: "exam",
             bg: "…", fg: "…" }, … ]
}
```

`kind` is `"batch"` or `"exam"`; per-item `bg`/`fg` override the section colours.

### 11.14 `selection_tracker`

`kicker` · `heading` · `subtitle` · `totalLabel` / `totalOverride` ·
`yearsLabel` / `yearsOverride` · `centresLabel` / `centresOverride` · `barsHeading`.

Leaving an override blank makes the number compute automatically from the
`published_selections` rows — so the numbers can be either curated or derived.

### 11.15 `contact_form`

The full form configuration. Fields: `name` · `phone` · `email` · `entry` · `batch` ·
`status` · `message`. Each has `label`, `placeholder`, `required`, `enabled`.
Plus `entryOptions[]` (the exam catalogue), `batchOptions[]`, `statusOptions[]`,
`submitLabel`, `successMessage`, `privacyNote`.

`resolveContactForm(saved)` merges the stored document over the defaults so a
partially-filled or older document still renders a complete form.

**Phone handling** (`lib/form-defaults.ts`):

| Helper | Behaviour |
|--------|-----------|
| `PHONE_DIAL_CODE` | `"+91"` — shown as a fixed prefix, not typed |
| `phoneDigits(raw)` | Reduces any paste (`+91 98765 43210`, `091-98765-43210`, `(+91) 9876543210`) to the 10 national digits |
| `isValidPhone(d)` | `/^[6-9]\d{9}$/` |
| `fullPhone(d)` | `+91XXXXXXXXXX` — the stored / emailed form |

### 11.16 `enquiry_popup`

`enabled` (select on/off) · `title` · `subtitle` · `body` (rich) · `delayMs`.
Shown once per session via `sessionStorage`, managed by `<ModalProvider>`.

### 11.17 `preloader`

`{ lottie: "on" | "off" }` — on shows the animation, off shows only the wordmark.

### 11.18 `heading.<key>` — 11 section headings

Keys: `wall` · `courses` · `campus` · `books` · `mentors` · `stats` · `testimonials` ·
`videos` · `google_reviews` · `instagram` · `officer_banners`.

Fields: `kicker` · `kickerSize` (select: xs/sm/md/lg/xl) · `title` (HTML allowed) ·
`subtitle`.

### 11.19 `pagehero.<key>` — 14 page heroes

Keys: `about` · `recruitment-process` · `exams` · `standards` · `training-centres` ·
`courses` · `eligibility` · `mock-tests` · `resources` · `gallery` · `selected` ·
`blog` · `testimonials` · `contact`.

Fields: `kicker` · `kickerSize` · `title` (HTML) · `subtitle` · `image` · `crumb`.

Generated programmatically in `lib/sections.ts` from `PAGE_HEROES`, so adding a page
hero is one entry in `lib/pagehero-defaults.ts`.

### 11.20 `seo.<key>` — 17 SEO records

`{ title: string, description: string }` per page, defaulting to `SEO_PAGES` in
`lib/seo-pages.ts`. Read by `pageMetadata(key)` inside each page's
`generateMetadata()`.

---

## 12. API endpoints

8 routes. All are `runtime = "nodejs"`. All admin routes are additionally
`dynamic = "force-dynamic"`.

### 12.0 Endpoint index

| Method | Path | Auth | Rate limit | Purpose |
|--------|------|------|-----------|---------|
| POST | `/api/contact` | Public | 5 / min / IP | Enquiry form → CRM + email + auto-responder |
| POST | `/api/lead` | Public | 8 / min / IP | Eligibility & mock-test lead capture |
| POST | `/api/mock/score` | Public | 20 / min / IP | Server-side quiz scoring |
| POST | `/api/resources/youtube` | Public | 20 / min / IP | Resolve a YouTube URL → title + thumbnail |
| POST | `/api/admin/create-user` | super_admin | 10 / min / IP | Create a new admin |
| POST | `/api/admin/manage-user` | super_admin | 20 / min / IP | Promote / demote / remove an admin |
| POST | `/api/admin/revalidate` | admin | — | Bust the CMS cache after publishing |
| POST | `/api/admin/google-review` | admin | 20 / min / IP | Import Google reviews via Places API |
| GET | `/sitemap.xml` | Public | — | Next metadata route |
| GET | `/robots.txt` | Public | — | Next metadata route |

Rate limiting is `lib/rate-limit.ts` — an in-memory, per-warm-instance limiter keyed
by `bucket:ip`, with a periodic sweep and a 10 000-key cap so it cannot grow without
bound. It is a speed bump against scripted abuse, **not** a substitute for an edge WAF.

---

### 12.1 `POST /api/contact`

**Request**

```jsonc
{
  "name":    "Sanjay Behera",
  "email":   "sanjay@example.com",
  "phone":   "9876543210",          // any format; normalised server-side
  "entry":   "SSC GD Constable",
  "batch":   "Offline (campus)",
  "status":  "Fresher (first attempt)",
  "message": "I am 172 cm, ST category — am I eligible?",
  "company": ""                     // HONEYPOT — must stay empty
}
```

**Processing order**

1. **Rate limit** — 5 / min / IP → `429`.
2. **Honeypot** — `company` filled ⇒ return `{ ok: true }` **silently** (the bot
   thinks it succeeded; nothing is stored).
3. **Normalise phone** — `phoneDigits()` → `fullPhone()`.
4. **Validate against the admin's own form config** — load the `contact_form`
   document and check only the fields that are *enabled and required*. This is the
   critical detail: hardcoding "email is required" would reject submissions from a
   form the admin configured without an email field.
5. **Format checks** on whatever was supplied — name length 2–80, email regex, Indian
   mobile regex, message ≤ 2000 chars.
6. **Reachability check** — if neither email nor phone was given while at least one
   of those fields is enabled, reject: *"Please leave a phone number or an email so we
   can reach you."* A lead nobody can reply to is worthless.
7. **Capture the lead first** — `saveEnquiry()` with the service-role client. This
   happens **before** email, so a Resend outage never loses a lead.
8. **Notify the academy** — `notifyAdmin()` with `replyTo` set to the aspirant's
   email when present.
9. **Auto-respond to the aspirant** — only when an email was given and
   `RESEND_API_KEY` is set. Failure here is swallowed; the lead is already captured.

**Response** — `200 { ok: true, emailed: boolean }` · `400` validation ·
`429` rate limited.

---

### 12.2 `POST /api/lead`

Lightweight capture for the Eligibility Finder and the Mock Tests.

```jsonc
{
  "name": "…", "email": "…", "phone": "…",
  "entry": "SSC GD Constable, RPF Constable",
  "message": "",
  "source": "eligibility",          // or "mock_test"
  "meta": { "age": 20, "height_cm": 170, "category": "ST",
            "eligible": ["SSC GD","RPF Constable"], "score": "14/20" },
  "company": ""                     // honeypot
}
```

Validates name (2–80), email (required here), optional phone. Stores to the CRM, then
emails the academy with `meta` flattened into readable rows (up to 12) so the team
sees the full quiz result or test score in the notification.

**Response** — `200 { ok: true }` · `400` · `429`.

Both CRM write and email are best-effort: a downstream outage never fails the
visitor's submission.

---

### 12.3 `POST /api/mock/score`

```jsonc
{ "answers": { "<question-uuid>": 2, "<question-uuid>": 0 } }
```

Reads the correct answers with the **service-role** client (falling back to the anon
client, which cannot see answers, if no service key is configured), compares, and
returns:

```jsonc
{
  "correct": 14,
  "total": 20,
  "score": 12.5,                    // ★ marks minus negative marks
  "details": [
    { "id": "…", "chosen": 2, "answer": 2, "correct": true,  "explanation": "…" },
    { "id": "…", "chosen": 0, "answer": 3, "correct": false, "explanation": "…" }
  ]
}
```

Caps at 100 question ids per request. **This endpoint is the only place correct
answers are ever read** — the public view excludes them, so the quiz cannot be
completed from the network tab.

---

### 12.4 `POST /api/resources/youtube`

`{ "url": "https://youtu.be/XXXXXXXXXXX" }` → `{ ok, title, thumbnail, url, videoId }`.

Extracts the 11-character id from `?v=`, `youtu.be/`, `/embed/` or `/shorts/` forms,
then calls YouTube's public **oEmbed** endpoint for the title. If oEmbed fails it
still returns a working thumbnail and a placeholder title — the admin's paste never
hard-fails.

---

### 12.5 `POST /api/admin/create-user` — super-admin only

```jsonc
{ "email": "trainer@samantroyacademy.com", "password": "…", "full_name": "…" }
```

**Steps**

1. Rate limit 10 / min.
2. `supabase.auth.getUser()` — `401` if unauthenticated.
3. Read the caller's `profiles.role` — `403` unless `super_admin`.
4. `503` if `SUPABASE_SERVICE_ROLE_KEY` is missing.
5. Validate email format and password length ≥ 8.
6. `admin.auth.admin.createUser({ email_confirm: true })` — the DB trigger creates a
   `pending` profile.
7. **Promote** the profile to `admin` and set `full_name`, requiring exactly one
   updated row.
8. **Compensating rollback** — if the promotion fails, delete the auth user just
   created, so the system never ends up with a half-created admin. Returns a clear
   error telling the operator to check that the profile trigger is installed.
9. Write an `activity_log` row (`create_admin`).

**Response** — `200 { ok: true }` · `400` · `401` · `403` · `429` · `500` · `503`.

---

### 12.6 `POST /api/admin/manage-user` — super-admin only

```jsonc
{ "id": "<uuid>", "action": "make_admin" | "make_super_admin" | "remove" }
```

- UUID format validated with a regex.
- **You cannot act on yourself** — prevents accidental self-lockout.
- `remove` deletes the auth user, which cascades the profile row and revokes login.
- The DB trigger independently blocks removing or demoting the **last** super-admin,
  so the guarantee holds even if this route is bypassed.
- Every action is written to `activity_log` as `user_<action>`.

---

### 12.7 `POST /api/admin/revalidate` — any admin

No body. Re-authenticates, re-checks the role, then:

```ts
revalidateTag(CMS_TAG, { expire: 0 });
```

Next 16 requires a cache-life profile; `expire: 0` makes the very next request re-read
freshly published content. Called by `bustCmsCache()` after every save, publish and
rollback.

---

### 12.8 `POST /api/admin/google-review` — any admin

Imports reviews from the Google Places API.

- Resolves `place_id` from `GOOGLE_PLACE_ID`, else a Find-Place text search using
  `GOOGLE_PLACE_QUERY`.
- Fetches `reviews, rating, user_ratings_total` sorted newest-first.
- Returns up to 5 reviews: `{ url, name, rating, text, avatarUrl, date }`.

**Without an API key it returns `{ ok: false, manual: true, error: "…" }`** with an
honest explanation: *Google renders review content with JavaScript and blocks
scraping, so a pasted share link genuinely cannot yield the reviewer, text or photo —
its meta tags only ever say "Google Maps".* The admin then adds the review manually
and it publishes identically. **Do not fabricate review content** — that is the whole
point of this design.

---

### 12.9 `proxy.ts` — the edge gate

Next 16's `proxy` convention replaces the deprecated `middleware` file.

```ts
export async function proxy(request: NextRequest) {
  return updateSession(request);
}
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],   // skip the public site & assets
};
```

`updateSession()` (`lib/supabase/middleware.ts`):

1. No-ops when Supabase is not configured.
2. Calls `supabase.auth.getUser()` — **required** to refresh the session token.
3. Unauthenticated + under `/admin` (and not `/admin/login`) → redirect to
   `/admin/login?next=<path>`.
4. Authenticated + on `/admin/login` → redirect to `/admin`.

The matcher deliberately excludes the public site so no visitor request pays the cost
of a session lookup.

---

## 13. Admin panel

31 screens at `/admin`, all behind the auth + role gate.

### 13.0 Sidebar structure

Items marked `superOnly` are hidden from plain admins.

| # | Route | Label | Icon | Access |
|---|-------|-------|------|--------|
| 1 | `/admin` | Dashboard | ▦ | admin |
| 2 | `/admin/enquiries` | Enquiries | 📥 | admin |
| 3 | `/admin/analytics` | Analytics | 📈 | admin |
| 4 | `/admin/candidates` | Selected Candidates | 🎖 | admin |
| 5 | `/admin/testimonials` | Testimonials | 💬 | admin |
| 6 | `/admin/mentors` | Faculty & Trainers | 🎓 | admin |
| 7 | `/admin/exams` ★ | Exams Catalogue | 📋 | admin |
| 8 | `/admin/standards` ★ | Physical Standards | 📏 | admin |
| 9 | `/admin/selections` | Selection Tracker | 🏅 | admin |
| 10 | `/admin/faqs` | FAQs | ❓ | admin |
| 11 | `/admin/blog` | Blog | 📝 | admin |
| 12 | `/admin/mock-tests` | Mock Tests | 🧠 | admin |
| 13 | `/admin/resources` | Resources | 📂 | admin |
| 14 | `/admin/homepage` | Homepage Sections | 🧩 | admin |
| 15 | `/admin/sections` | Pages & Sections | ✎ | admin |
| 16 | `/admin/hero-showcase` | Hero Showcase | 🖼 | admin |
| 17 | `/admin/verticals` | Six Verticals | 🎖 | admin |
| 18 | `/admin/campus` | Campus Gallery | 🏫 | admin |
| 19 | `/admin/toppers` | Top Rank Marquee | 🥇 | admin |
| 20 | `/admin/officer-banners` | Now Serving Marquee | 🎽 | admin |
| 21 | `/admin/google-reviews` | Google Reviews | ⭐ | admin |
| 22 | `/admin/sections/enquiry_popup` | Enquiry Popup | 💌 | admin |
| 23 | `/admin/contact-form` | Contact & Enquiry Form | 📝 | admin |
| 24 | `/admin/stats` | Scoreboard Stats | 📊 | admin |
| 25 | `/admin/countdown` | Batch & Exam Countdown | ⏱ | admin |
| 26 | `/admin/settings` | Footer & Contact | ▤ | admin |
| 27 | `/admin/seo` | SEO | 🔎 | admin |
| 28 | `/admin/media` | Media Library | 🖼 | admin |
| 29 | `/admin/activity` | Activity Log | 🕑 | admin |
| 30 | `/admin/users` | Users | 👤 | **super_admin** |
| 31 | `/admin/account` | My Account | ⚙ | admin |

Footer of the sidebar: signed-in email, role label, Sign out, "View live site ↗".

### 13.1 Auth flow

```
Visitor → /admin/anything
   │
   ├─ proxy.ts → updateSession()
   │     ├─ Supabase not configured?      → pass through
   │     ├─ No session?                   → redirect /admin/login?next=…
   │     └─ Session on /admin/login?      → redirect /admin
   │
   └─ app/admin/(dashboard)/layout.tsx
         ├─ !isSupabaseConfigured()       → <AdminNotConfigured />
         ├─ getCurrentAdmin() === null    → redirect /admin/login
         │     (fail-closed: no profile row, or role='pending', is NOT admin)
         └─ render <Sidebar role=… /> + <AdminSessionGuard /> + children
```

`<AdminSessionGuard>` is a client watchdog that subscribes to Supabase auth events
and pushes the user to `/admin/login` the moment the session ends in another tab.

### 13.2 Screen specifications

**1 · Dashboard** `/admin`
Welcome line with the admin's name and role. Live count cards (selected candidates,
testimonials, faculty, FAQs, new enquiries, exams) each linking to their manager.
Build-progress checklist. Quick links.

**2 · Enquiries** `/admin/enquiries` — `<EnquiryInbox>`
The CRM. Table of leads with name, contact, target exam, source, date. Per row:
status dropdown (`new` → `contacted` → `enrolled` / `dropped`), an internal notes
field, click-to-call and click-to-WhatsApp. Filters by status, source and date range.
**CSV export** of the filtered set. Counts per status shown as a pipeline strip.

**3 · Analytics** `/admin/analytics`
Daily page views from `page_view_daily`. Total views, per-path table, a date-range
selector and a simple trend chart. No personal data exists to display.

**4 · Selected Candidates** `/admin/candidates` — `<CandidatesManager>`
Add / edit / delete a candidate: photo (cropped to the tile ratio), name, exam, post,
force, year, date of selection. Reorder, publish toggle, and a **bulk import** flow
for adding a whole batch of results at once.

**5 · Testimonials** `/admin/testimonials` — `<RecordManager>`
Fields: photo · name · rank/post · body (rich). Reorder, publish toggle.

**6 · Faculty & Trainers** `/admin/mentors` — `<RecordManager>`
Fields: photo (round crop) · name · role · specialty · bio (rich).

**7 · Exams Catalogue** ★ `/admin/exams` — `<ExamsManager>`
Full CRUD over the `exams` table. Slug auto-generated from the name (editable).
Vertical filter tabs. Per exam: every field in §10.17, with rich-text editors for
intro / pattern / syllabus / salary, a banner image with crop, and a publish toggle.
A "Standards" button jumps to the rows for that exam.

**8 · Physical Standards** ★ `/admin/standards` — `<StandardsManager>`
Rows grouped by exam. Add a row per (gender × category × region) with the PST and PET
numbers. Inline editing, duplicate-row action (to copy a UR row and adjust it for ST),
and the `verifiedOn` date that renders above the public tables.

**9 · Selection Tracker** `/admin/selections` — `<SelectionsManager>`
Year · exam · district/force · count rows that feed the homepage bar chart.

**10 · FAQs** `/admin/faqs` — `<RecordManager>`
Question + rich answer, reorder, publish toggle.

**11 · Blog** `/admin/blog` — `<BlogManager>`
Cover image, title, auto-slug, excerpt, rich body, tag, author, publish toggle and a
publish date for date-gated release.

**12 · Mock Tests** `/admin/mock-tests` — `<MockManager>`
Question bank: subject, exam scope, question text, options list, correct-answer index,
explanation, difficulty, marks, negative marks. Filter by subject/exam; publish toggle
per question.

**13 · Resources** `/admin/resources` — `<ResourcesManager>`
Create nested folders. Upload files (PDF/image/doc) straight to Storage. Paste a
YouTube URL and the title + thumbnail are fetched automatically via
`/api/resources/youtube`. Reorder within a folder.

**14 · Homepage Sections** `/admin/homepage` — `<HomeOrderManager>`
Reorder all 20 movable homepage sections and switch any of them on or off. Each row
shows a hint and a direct "Edit content" link into the right manager.

**15 · Pages & Sections** `/admin/sections` → `/admin/sections/[key]`
The section index, grouped by page. `[key]` opens the **universal `SectionEditor`**:
fields rendered from the schema in `lib/sections.ts`, autosave, device-framed live
preview iframe, Save draft, Publish live, Rollback.

**16 · Hero Showcase** `/admin/hero-showcase` — `<HeroSlidesManager>`
Slides with image, name, centre/academy, term caption.

**17 · Six Verticals** `/admin/verticals` — `<VerticalsManager>`
The six vertical cards: name, motto, description, photo, alt text, scrim colour,
accent colour, icon, exam chips, link.

**18 · Campus Gallery** `/admin/campus` — `<ImageListManager>`
Ordered image list with crop.

**19 · Top Rank Marquee** `/admin/toppers` — `<ImageListManager>`

**20 · Now Serving Marquee** `/admin/officer-banners` — `<ImageListManager>`

**21 · Google Reviews** `/admin/google-reviews` — `<GoogleReviewsManager>`
"Import from Google" (Places API) or add manually: name, rating, text, avatar, date.
Reorder and toggle each review.

**22 · Enquiry Popup** `/admin/sections/enquiry_popup`
On/off, title, sub-line, message, delay in milliseconds.

**23 · Contact & Enquiry Form** `/admin/contact-form` — `<ContactFormManager>`
Per field: label, placeholder, required toggle, visible toggle. Plus the three
dropdown option lists (exams, batches, status), submit button label, success message
and privacy note. **`/api/contact` validates against this same document**, so the
form and the server can never disagree.

**24 · Scoreboard Stats** `/admin/stats` — `<StatsEditor>`
Value, label and suffix per plate; reorder.

**25 · Countdown** `/admin/countdown` — `<CountdownEditor>`
Kicker, heading, section background / text / kicker colours, and the item list
(label, date, batch-or-exam kind, per-item colours).

**26 · Footer & Contact** `/admin/settings` — `<SettingsEditor>`
Every field in the `settings` document (§11.1), including the brochure on/off switch
and the Google Maps URL that drives both the directions link and the embedded map.

**27 · SEO** `/admin/seo` — `<SeoEditor>`
Title and description for each of the 17 pages, with a **live Google-result preview**
and character-count guidance.

**28 · Media Library** `/admin/media` — `<MediaLibrary>`
Upload (client-compressed to WebP), browse, copy path, delete. Shows dimensions and
size.

**29 · Activity Log** `/admin/activity`
Append-only audit trail: who, what action, which target, when.

**30 · Users** `/admin/users` — super-admin only
List of admins with role and created date. `<CreateAdminForm>` to add one.
`<UserActions>` to promote, demote or remove. Self-actions are blocked, and the last
super-admin cannot be removed or demoted.

**31 · My Account** `/admin/account` — `<ChangePasswordForm>`
Change your own password. Available to every role.

### 13.3 Editing patterns an admin will actually use

| Task | Where | Steps |
|------|-------|-------|
| Change homepage headline | `/admin/sections/hero` | Edit → autosaves → **Publish live** |
| Undo a bad publish | Same screen | **↩ Rollback** |
| Add this month's selections | `/admin/candidates` | Add photo + name + exam + post + date |
| Reorder the homepage | `/admin/homepage` | Drag, toggle, Save |
| Hide course prices | `/admin/sections/courses_options` | Select "Hide prices" → Publish |
| Add a new exam | `/admin/exams` | Fill the form → Publish → detail page appears at `/exams/<slug>` |
| Update PET timings | `/admin/standards` | Edit the row, update `verifiedOn` → Publish |
| Follow up a lead | `/admin/enquiries` | Set status, add a note, click-to-call |
| Publish a blog post | `/admin/blog` | Write → set publish date → toggle Published |
| Change the phone number | `/admin/settings` | Edit → Publish (updates footer, header, WhatsApp, JSON-LD everywhere) |

---

## 14. Connection maps

### 14.1 Request lifecycle — a visitor loads the homepage

```
Browser  GET /
  │
  ├─ proxy.ts matcher = ["/admin/*","/api/admin/*"]  →  NOT matched, no session cost
  │
  ├─ app/layout.tsx            fonts, global metadata
  ├─ app/(site)/layout.tsx     Promise.all([ enquiry_popup, contact_form, settings ])
  │      └─ renders JSON-LD, Preloader, Cursor, ModalProvider, Navbar, Footer,
  │         WhatsApp / Call / ChatBot / BackToTop / PreviewBar / PageViewTracker
  │
  └─ app/(site)/page.tsx
         ├─ getPublished("homepage_order", { items: [] })
         ├─ resolveHomeOrder(doc.items)
         └─ for each enabled section → its component
                 └─ getPublished(...) / getCollection(...)
                        ├─ isSupabaseConfigured()?  no  → lib/data.ts default
                        ├─ sa-preview cookie?       yes → cookie-bound read of `draft`
                        └─ otherwise → unstable_cache(["cms-doc"], 300 s, tag "cms")
                                          └─ createPublicClient() → published_content
                        then: merge over fallback → coerceShape → deepSanitize
```

Because `fetchPublishedDoc` is a **cookie-free** cached read, the ~20 CMS lookups a
homepage makes collapse into cached entries instead of 20 Supabase round trips per
visitor. That single decision is the difference between staying inside the Supabase
free tier and blowing through it.

### 14.2 Publish flow — admin edits a section

```
/admin/sections/hero
  │
  ├─ mount → document.cookie = "sa-preview=1"   (admin now sees drafts site-wide)
  │
  ├─ type → setState → 1.6 s debounce
  │      └─ supabase.from("site_content").upsert({ key, label, draft }, { onConflict:"key" })
  │                                    ↑ RLS: private.is_admin()
  │
  ├─ "Publish live"
  │      ├─ select current published
  │      ├─ if non-empty → insert into content_versions (snapshot)
  │      ├─ upsert { published: form, draft: form }
  │      ├─ insert activity_log { action:"publish", target:"section:hero" }
  │      └─ bustCmsCache() → POST /api/admin/revalidate → revalidateTag("cms",{expire:0})
  │
  ├─ "↩ Rollback"
  │      ├─ select newest content_versions row for this key
  │      ├─ update site_content { published: snapshot, draft: snapshot }
  │      ├─ delete that version row      (repeat rollbacks walk back through history)
  │      └─ activity_log + bustCmsCache()
  │
  └─ unmount → clear sa-preview cookie
```

### 14.3 Lead flow — a visitor submits the enquiry form

```
<ContactForm>  (fields & rules from the `contact_form` CMS doc)
   │  POST /api/contact
   ▼
rate limit 5/min ──▶ 429
   │
honeypot filled? ──▶ { ok: true }   (silent, nothing stored)
   │
phoneDigits() → fullPhone()
   │
validate against the SAME contact_form document
   │
   ├─▶ saveEnquiry()   [service role, bypasses RLS]  → enquiries table   ← happens FIRST
   │
   ├─▶ notifyAdmin()   [Resend]  → CONTACT_ADMIN_EMAIL, replyTo = aspirant
   │
   └─▶ auto-responder  [Resend]  → aspirant (only if email given + key present)
   │
   ▼
{ ok: true, emailed: bool }
   │
Admin sees it at /admin/enquiries → status pipeline → notes → CSV export
```

The ordering is the point: **the lead is stored before any email is attempted**, so
an email outage costs a notification, never a lead.

### 14.4 Mock-test flow

```
/mock-tests
   │  getCollection("published_mock_questions")   ← answer & explanation NOT in this view
   ▼
<MockQuiz>  timer, navigation, answer sheet
   │  POST /api/mock/score  { answers: { id: index } }
   ▼
service-role read of mock_questions.answer + .explanation
   │  compare, apply marks / negative_marks
   ▼
{ correct, total, score, details[] }
   │
   └─ result screen → lead form → POST /api/lead (source:"mock_test", meta.score)
```

### 14.5 Media pipeline

```
Admin picks a file
   │
   ├─ <CropFileInput> → <ImageCropper>          maths from lib/crop.ts (pure, unit-tested)
   │        aspect locked to the frame it renders in (FRAMES.pageHero, tile, round…)
   │
   ├─ compressImage()   canvas → WebP, max 1600 px, q 0.82
   │        never upsizes; falls back to the original on any failure
   │
   ├─ supabase.storage.from("media").upload(
   │        `${table}/${Date.now()}-${slug}.webp`,
   │        { cacheControl: "31536000", upsert: true }
   │  )                                          ← RLS: private.is_admin()
   │
   ├─ store the PATH (not the URL) in the row / document
   │
   └─ render: mediaUrl(path) → next/image
              ├─ "http…" or "/…"  → returned unchanged (local fallback assets)
              └─ otherwise        → ${SUPABASE_URL}/storage/v1/object/public/media/${path}
```

Storing the **path** rather than a full URL means the bucket or project can move
without rewriting every row.

### 14.6 What reads what — source-of-truth table

| Surface | Reads from | Falls back to |
|---------|-----------|---------------|
| Homepage order | `site_content.homepage_order` | `HOME_ORDER_DEFAULT` |
| Any section | `site_content.<key>` | `SECTION_DEFAULTS[key]` |
| Page hero | `site_content.pagehero.<key>` | `PAGE_HEROES[key]` |
| Page metadata | `site_content.seo.<key>` | `SEO_PAGES` |
| Site settings | `site_content.settings` | `SITE` |
| Wall of Selection | `published_selected_candidates` | `STUDENTS` |
| Testimonials | `published_testimonials` | `TESTIMONIALS` |
| Faculty | `published_mentors` | `MENTORS` |
| FAQs | `published_faqs` | `FAQS` |
| Blog | `published_posts` | `[]` |
| Tracker | `published_selections` | `SELECTIONS` |
| Quiz | `published_mock_questions` | `[]` |
| Exams | `published_exams` | `EXAMS` (`lib/exams.ts`) |
| Standards | `published_physical_standards` | `STANDARDS` (`lib/standards.ts`) |
| Resources & homepage videos | `resources` | `YT_VIDEOS` |
| Analytics | `page_view_daily` | — (admin only) |
| Leads | `enquiries` | — (admin only) |

---

## 15. Security model

Four layers, each of which independently denies an unauthorized action.

### 15.1 Layer 1 — Edge auth gate (`proxy.ts`)

Refreshes the Supabase session cookie and redirects unauthenticated users away from
`/admin` and `/api/admin`. Scoped by matcher so public traffic pays nothing.

### 15.2 Layer 2 — Application role gate (`lib/auth.ts`)

`getCurrentAdmin()` is **fail-closed**:

```ts
const p = profile as AdminProfile | null;
if (!p || (p.role !== "admin" && p.role !== "super_admin")) return null;
```

A signed-in user with no profile row, or with `role = 'pending'`, is **not** an admin.
Privileged API routes re-check `super_admin` independently rather than trusting that
the UI hid the button.

### 15.3 Layer 3 — Row-Level Security

RLS is enabled on **every** table. Every write policy is
`to authenticated ... using ( private.is_admin() )`. Roles come from a
`SECURITY DEFINER` function with `search_path = ''`, never from user-editable JWT
metadata. Anonymous users can only read the `published_*` views, which structurally
exclude drafts, answers, leads and profiles.

### 15.4 Layer 4 — Least-privilege signup

New auth users default to `pending`. Only a super-admin, through the service-role API
route, promotes anyone to `admin`. The first user bootstraps as `super_admin`. A DB
trigger blocks demoting or deleting the last super-admin.

> **Project setting to confirm in the Supabase dashboard:**
> *Authentication → Providers → Email → disable "Allow new users to sign up".*
> Even left on, the `pending`-by-default trigger keeps self-registered users
> powerless — but disabling it is belt and braces.

### 15.5 Additional hardening

| Control | Implementation |
|---------|----------------|
| **HTML sanitization** | Every CMS string passes `lib/sanitize.ts` in the content layer before any `dangerouslySetInnerHTML`. Strips `<script>`, `<iframe>`, `on*` handlers, `javascript:` / `data:` URLs |
| **Structural coercion** | `coerceShape` prevents a malformed document from crashing a render |
| **Honeypot** | Hidden `company` field on both public forms; a filled honeypot returns success and stores nothing |
| **Rate limiting** | Per-IP, per-bucket, in-memory, with sweeping and a key cap |
| **Server-side scoring** | Quiz answers never reach the client before submission |
| **Service-role isolation** | `lib/supabase/admin.ts` starts with `import "server-only"` — importing it into client code is a build error |
| **Compensating rollback** | A half-created admin is deleted rather than left orphaned |
| **Self-action block** | A super-admin cannot change or remove their own access via the API |
| **Append-only audit** | `activity_log` has no update or delete policy |
| **No SQL injection surface** | All DB access is through the parameterized `supabase-js` builder; the only raw SQL is static migration files |
| **Secrets** | Service-role key is server-only; `.env.local` is gitignored; Vercel env vars are scoped |

### 15.6 Security headers (`next.config.ts`)

```ts
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },      // SAMEORIGIN, not DENY: the
                                                        // admin live-preview iframe
                                                        // frames our own pages
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: [
      "default-src 'self'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      // 'wasm-unsafe-eval' lets the Lottie WASM renderer instantiate,
      // without re-enabling arbitrary eval().
      "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
      "script-src-attr 'none'",                          // blocks inline handlers outright
      "connect-src 'self' https:",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com " +
        "https://www.google.com https://maps.google.com https://*.supabase.co " +
        "https://www.instagram.com https://instagram.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; ") },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,       // don't advertise the framework
  images: { /* §16.2 */ },
  async headers() { return [{ source: "/:path*", headers: securityHeaders }]; },
};
```

### 15.7 Threat checklist

| Threat | Mitigation |
|--------|-----------|
| Self-registration → CMS write access | `pending` default role + `is_admin()` excludes it |
| Stored XSS via rich text | `deepSanitize` in the content layer + `script-src-attr 'none'` |
| Reading the quiz answers | Excluded from the public view; scoring is server-side |
| Scraping the lead database | No anon policy on `enquiries`; inserts are service-role only |
| Draft content leaking | `published_content` view has no `draft` column |
| Locking everyone out of the CMS | Last-super-admin trigger + advisory lock |
| Form spam | Honeypot + rate limit + format validation |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'self'` |
| Analytics table poisoning | `track_view` validates, normalises and caps the path |
| Service-role key leaking to the browser | `import "server-only"` |

---

## 16. Performance & caching

The audience is on mid-range Android phones and patchy mobile data. Performance is a
feature, not a polish item.

### 16.1 CMS read caching

| Mechanism | Value |
|-----------|-------|
| `unstable_cache` revalidate | 300 s |
| Cache tag | `"cms"` |
| Client used | `createPublicClient()` — anon, **cookie-free** (a cookie-bound client is uncacheable) |
| Invalidation | `revalidateTag(CMS_TAG, { expire: 0 })` on every publish |
| Column selection | `opts.columns` fetches only rendered columns |
| Row limits | `opts.limit` fetches only rendered rows (homepage wall: 24) |

### 16.2 Image pipeline

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "i.ytimg.com" },
    { protocol: "https", hostname: "**.supabase.co" },
    { protocol: "https", hostname: "lh3.googleusercontent.com" },  // Google reviewer photos
    { protocol: "https", hostname: "maps.googleapis.com" },
  ],
  // Supabase Storage serves objects with `Cache-Control: no-cache`. Without a
  // floor, Vercel would re-fetch originals constantly and burn egress.
  minimumCacheTTL: 2_678_400,          // 31 days
  formats: ["image/avif", "image/webp"],
  deviceSizes: [640, 828, 1080, 1200, 1920],   // trimmed: fewer variants, fewer fetches
  imageSizes: [96, 200, 384],
}
```

Plus, at upload time: client-side downscale to 1600 px and WebP re-encode, and a
`Cache-Control: 31536000` on the Storage object (safe because every object key is
timestamped and therefore immutable).

### 16.3 Runtime techniques

| Technique | Where |
|-----------|-------|
| Server Components by default | Everything that does not need browser APIs |
| `Promise.all` for parallel CMS reads | `(site)/layout.tsx` and composite pages |
| YouTube facade | `<VideoFacade>` — a thumbnail; the iframe loads only on click |
| Skeleton loaders | `loading.tsx` + `<Skeleton>` — prevents CLS |
| Font `display: swap` | All three fonts |
| Desktop-only cursor | `isMobileOrTablet()` skips the effect entirely on phones |
| `next/image` everywhere | Never a raw `<img>` for content imagery |
| Route-level code splitting | App Router default |

### 16.4 Budgets (throttled 4G, mid-range Android)

| Metric | Target |
|--------|--------|
| LCP | < 2.5 s |
| CLS | < 0.1 |
| INP | < 200 ms |
| Homepage JS (first load) | < 200 KB gzipped |
| Lighthouse Performance (mobile) | ≥ 85 |
| Lighthouse Accessibility | ≥ 95 |
| Lighthouse SEO | 100 |

### 16.5 Free-tier headroom

| Resource | Free tier | Design response |
|----------|-----------|-----------------|
| Supabase DB | 500 MB | Text + JSONB only; images live in Storage |
| Supabase Storage | 1 GB | Client-side WebP compression before upload |
| Supabase egress | 5 GB / mo | Cached reads, column/row limits, 1-year media cache |
| Vercel bandwidth | 100 GB / mo | AVIF/WebP, trimmed variants, 31-day image TTL |
| Resend | 3 000 emails / mo | Two emails per lead, at most |

---

## 17. SEO & structured data

### 17.1 Metadata

`app/layout.tsx` sets the global defaults: `metadataBase`, title template
`"%s | Samantroy Academy"`, description, keywords, authors, canonical, Open Graph
(type, locale `en_IN`, siteName, image), Twitter card, robots directives
(`max-image-preview: large`, `max-snippet: -1`), and icons.

Every page then exports:

```ts
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("exams");        // reads seo.exams from the CMS
}
```

`pageMetadata` falls back to `SEO_PAGES` defaults, so metadata exists before the CMS
is populated. The home page uses `absolute: true` so its title is not suffixed.

### 17.2 Target keyword map

| Page | Primary intent |
|------|----------------|
| `/` | *best defence coaching in Odisha* · *Agniveer coaching Odisha* |
| `/exams` | *Agniveer / SSC GD / RRB / Odisha Police eligibility* |
| `/exams/[slug]` | *\<exam name\> eligibility, syllabus, physical standards* |
| `/standards` | *SSC GD height chest requirement* · *Agniveer PET timing* · *Odisha Police physical standard* |
| `/recruitment-process` | *SSC GD selection process* · *Agniveer recruitment stages* |
| `/eligibility` | *am I eligible for Army / Navy / Police* |
| `/mock-tests` | *free SSC GD mock test* · *RRB Group D practice* |
| `/courses` | *defence coaching fees Odisha* · *physical training academy* |
| `/selected` | *\<academy\> results* · *selected candidates* |
| `/resources` | *free defence exam notes PDF Odia* |
| `/blog` | Long-tail informational queries |

`/exams/[slug]` and `/standards` are the highest-value organic pages — aspirants
search for exact height, chest and timing numbers constantly. Get those right and
keep them current.

### 17.3 Structured data (JSON-LD)

Injected in `(site)/layout.tsx` as an `@graph`:

- **EducationalOrganization** — name, url, logo, slogan, description, telephone,
  email, `PostalAddress`, `sameAs` socials, `aggregateRating`.
- **LocalBusiness** ★ — add this for a physical coaching centre: `openingHours`,
  `geo` coordinates, `areaServed: Odisha`. Local intent is a large share of this
  site's traffic.
- **Course** — per course card on `/courses`.
- **FAQPage** — on pages with an FAQ block.
- **BreadcrumbList** — on interior pages.
- **Article** — on `/blog/[slug]`.

### 17.4 `sitemap.ts` and `robots.ts`

```ts
// app/sitemap.ts
const ROUTES = ["", "/about", "/recruitment-process", "/exams", "/standards",
  "/training-centres", "/courses", "/eligibility", "/mock-tests", "/resources",
  "/gallery", "/selected", "/blog", "/testimonials", "/contact"];
// plus one entry per published exam slug and per published blog slug
```

```ts
// app/robots.ts
{ rules: { userAgent: "*", allow: "/", disallow: "/api/" },
  sitemap: "https://www.samantroyacademy.com/sitemap.xml" }
```

Extend `sitemap.ts` to query `published_exams` and `published_posts` so new exam and
blog pages are discoverable automatically.

### 17.5 Local & language SEO

- Google Business Profile fully filled, with the same NAP (name, address, phone) as
  the site's JSON-LD — inconsistency here actively hurts local ranking.
- District-level content: *"Defence coaching in Cuttack / Bhubaneswar / Sambalpur"*.
- Odia-language versions of the highest-traffic explainers (`/standards`,
  `/recruitment-process`), with `hreflang` if published as separate routes.

---

## 18. Delivery phases

Each phase ends with a demonstrable, acceptance-testable result.

### Phase 0 — Discovery *(before any code)*

- Confirm every value in the brand block (§1.4).
- Collect real content: selected-candidate photos with names/exams/posts, faculty
  photos and bios, campus and ground photos, testimonials, course/batch details and
  fees, the brochure PDF.
- **Verify every physical and medical standard against the current official
  notifications** and record the source and date for each.
- Confirm the exam catalogue (§1.2) — add or remove exams the academy actually coaches.
- Decide the Odia-content scope.

**Exit criteria:** a filled brand block, a signed-off exam list, a verified standards
spreadsheet, and an assets folder.

### Phase 1 — Foundation

Next.js 16 + TypeScript + Tailwind v4 scaffold · `lib/data.ts` defaults · design
tokens and fonts · root layout with metadata · `robots.ts` / `sitemap.ts` ·
`next.config.ts` security headers · deploy to Vercel.

**Exit:** the site builds and deploys with **no** Supabase configured, rendering
entirely from code defaults.

### Phase 2 — Public site, static

All 17 pages · navbar, footer, floats · every homepage section · hero, marquees,
carousels · cursor, preloader, reveal animations · fully responsive.

**Exit:** every page renders correctly on mobile and desktop from `lib/data.ts`.

### Phase 3 — Database & auth

Migrations `0001`–`0008` · Supabase project · RLS and storage policies · first
super-admin · `/admin/login` · dashboard shell + sidebar + role gate ·
`proxy.ts` · Users and My Account screens.

**Exit:** sign in at `/admin`, add a second admin, verify a `pending` user is denied,
verify the last super-admin cannot be removed.

### Phase 4 — Content layer & section editor

`lib/content.ts` (`getPublished` / `getCollection`) · `coerceShape` · `sanitize` ·
`lib/sections.ts` registry · `SectionEditor` with autosave, live preview, publish,
rollback · `content_versions` · `/api/admin/revalidate` · activity log.

**Exit:** edit the hero, see it in preview, publish it, see it live within seconds,
roll it back.

### Phase 5 — Collections

`RecordManager` · selected candidates (with bulk import) · testimonials · faculty ·
FAQs · selections tracker · image-list managers (campus, toppers, banners, hero
slides) · media library · image cropper + client compression.

**Exit:** every collection is fully CRUD-able with photos, ordering and publish
toggles.

### Phase 6 — Domain features ★

`exams` table + `ExamsManager` + `/exams` + `/exams/[slug]` ·
`physical_standards` table + `StandardsManager` + `/standards` +
**Standards Calculator** · the 7-stage journey content · training centres.

**Exit:** an admin adds a new exam and its detail page, standards table and
calculator entry all appear without a deploy.

### Phase 7 — Lead generation

Contact form + `contact_form` config + `ContactFormManager` · `/api/contact` ·
Resend + auto-responder · `enquiries` + `EnquiryInbox` + CSV · Eligibility Finder +
`/api/lead` · enquiry popup · WhatsApp / call / chatbot.

**Exit:** a submission lands in the CRM **and** the inbox; hiding a form field does
not break server validation.

### Phase 8 — Engagement

Mock tests + `MockManager` + `/api/mock/score` · blog + `BlogManager` · resources
centre + YouTube import · Google reviews · countdown · analytics + `track_view`.

**Exit:** a visitor takes a scored mock test; answers are absent from the network tab.

### Phase 9 — Polish & launch

SEO editor + all 17 records · JSON-LD incl. LocalBusiness · Lighthouse pass against
the §16.4 budgets · accessibility audit · cross-browser and real-device testing ·
`docs/CMS.md` admin guide · a training session with the academy team · production env
vars · domain + DNS + SSL · Google Search Console + sitemap submission · Google
Business Profile.

**Exit:** live on the real domain, indexed, with the academy staff independently able
to publish content.

---

## 19. Deployment runbook

### 19.1 Supabase

1. Create a free project; note the region (choose the closest to India).
2. **SQL Editor** → run each migration in `supabase/migrations/` **in filename order**.
3. **Storage** → confirm the `media` bucket exists and is public (migration `0001`
   creates it).
4. **Authentication → Providers → Email** → **disable** "Allow new users to sign up".
5. **Authentication → Users → Add user** → this first user becomes `super_admin`.
6. **Settings → API** → copy the project URL, anon key and service-role key.

### 19.2 Vercel

1. Import the Git repository.
2. Add all environment variables from §4 to **Production, Preview and Development**.
3. Deploy. Build command `next build`, output auto-detected.
4. Add the custom domain; Vercel provisions SSL.
5. Set the `www` ↔ apex redirect and make it consistent with `metadataBase`,
   `sitemap.ts` and the JSON-LD `url` — a mismatch splits your SEO signals.

### 19.3 Resend

1. Create an API key.
2. Add and verify the sending domain (SPF + DKIM DNS records).
3. Set `CONTACT_FROM_EMAIL` to an address on the verified domain.
4. Until verification completes, `onboarding@resend.dev` works but delivers **only**
   to the address that owns the API key.

### 19.4 Post-deploy checklist

- [ ] `/admin/login` works; the first user has the `super_admin` role
- [ ] Publishing a section appears on the live site within seconds
- [ ] Rollback restores the previous version
- [ ] A contact-form submission creates an `enquiries` row **and** delivers both emails
- [ ] The honeypot silently accepts and stores nothing
- [ ] Mock-test answers are absent from the network response
- [ ] Images serve from Supabase Storage through `next/image` with long cache headers
- [ ] `/sitemap.xml` and `/robots.txt` return correctly
- [ ] Security headers present (check with securityheaders.com)
- [ ] Lighthouse mobile meets the §16.4 budgets
- [ ] A `pending` user cannot reach `/admin`
- [ ] The last super-admin cannot be demoted or removed
- [ ] Google Search Console verified; sitemap submitted
- [ ] Google Business Profile NAP matches the site's JSON-LD exactly

---

## 20. Appendices

### 20.1 Testing strategy

Pure-logic modules are unit-tested with the built-in `node --test` runner — zero test
dependencies, runs in CI in under a second.

| Test file | Covers |
|-----------|--------|
| `lib/content.test.ts` | Fallback behaviour, merge-over-default, preview branch |
| `lib/shape.test.ts` | `coerceShape` on malformed and nested documents |
| `lib/sanitize.test.ts` | Script, handler, `javascript:` URL and iframe stripping |
| `lib/eligibility.test.ts` | The rules engine across age / education / height / chest / category |
| `lib/form-defaults.test.ts` | `phoneDigits`, `isValidPhone`, `resolveContactForm` merge |
| `lib/crop.test.ts` | `coverScale`, `minZoom`, `clampOffset`, `outputSize` |
| `lib/device.test.ts` | UA + touch-point detection |
| `lib/standards.test.ts` ★ | Calculator lookup and category relaxations |

Manual QA covers rendering, responsiveness and the admin flows.

### 20.2 Naming migration reference

| Reference build | Samantroy Academy |
|-----------|-------------------|
| `recommended_candidates` | `selected_candidates` |
| `published_candidates` | `published_selected_candidates` |
| `/recommended` | `/selected` |
| `/entries` | `/exams` |
| `/ssb-process` | `/recruitment-process` |
| `/medical` | `/standards` |
| `/academies` | `/training-centres` |
| `EntriesTicker` | `ExamsTicker` |
| `Air1Marquee` | `ToppersMarquee` |
| `StudentWall` | `SelectionWall` |
| `ServicesStrip` / `four_forces` | `VerticalsStrip` / `verticals` |
| `entry_counts` | `exam_counts` |
| `join_routes` (JSON) | `exams` (table) ★ |
| `medical` (doc) | `standards` (doc) + `physical_standards` (table) ★ |
| `academies` (doc) | `centres` (doc) |
| preview cookie | `sa-preview` cookie |
| role-guard advisory lock | `samantroy_role_guard` lock |
| OIR / SRT question types | Subject-based MCQ ★ |

### 20.3 Content checklist for launch

**Photography** — selected candidates (with name, exam, post, date), faculty and PT
instructors, campus, PET ground and training, classroom, hero/passing-out imagery.

**Copy** — hero lines, about/mission, six vertical descriptions, all seven journey
stages (brief + drill + tests), course/batch details and fees, why-us cards, FAQs,
testimonials, three to five launch blog posts.

**Data** — the exam catalogue with eligibility fields, verified physical and medical
standards with sources, selection counts by year and exam, countdown dates.

**Files** — logo (light and dark), favicon, brochure PDF, preloader Lottie, syllabus
and previous-paper PDFs for the resources centre.

### 20.4 Open decisions

| # | Decision | Impact |
|---|----------|--------|
| 1 | Final brand block (§1.4) | Blocks Phase 1 seed data |
| 2 | Odia scope — font only, or full parallel content? | Affects the content model and page count |
| 3 | Do exams need individual `/exams/[slug]` pages at launch, or is a catalogue enough for v1? | Affects Phase 6 size |
| 4 | Books section — does the academy publish study material? | Keep or drop the section |
| 5 | Online payment — Razorpay pages, or enquiry-only? | Affects the course CTAs |
| 6 | Blog cadence and who writes it | Affects whether the blog ships in v1 |
| 7 | Are physical standards published per district, or state-wide only? | Affects `physical_standards.region` usage |
| 8 | Should mock tests require registration (lead-gating) or stay fully free? | Affects the quiz flow |

### 20.5 A note on content accuracy

Two categories of content on this site can cause real harm if wrong:

1. **Physical and medical standards.** An aspirant who trains to the wrong run timing,
   or believes they are 1 cm short when they are not, loses a recruitment cycle.
2. **Eligibility criteria and dates.** A wrong age band or a missed notification date
   costs an attempt.

Both change between notification cycles. The design accounts for this with the
`verifiedOn` field and the "always confirm with the official notification" line — but
the real control is **process**: assign one person to re-verify these tables against
the official notification at the start of every recruitment cycle, and log it in the
activity trail.

---

*End of blueprint. Generated 10 September 2026.*
