/** Training centres and recruiting bodies (CMS key: centres).
 *  Replaces SSB Wings' academies.ts. Same shape, so the section editor and
 *  the page component work unchanged. */

export type CentreCourse = { name: string; duration: string; who: string };
export type Centre = {
  short: string;
  name: string;
  motto: string;
  location: string;
  service: string;
  established: string;
  image: string;
  intro: string;
  courses: CentreCourse[];
  highlights: string[];
};
export type CentresDoc = {
  kicker: string;
  kickerSize?: string;
  title: string;
  subtitle: string;
  items: Centre[];
};

export const CENTRES: Centre[] = [
  {
    short: "INS Chilka",
    name: "INS Chilka",
    motto: "Sailor training establishment",
    location: "Chilika, Khordha, Odisha",
    service: "Indian Navy, Agniveer (SSR and MR)",
    established: "",
    image: "/images/forces/navy-contingent.jpg",
    intro:
      "<p>The Navy's training establishment for sailors sits on the shore of Chilika Lake, in Odisha itself. Every Navy Agniveer, SSR and MR, begins service here.</p>",
    courses: [{ name: "Agniveer basic training", duration: "About 16 weeks (check current notification)", who: "Navy Agniveer SSR and MR" }],
    highlights: ["In Odisha", "Swimming and seamanship", "Drill and weapon training"],
  },
  {
    short: "ARO",
    name: "Army Recruiting Offices",
    motto: "Where the rally is held",
    location: "Recruiting offices serving Odisha districts",
    service: "Indian Army, Agniveer",
    established: "",
    image: "/images/scenes/army-parade.jpg",
    intro:
      "<p>Army Recruiting Offices run the recruitment rallies for Agniveer entries. The rally is where running, beam, ditch and balance are tested before the medical.</p>",
    courses: [{ name: "Recruitment rally", duration: "Over several days per district", who: "Candidates who clear the online CEE" }],
    highlights: ["Rally venue announced in the admit card", "Physical test then medical", "District-wise schedule"],
  },
  {
    short: "CAPF centres",
    name: "CAPF recruit training centres",
    motto: "BSF, CRPF, CISF, ITBP, SSB",
    location: "Across India",
    service: "Central Armed Police Forces, SSC GD",
    established: "",
    image: "/images/forces/bsf-contingent.jpg",
    intro:
      "<p>Selected SSC GD constables join the recruit training centre of their allotted force for basic training in drill, weapons, fieldcraft and law.</p>",
    courses: [{ name: "Basic recruit training", duration: "Several months (varies by force)", who: "SSC GD Constable selectees" }],
    highlights: ["Force allotted on merit and preference", "Drill, weapons and fieldcraft", "Physical conditioning continues"],
  },
  {
    short: "Odisha Police",
    name: "Odisha Police training",
    motto: "State police academy and training centres",
    location: "Odisha",
    service: "Odisha Police, Constable and SI",
    established: "",
    image: "/images/scenes/police-training.jpg",
    intro:
      "<p>Selected constables and sub-inspectors in Odisha complete basic training at the state's police training institutions before their first posting.</p>",
    courses: [
      { name: "Constable basic training", duration: "As per notification", who: "Selected constables" },
      { name: "SI basic training", duration: "As per notification", who: "Selected sub-inspectors" },
    ],
    highlights: ["Law and procedure", "Drill and weapons", "Field posting after training"],
  },
];

export const CENTRES_DOC: CentresDoc = {
  kicker: "",
  title: "Where recruits are trained",
  subtitle: "What happens after selection: the centre you report to, how long training runs and who trains there.",
  items: CENTRES,
};
