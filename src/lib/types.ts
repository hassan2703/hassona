/**
 * The shapes every page works with. Content can come from Sanity or from the
 * local seed file; both are mapped into these types so components never care
 * where a photograph lives.
 */

export type Picture = {
  /** Full URL. For Sanity images this is the CDN base URL without size params. */
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Tiny base64 preview shown while the real image loads. */
  lqip?: string;
  /** Focal point, 0 to 1 on each axis. Used when an image has to be cropped. */
  focus?: { x: number; y: number };
  /** True when src is a Sanity CDN URL that accepts resize params. */
  cdn?: boolean;
  /** Marks generated stand-in artwork so it is never mistaken for real work. */
  placeholder?: boolean;
};

export type ExposureData = {
  camera?: string;
  lens?: string;
  shutter?: string;
  aperture?: string;
  iso?: string;
  film?: string;
};

export type Frame = {
  key: string;
  /** Global frame number across the whole archive, e.g. 14 renders "Fr. 014". */
  no: number;
  picture: Picture;
  caption?: string;
  exposure?: ExposureData;
};

export type RowLayout = "full" | "pair" | "silence" | "offset" | "sequence";

export type Row = {
  key: string;
  layout: RowLayout;
  frames: Frame[];
};

export type Category = "street" | "architecture" | "portraits" | "events" | "journeys";

export type Project = {
  slug: string;
  title: string;
  /** Optional second line on the title card, set in italics. */
  subtitle?: string;
  kind: "commissioned" | "personal";
  categories: Category[];
  client?: string;
  place: string;
  year: string;
  role: string;
  summary: string;
  story: string[];
  brief?: string;
  cover: Picture;
  coverNo: number;
  rows: Row[];
  featured: boolean;
  placeholder?: boolean;
};

export type FilmSource =
  | { kind: "mux"; playbackId: string }
  | { kind: "file"; url: string }
  | null;

export type Film = {
  slug: string;
  title: string;
  client?: string;
  year: string;
  roles: string[];
  duration?: string;
  aspect: "16:9" | "2.39:1" | "9:16" | "4:5";
  poster: Picture;
  source: FilmSource;
  /** Seconds into the film where the silent hover preview starts. */
  previewStart?: number;
  note?: string;
  credits: { role: string; name: string }[];
  showreel: boolean;
  placeholder?: boolean;
};

export type SocialLink = { label: string; url: string; handle?: string };

export type Settings = {
  name: string;
  title: string;
  tagline: string;
  location: string;
  availability: string;
  intro: string;
  origin: string[];
  approach: { title: string; text: string }[];
  portrait: Picture;
  hero: Picture;
  email: string;
  /** Digits only with country code, e.g. 201112289036. Used for wa.me links. */
  whatsapp?: string;
  whatsappMessage: string;
  /** Cal.com link path, e.g. "hassanbadawy/intro". */
  calLink?: string;
  clients: string[];
  socials: SocialLink[];
  cvUrl?: string;
  seoDescription: string;
};

export type Archive = {
  settings: Settings;
  projects: Project[];
  films: Film[];
  totalFrames: number;
};
