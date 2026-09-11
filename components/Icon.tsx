import type { ComponentType } from "react";
import {
  TargetIcon, MedalIcon, CompassIcon, UsersThreeIcon, ShieldCheckIcon, ScalesIcon,
  PersonSimpleRunIcon, BarbellIcon, BookOpenIcon, ExamIcon, ClipboardTextIcon,
  HeartbeatIcon, RulerIcon, TrainIcon, AnchorIcon, AirplaneTiltIcon, PoliceCarIcon,
  StarIcon, FlagIcon, MapTrifoldIcon, HandshakeIcon, GraduationCapIcon, CertificateIcon,
  TimerIcon, LightningIcon, SunHorizonIcon, StrategyIcon, MegaphoneIcon, CalendarCheckIcon,
  StethoscopeIcon, EyeIcon, FileTextIcon, IdentificationCardIcon, ListChecksIcon,
  TrophyIcon, MedalMilitaryIcon, CrosshairIcon, SirenIcon, TreeIcon, FireIcon,
  BuildingsIcon, StudentIcon, ChalkboardTeacherIcon, LifebuoyIcon, MountainsIcon,
  CalculatorIcon, BrainIcon, TranslateIcon, GlobeIcon, NewspaperIcon, ChartBarIcon,
  FootprintsIcon, HandFistIcon, BedIcon, ForkKnifeIcon, BooksIcon, NotePencilIcon,
  GaugeIcon, HourglassIcon, WrenchIcon, SealCheckIcon,
} from "@phosphor-icons/react/ssr";
import type { IconKey } from "@/lib/icons";

type PhosphorProps = { size?: number | string; weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone"; className?: string };

const MAP: Record<IconKey, ComponentType<PhosphorProps>> = {
  target: TargetIcon, medal: MedalIcon, compass: CompassIcon, users: UsersThreeIcon,
  shield: ShieldCheckIcon, scales: ScalesIcon, run: PersonSimpleRunIcon, barbell: BarbellIcon,
  book: BookOpenIcon, exam: ExamIcon, clipboard: ClipboardTextIcon, heartbeat: HeartbeatIcon,
  ruler: RulerIcon, train: TrainIcon, anchor: AnchorIcon, plane: AirplaneTiltIcon,
  police: PoliceCarIcon, star: StarIcon, flag: FlagIcon, map: MapTrifoldIcon,
  handshake: HandshakeIcon, graduation: GraduationCapIcon, certificate: CertificateIcon,
  timer: TimerIcon, lightning: LightningIcon, sunrise: SunHorizonIcon, strategy: StrategyIcon,
  megaphone: MegaphoneIcon, calendar: CalendarCheckIcon, stethoscope: StethoscopeIcon,
  eye: EyeIcon, document: FileTextIcon, "id-card": IdentificationCardIcon,
  checklist: ListChecksIcon, trophy: TrophyIcon, "military-medal": MedalMilitaryIcon,
  crosshair: CrosshairIcon, siren: SirenIcon, tree: TreeIcon, fire: FireIcon,
  buildings: BuildingsIcon, student: StudentIcon, teacher: ChalkboardTeacherIcon,
  lifebuoy: LifebuoyIcon, mountains: MountainsIcon, calculator: CalculatorIcon,
  brain: BrainIcon, translate: TranslateIcon, globe: GlobeIcon, newspaper: NewspaperIcon,
  chart: ChartBarIcon, footprints: FootprintsIcon, fist: HandFistIcon, bed: BedIcon,
  food: ForkKnifeIcon, books: BooksIcon, pencil: NotePencilIcon, gauge: GaugeIcon,
  hourglass: HourglassIcon, wrench: WrenchIcon, seal: SealCheckIcon,
};

/** Renders a CMS icon key. Unknown values (including emoji saved in older
 *  content) fall back to a neutral glyph instead of breaking the card. */
export default function Icon({
  name,
  size = 26,
  weight = "duotone",
  className = "",
}: {
  name: string | null | undefined;
  size?: number;
  weight?: PhosphorProps["weight"];
  className?: string;
}) {
  const Cmp = (name && MAP[name as IconKey]) || SealCheckIcon;
  return <Cmp size={size} weight={weight} className={className} aria-hidden />;
}
