/** Six Verticals section (CMS key: verticals). Replaces SSB Wings' Four
 *  Forces with the six recruitment verticals Samantroy covers. Same doc shape
 *  (kicker/title/subtitle/cards) so the manager component carries over. */

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
    motto: "Police, forest, fire",
    desc: "Odisha Police constable and SI, forest guard, fire services and OSSSC posts, with Odia and Odisha GK built in.",
    image: "/images/scenes/police-training.jpg",
    alt: "Police recruits in a training session outdoors",
    tone: "odisha",
    icon: "police",
    entries: ["OP Constable", "OP SI", "Forest Guard", "Fireman", "OSSSC"],
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
    name: "SSC and central",
    motto: "MTS, CHSL, CGL",
    desc: "Desk posts across central government. Pure written preparation, sharpened with timed test series.",
    image: "/images/scenes/odisha-police-hq.jpg",
    alt: "Government office building in Bhubaneswar",
    tone: "navy",
    icon: "buildings",
    entries: ["SSC MTS", "Havaldar", "CHSL", "CGL"],
    link: "/exams?vertical=ssc",
  },
  {
    name: "Officer entries",
    motto: "NDA, CDS, AFCAT",
    desc: "For aspirants aiming for a commission: written preparation plus the five-day SSB interview.",
    image: "/images/scenes/ima-guard.jpg",
    alt: "Cadets on parade at a military academy",
    tone: "airforce",
    icon: "star",
    entries: ["NDA", "CDS", "AFCAT", "SSB interview"],
    link: "/exams?vertical=officer",
  },
];

export const VERTICALS_DOC: VerticalsDoc = {
  kicker: "",
  title: "Six ways into uniform",
  subtitle: "Pick the recruitment you are aiming for. The written exam, the ground and the medical all change with it.",
  cards: VERTICAL_CARDS,
};
