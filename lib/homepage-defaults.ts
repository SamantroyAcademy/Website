/** Plain data for the homepage sections. Importable from server and client. */

import { RESULT_POSTERS } from "@/lib/hero-slides";

/** Exams marquee: exam name + optional selected count. A blank count shows
 *  the exam name alone (we never print a number the academy has not given). */
export type EntryCount = { entry: string; count: number | string };
export const ENTRY_COUNTS: EntryCount[] = [
  { entry: "Army GD and Technical", count: "" },
  { entry: "Navy SSR and MR", count: "" },
  { entry: "Air Force X and Y", count: "" },
  { entry: "BSF, CRPF, CISF, SSB", count: "" },
  { entry: "Odisha Police and SI", count: "" },
  { entry: "OSSC, OSSSC, OPSC, ASO", count: "" },
  { entry: "Bank PO and Clerk", count: "" },
  { entry: "Railway and SSC CGL", count: "" },
  { entry: "NDA, CDS, AFCAT", count: "" },
  { entry: "Coast Guard Navik", count: "" },
];

/** Result posters (image list), newest first. */
export const AIR1_IMAGES: string[] = RESULT_POSTERS;

/** Campus / ground gallery. Generic training photography until real campus
 *  photos are uploaded in Admin -> Campus Gallery. */
export const CAMPUS_IMAGES: string[] = [
  "/images/scenes/field-training.jpg",
  "/images/scenes/police-training.jpg",
  "/images/scenes/gorkha-rifles-parade-2016.jpg",
  "/images/forces/crpf-contingent.jpg",
  "/images/forces/bsf-contingent.jpg",
  "/images/forces/navy-contingent.jpg",
];

/** "Now serving" alumni banners (image list). Empty until uploaded. */
export const OFFICER_BANNERS: string[] = [];

/** Display switches for the courses section. */
export type CoursesOptions = { showPrices: string };
export const COURSES_OPTIONS: CoursesOptions = { showPrices: "on" };

/** Hostel / facilities note under the courses section. */
export const COURSES_NOTE =
  "Coming from outside Brahmapur? Call the academy and we will help you with accommodation near the centre.";

/** Google reviews: the admin imports or types them in. */
export type GoogleReview = {
  url: string;
  name: string;
  rating: number;
  text: string;
  avatar?: string;
  date?: string;
  /** When Google says it was posted (imported reviews only). */
  publishedAt?: string;
  /** Photos the reviewer attached (R2 paths or Google links). */
  photos?: string[];
};
export const GOOGLE_REVIEWS: GoogleReview[] = [];

/** Google Business profile link for the "see all reviews" button. */
export const GOOGLE_PLACE_URL = "https://www.google.com/maps/place/Samantroy+Academy/@19.2935554,84.7925175,18z/data=!4m6!3m5!1s0x3a3d5aa2c3ee6c09:0x2980bdca1fe41371!8m2!3d19.2935554!4d84.7925175!16s%2Fg%2F11byyqh2r_";

/** The enquiry popup that opens shortly after the site loads. */
export type EnquiryPopupDoc = {
  enabled: string; // "on" | "off"
  title: string;
  subtitle: string;
  body: string; // HTML
  delayMs: string;
};
export const ENQUIRY_POPUP: EnquiryPopupDoc = {
  enabled: "on",
  title: "Book a free counselling call",
  subtitle: "Find out which exams you qualify for",
  body: "New batches: NDA from 21 September, CDS from 14 October. We call back with the exams you qualify for.",
  delayMs: "6000",
};
