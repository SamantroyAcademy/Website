/** Six Verticals section (CMS key: verticals): the six recruitment verticals
 *  Samantroy covers, as kicker/title/subtitle/cards for the manager. */

import type { Tone } from "@/lib/data";

export type VerticalCard = {
  name: string;
  motto: string;
  desc: string;
  image: string;
  alt: string;
  tone: Tone;
  icon: string;
  entries: string[];
  link: string;
};

export type VerticalsDoc = {
  kicker: string;
  title: string;
  subtitle: string;
  cards: VerticalCard[];
};

export const VERTICAL_CARDS: VerticalCard[] = [
  {
    name: "Army, Navy, Air Force",
    motto: "Agniveer entries",
    desc: "The recruitment rally, the Navy's CBT and the Air Force X and Y tests. Written plus physical, trained together.",
    image: "/images/scenes/army-parade.jpg",
    alt: "Indian Army contingent marching at the Republic Day parade",
    tone: "army",
    icon: "military-medal",
    entries: ["Agniveer GD", "Navy SSR", "Navy MR", "Airman X", "Airman Y"],
    link: "/exams?vertical=armed-forces",
  },
  {
    name: "CAPF",
    motto: "SSC GD Constable",
    desc: "One exam, eight forces. The 5 km run decides more selections than the CBT does.",
    image: "/images/forces/crpf-contingent.jpg",
    alt: "CRPF marching contingent at the Republic Day parade",
    tone: "capf",
    icon: "shield",
    entries: ["BSF", "CRPF", "CISF", "ITBP", "SSB", "Assam Rifles"],
    link: "/exams?vertical=capf",
  },
  {
    name: "Odisha State",
    motto: "Police, SI, OSSC, OPSC",
    desc: "Odisha Police constable and SI, OSSC, OSSSC, OPSC and ASO, forest and fire services, with Odia and Odisha GK built in.",
    image: "/images/scenes/police-training.jpg",
    alt: "Police recruits in a training session outdoors",
    tone: "odisha",
    icon: "police",
    entries: ["OP Constable", "OP SI", "OSSC", "OSSSC", "OPSC", "ASO"],
    link: "/exams?vertical=odisha",
  },
  {
    name: "Railways",
    motto: "RRB and RPF",
    desc: "Group D, NTPC, ALP and RPF. Speed on the CBT, then the weighted carry and the 1000 m run.",
    image: "/images/forces/railways.jpg",
    alt: "Odisha Sampark Kranti express at Balasore station",
    tone: "railway",
    icon: "train",
    entries: ["Group D", "NTPC", "ALP", "RPF Constable"],
    link: "/exams?vertical=railways",
  },
  {
    name: "Bank and SSC",
    motto: "Bank PO, Clerk, CGL",
    desc: "Bank PO and Clerk, SSC CGL and central desk posts. Pure written preparation, sharpened with timed test series.",
    image: "/images/scenes/odisha-police-hq.jpg",
    alt: "Government office building in Odisha",
    tone: "navy",
    icon: "buildings",
    entries: ["Bank PO", "Bank Clerk", "SSC CGL", "CHSL", "MTS"],
    link: "/exams?vertical=ssc",
  },
  {
    name: "Officer entries",
    motto: "NDA, TES, CDS, AFCAT",
    desc: "For aspirants aiming for a commission: written preparation plus the SSB interview. Recent results include AFCAT AIR 183 and Army ACC AIR 26.",
    image: "/images/scenes/ima-guard.jpg",
    alt: "Cadets on parade at a military academy",
    tone: "airforce",
    icon: "star",
    entries: ["NDA", "NA", "TES", "CDS", "AFCAT", "NCC"],
    link: "/exams?vertical=officer",
  },
];

export const VERTICALS_DOC: VerticalsDoc = {
  kicker: "",
  title: "Six ways into uniform",
  subtitle: "Pick the recruitment you are aiming for. The written exam, the ground and the medical all change with it.",
  cards: VERTICAL_CARDS,
};
