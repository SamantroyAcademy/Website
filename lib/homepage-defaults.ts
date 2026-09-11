/** Plain data for the homepage sections. Importable from server and client. */

/** Exams marquee: exam name + optional selected count. A blank count shows
 *  the exam name alone (we never print a number the academy has not given). */
export type EntryCount = { entry: string; count: number | string };
export const ENTRY_COUNTS: EntryCount[] = [
  { entry: "Army Agniveer GD", count: "" },
  { entry: "SSC GD Constable", count: "" },
  { entry: "Navy Agniveer SSR", count: "" },
  { entry: "Navy Agniveer MR", count: "" },
  { entry: "Airman X and Y", count: "" },
  { entry: "Odisha Police", count: "" },
  { entry: "RRB Group D", count: "" },
  { entry: "RPF Constable", count: "" },
  { entry: "Coast Guard Navik", count: "" },
  { entry: "Forest Guard", count: "" },
];

/** Top-rank / result cards (image list). Empty until the academy uploads them. */
export const AIR1_IMAGES: string[] = [];

/** Campus / ground gallery. Generic training photography until real campus
 *  photos are uploaded in Admin -> Campus Gallery. */
export const CAMPUS_IMAGES: string[] = [
  "/images/scenes/field-training.jpg",
  "/images/scenes/police-training.jpg",
  "/images/scenes/army-parade.jpg",
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
  "Residential seats for the offline batch are allotted on a first-come basis. Ask at enquiry for availability.";

/** Google reviews: the admin imports or types them in. */
export type GoogleReview = {
  url: string;
  name: string;
  rating: number;
  text: string;
  avatar?: string;
  date?: string;
};
export const GOOGLE_REVIEWS: GoogleReview[] = [];

/** Google Business profile link for the "see all reviews" button. */
export const GOOGLE_PLACE_URL = "https://maps.google.com/maps?q=Samantroy%20Academy%20Odisha";

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
  body: "Tell us your age, education and height. A trainer will call back with the exams you can apply for and the batch that fits.",
  delayMs: "6000",
};
