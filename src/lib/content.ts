import "server-only";
import { cache } from "react";
import { seed } from "@/content/seed";
import { client } from "@/sanity/client";
import { archiveQuery } from "@/sanity/queries";
import type { Archive, Category, Film, Picture, Project, Row, RowLayout, Settings } from "./types";

/* ------------------------------------------------------------------ */
/* Raw Sanity shapes                                                   */
/* ------------------------------------------------------------------ */

type RawPicture = {
  alt?: string;
  hotspot?: { x: number; y: number };
  url?: string;
  lqip?: string;
  w?: number;
  h?: number;
} | null;

type RawFrame = RawPicture & { _key: string; caption?: string; exposure?: Record<string, string> };

type RawProject = {
  slug: string;
  title?: string;
  subtitle?: string;
  kind?: "commissioned" | "personal";
  categories?: Category[];
  client?: string;
  place?: string;
  year?: string;
  role?: string;
  summary?: string;
  story?: string;
  brief?: string;
  featured?: boolean;
  cover?: RawPicture;
  rows?: { _key: string; layout?: RowLayout; frames?: RawFrame[] }[];
};

type RawFilm = {
  slug: string;
  title?: string;
  client?: string;
  year?: string;
  roles?: string[];
  duration?: string;
  aspect?: Film["aspect"];
  previewStart?: number;
  note?: string;
  credits?: { role: string; name: string }[];
  showreel?: boolean;
  poster?: RawPicture;
  playbackId?: string;
  fileUrl?: string;
};

type RawArchive = {
  settings: (Partial<Omit<Settings, "portrait" | "hero" | "origin">> & {
    origin?: string;
    portrait?: RawPicture;
    hero?: RawPicture;
  }) | null;
  projects: RawProject[] | null;
  films: RawFilm[] | null;
};

/* ------------------------------------------------------------------ */
/* Mapping                                                             */
/* ------------------------------------------------------------------ */

function toPicture(raw: RawPicture | undefined, fallbackAlt = ""): Picture | null {
  if (!raw?.url || !raw.w || !raw.h) return null;
  return {
    src: raw.url,
    width: raw.w,
    height: raw.h,
    alt: raw.alt || fallbackAlt,
    lqip: raw.lqip,
    focus: raw.hotspot ? { x: raw.hotspot.x, y: raw.hotspot.y } : undefined,
    cdn: true,
  };
}

/** Plain text with blank lines between paragraphs becomes a list of paragraphs. */
function paragraphs(text?: string): string[] {
  return (text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function clean<T>(list: (T | null | undefined)[]): T[] {
  return list.filter((x): x is T => x != null);
}

type Draft = Omit<Project, "coverNo">;

function mapProject(raw: RawProject): Draft | null {
  const rows: Row[] = clean(
    (raw.rows || []).map((row) => {
      const frames = clean(
        (row.frames || []).map((f) => {
          const picture = toPicture(f, raw.title);
          return picture
            ? { key: f._key, no: 0, picture, caption: f.caption, exposure: f.exposure }
            : null;
        }),
      );
      return frames.length ? { key: row._key, layout: row.layout || "full", frames } : null;
    }),
  );
  const cover = toPicture(raw.cover, raw.title) || rows[0]?.frames[0]?.picture;
  if (!cover || !raw.title) return null;
  return {
    slug: raw.slug,
    title: raw.title,
    subtitle: raw.subtitle,
    kind: raw.kind || "personal",
    categories: raw.categories || [],
    client: raw.client,
    place: raw.place || "",
    year: raw.year || "",
    role: raw.role || "Photographer",
    summary: raw.summary || "",
    story: paragraphs(raw.story),
    brief: raw.brief,
    cover,
    rows,
    featured: raw.featured ?? true,
  };
}

function mapFilm(raw: RawFilm): Film | null {
  const poster = toPicture(raw.poster, raw.title);
  if (!poster || !raw.title) return null;
  return {
    slug: raw.slug,
    title: raw.title,
    client: raw.client,
    year: raw.year || "",
    roles: raw.roles || [],
    duration: raw.duration,
    aspect: raw.aspect || "16:9",
    poster,
    source: raw.playbackId
      ? { kind: "mux", playbackId: raw.playbackId }
      : raw.fileUrl
        ? { kind: "file", url: raw.fileUrl }
        : null,
    previewStart: raw.previewStart,
    note: raw.note,
    credits: raw.credits || [],
    showreel: !!raw.showreel,
  };
}

function mapSettings(raw: RawArchive["settings"]): Settings {
  const base = seed.settings;
  if (!raw) return base;
  const pick = <K extends keyof Settings>(k: K, v: Settings[K] | undefined | null): Settings[K] =>
    v === undefined || v === null || (Array.isArray(v) && v.length === 0) || v === "" ? base[k] : v;
  return {
    name: pick("name", raw.name),
    title: pick("title", raw.title),
    tagline: pick("tagline", raw.tagline),
    location: pick("location", raw.location),
    availability: pick("availability", raw.availability),
    intro: pick("intro", raw.intro),
    origin: pick("origin", paragraphs(raw.origin)),
    approach: pick("approach", raw.approach),
    portrait: toPicture(raw.portrait, "Portrait of Hassan Badawy") || base.portrait,
    hero: toPicture(raw.hero) || base.hero,
    email: pick("email", raw.email),
    whatsapp: raw.whatsapp?.replace(/\D/g, "") || base.whatsapp,
    whatsappMessage: pick("whatsappMessage", raw.whatsappMessage),
    calLink: raw.calLink?.replace(/^https?:\/\/(app\.)?cal\.com\//, "") || base.calLink,
    clients: pick("clients", raw.clients),
    socials: pick("socials", raw.socials),
    cvUrl: raw.cvUrl || base.cvUrl,
    seoDescription: pick("seoDescription", raw.seoDescription),
  };
}

/** Gives every frame a global number in archive order and resolves cover numbers. */
function number(projects: Draft[]): { projects: Project[]; totalFrames: number } {
  let n = 0;
  const numbered = projects.map((p) => {
    const rows = p.rows.map((row) => ({
      ...row,
      frames: row.frames.map((f) => ({ ...f, no: ++n })),
    }));
    const frames = rows.flatMap((r) => r.frames);
    const match = frames.find((f) => f.picture.src === p.cover.src);
    return { ...p, rows, coverNo: match?.no ?? frames[0]?.no ?? 0 };
  });
  return { projects: numbered, totalFrames: n };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

async function fromSanity(): Promise<Archive | null> {
  if (!client) return null;
  try {
    const raw = await client.fetch<RawArchive>(archiveQuery, {}, { next: { revalidate: 3600, tags: ["sanity"] } });
    // Until the first project or film is published in the Studio, keep showing
    // the built-in ones so a freshly connected, empty Studio never blanks the site.
    const published = clean((raw.projects || []).map(mapProject));
    const { projects, totalFrames } = number(published.length ? published : seed.projects);
    const films = clean((raw.films || []).map(mapFilm));
    return {
      settings: mapSettings(raw.settings),
      projects,
      films: films.length ? films : seed.films,
      totalFrames,
    };
  } catch (error) {
    console.error("[content] Sanity fetch failed, using built-in content instead.", error);
    return null;
  }
}

function fromSeed(): Archive {
  const { projects, totalFrames } = number(seed.projects);
  return { settings: seed.settings, projects, films: seed.films, totalFrames };
}

export const getArchive = cache(async (): Promise<Archive> => (await fromSanity()) ?? fromSeed());

export async function getProject(slug: string) {
  const { projects } = await getArchive();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  return { project: projects[index], next: projects[(index + 1) % projects.length] };
}

export async function getFilm(slug: string) {
  const { films } = await getArchive();
  return films.find((f) => f.slug === slug) ?? null;
}
