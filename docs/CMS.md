# Samantroy Academy content manager: admin guide

Sign in at **`/admin/login`**. Everything on the public site can be changed here without
touching code.

## How changes go live

- **Page sections** (headlines, paragraphs, cards, the recruitment journey, standards
  copy...) save as a **draft** as you type. Nothing is public until you press
  **Publish live**. While the editor is open you see drafts on the live site, with a
  saffron bar at the top; press **Exit preview** there to see the public version.
- **Rollback** restores the previously published version of a section, one step at a time.
- **Lists** (selected candidates, faculty, testimonials, FAQs, exams, standards, mock
  questions, blog) go live as soon as you save. Use **Hide** to take one item offline
  without deleting it.
- Changes normally appear within seconds. If one does not, wait five minutes (the site
  caches published content) or publish again.

## Where to edit what

| I want to change... | Go to |
| --- | --- |
| Homepage section order, or hide a section | Homepage, Section Order |
| Hero headline, rotating words, buttons | Pages and Sections, Hero |
| Hero posters (rotating beside the headline) | Homepage, Hero Posters |
| Student stories (YouTube Shorts) | Homepage, Student Shorts: paste a link or Fetch latest from a channel |
| Result posters strip | Homepage, Result Posters |
| Batches, fees, course buttons | Exams and learning, Courses and Batches |
| Hide all prices | Pages and Sections, Course Prices |
| An exam's eligibility, pattern, syllabus | Exams Catalogue (each exam has its own page at /exams/slug) |
| Height, chest, run timings | Physical Standards |
| The seven recruitment stages | Pages and Sections, Recruitment Journey |
| Phone, WhatsApp, email, address, map, socials | Site, Footer and Contact |
| Enquiry form: add, delete and reorder fields (drag or arrows), add your own questions (short answer, paragraph, dropdown, number), edit each dropdown's options, and Show / In popup / Mandatory per field. Answers to added questions appear in Enquiries, the email and the CSV | Site, Enquiry Form |
| Odia translations | Site, Odia Translations |
| The popup that greets visitors | Site, Enquiry Popup |
| Page titles for Google | Site, SEO |
| Upcoming batch and exam dates (homepage countdown and the batches popup shown when the site opens; the popup has its own on/off switch) | Homepage, Countdown |

## Odia (ଓଡ଼ିଆ)

Everything you publish is translated into Odia automatically in the background, a minute or
so after you save. You never need to press a translate button. To check or correct the Odia,
open **Site, Odia Translations**: edit a line and press **Save and publish**. Your edits are
kept. Free AI models are limited per day, so after a big change some text may show in English
for a few hours until the nightly run finishes it.

## Leads

Every enquiry (contact form, popup, eligibility finder, mock test) lands in
**Enquiries**. Move each one from *new* to *contacted*, *enrolled* or *dropped*, add notes,
and export CSV. Leads are saved even if email is not configured.

## Accuracy

Physical standards, age bands and exam patterns change with every notification. Before
each recruitment cycle, check them against the official notification, update the rows,
and update the accuracy note under Pages and Sections, Standards Page Content.

## Images

Uploads are cropped to the frame they appear in, compressed automatically and stored in
Cloudflare R2. Images can be up to 10 MB before compression and PDFs up to 25 MB. Use real
photographs of the academy's ground, classroom and selected candidates.

**Media Library** lists every uploaded file by folder. **Delete** removes a file for good, but
only when no page, candidate, testimonial, mentor, post, resource or exam still uses it; if
one does, the message says where, so replace it there first. Deletions are recorded in the
activity log.

## People and access

- **Super admin** can add, promote, demote and remove admins (Users).
- **Admin** can edit all content.
- New sign-ups have no access until a super admin adds them. The last super admin can
  never be removed, so the site can never be locked out.
- Change your own password under My Account. The admin signs you out when you close the tab.
