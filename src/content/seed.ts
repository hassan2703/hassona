/**
 * Built-in content. The site runs on this until Sanity is connected, and it
 * fills any gap Sanity leaves (for example, before Site settings exist).
 *
 * Every image here is generated placeholder artwork, labelled as such on the
 * image itself. Text marked DRAFT was written from Hassan's interview answers
 * and is meant to be rewritten in his own words.
 */
import type { Category, Film, Picture, Project, Row, RowLayout, Settings } from "@/lib/types";
import manifest from "./placeholders.json";

type SeriesId = keyof typeof manifest;

function pic(series: SeriesId, index: number, alt: string): Picture {
  const item = manifest[series][index];
  return { ...item, alt: `Placeholder artwork. ${alt}`, placeholder: true };
}

/** Lays frames out row by row following a list of layouts. */
function rows(series: SeriesId, layouts: RowLayout[], alt: (i: number) => string, captions: Record<number, string> = {}): Row[] {
  const per: Record<RowLayout, number> = { full: 1, silence: 1, pair: 2, offset: 2, sequence: 3 };
  let i = 0;
  return layouts.map((layout, r) => {
    const frames = Array.from({ length: per[layout] }, () => {
      const at = i++;
      return { key: `${series}-${at}`, no: 0, picture: pic(series, at, alt(at)), caption: captions[at] };
    });
    return { key: `${series}-row-${r}`, layout, frames };
  });
}

type SeedProject = Omit<Project, "coverNo">;

const projects: SeedProject[] = [
  {
    slug: "saint-catherine",
    title: "Saint Catherine",
    subtitle: "Toward an endless place",
    kind: "personal",
    categories: ["journeys"] as Category[],
    place: "South Sinai, Egypt",
    year: "2022",
    role: "Photographer · Personal work",
    summary: "Two guides, a ridge, and the feeling of walking toward somewhere without an end.",
    story: [
      // DRAFT
      "In 2022 I went hiking in the mountains of Saint Catherine with two local guides. I wasn't there for a client. I was there with my own head.",
      "This is what I kept: the light, the quiet, and the two of them walking ahead of me toward a place that didn't seem to end. It is still the frame I would show you if I could only show one.",
    ],
    cover: pic("saint-catherine", 0, "Two guides walking toward the mountains of Saint Catherine."),
    rows: rows(
      "saint-catherine",
      ["full", "pair", "silence", "offset", "full", "sequence", "pair"],
      (i) => `Saint Catherine, frame ${i + 1}.`,
      { 0: "The guides, walking ahead." },
    ),
    featured: true,
  },
  {
    slug: "kerastase-elixir",
    title: "Kérastase",
    subtitle: "Elixir launch at the Citadel",
    kind: "commissioned",
    categories: ["events"],
    client: "L'Oréal · Kérastase",
    place: "Salah El-Din Citadel, Cairo",
    year: "2024",
    role: "Photographer",
    summary: "Launch coverage for Kérastase Elixir, an evening at the Citadel in Cairo.",
    brief: "Photograph the launch of Kérastase Elixir for L'Oréal: the guests, the product and the atmosphere of the evening.", // DRAFT
    story: [
      // DRAFT
      "A launch is a single night that has to live on for months in press, social and the brand's own archive. I worked the room the way I work a street: watching first, then moving in when the moment arrived.",
    ],
    cover: pic("kerastase-elixir", 0, "The Kérastase Elixir launch at Salah El-Din Citadel."),
    rows: rows("kerastase-elixir", ["full", "pair", "sequence", "silence", "pair", "full"], (i) => `Kérastase Elixir launch, frame ${i + 1}.`),
    featured: true,
  },
  {
    slug: "cairo-streets",
    title: "Cairo Streets",
    subtitle: "Series to come",
    kind: "personal",
    categories: ["street"],
    place: "Cairo, Egypt",
    year: "Ongoing",
    role: "Photographer · Personal work",
    summary: "Placeholder series. Replace with your Cairo street work in the Studio.",
    story: ["This series is a placeholder. Upload your best 8 to 15 street frames in the Studio and write a few lines about them here."],
    cover: pic("cairo-streets", 0, "Cairo street at night."),
    rows: rows("cairo-streets", ["full", "offset", "pair", "sequence"], (i) => `Cairo streets, frame ${i + 1}.`),
    featured: true,
    placeholder: true,
  },
  {
    slug: "structures",
    title: "Structures",
    subtitle: "Series to come",
    kind: "personal",
    categories: ["architecture"],
    place: "Cairo, Egypt",
    year: "Ongoing",
    role: "Photographer · Personal work",
    summary: "Placeholder series. Replace with your architecture work in the Studio.",
    story: ["This series is a placeholder. Upload your best architecture frames in the Studio and write a few lines about them here."],
    cover: pic("structures", 2, "A building facade in hard light."),
    rows: rows("structures", ["pair", "full", "offset", "silence", "pair"], (i) => `Structures, frame ${i + 1}.`),
    featured: true,
    placeholder: true,
  },
  {
    slug: "faces",
    title: "Faces",
    subtitle: "Series to come",
    kind: "personal",
    categories: ["portraits"],
    place: "Cairo, Egypt",
    year: "Ongoing",
    role: "Photographer",
    summary: "Placeholder series. Replace with your portrait work in the Studio.",
    story: ["This series is a placeholder. Upload your best portraits in the Studio and write a few lines about them here."],
    cover: pic("faces", 0, "A portrait in low light."),
    rows: rows("faces", ["pair", "silence", "pair", "sequence"], (i) => `Faces, frame ${i + 1}.`),
    featured: true,
    placeholder: true,
  },
];

const films: Film[] = [
  {
    slug: "showreel",
    title: "Showreel",
    year: "2026",
    roles: ["Director", "Director of Photography", "Editor"],
    duration: "1:30",
    aspect: "2.39:1",
    poster: pic("films", 0, "Showreel poster frame."),
    source: null,
    note: "Placeholder. Your 60 to 90 second showreel goes here.",
    credits: [{ role: "Directed, shot and edited by", name: "Hassan Badawy" }],
    showreel: true,
    placeholder: true,
  },
  {
    slug: "film-one",
    title: "Event Film",
    year: "2025",
    roles: ["Director", "Director of Photography", "Editor"],
    duration: "1:20",
    aspect: "16:9",
    poster: pic("films", 1, "Event film poster frame."),
    source: null,
    note: "Placeholder. Replace with one of your three films.",
    credits: [],
    showreel: false,
    placeholder: true,
  },
  {
    slug: "film-two",
    title: "Short Film",
    year: "2025",
    roles: ["Director of Photography"],
    duration: "1:30",
    aspect: "16:9",
    poster: pic("films", 2, "Short film poster frame."),
    source: null,
    note: "Placeholder. Replace with one of your three films.",
    credits: [],
    showreel: false,
    placeholder: true,
  },
  {
    slug: "film-three",
    title: "Reel",
    year: "2024",
    roles: ["Editor"],
    duration: "0:40",
    aspect: "2.39:1",
    poster: pic("films", 3, "Reel poster frame."),
    source: null,
    note: "Placeholder. Replace with one of your three films.",
    credits: [],
    showreel: false,
    placeholder: true,
  },
];

const settings: Settings = {
  name: "Hassan Badawy",
  title: "Photographer & Director",
  tagline: "I keep what I see.",
  location: "Cairo, Egypt",
  availability: "Based in Cairo. Working worldwide.",
  // DRAFT
  intro:
    "I'm Hassan, a photographer and director based in Cairo. For eight years I've photographed streets, buildings, people and events, for brands like L'Oréal and Elle, and for no one but myself.",
  // DRAFT, from Hassan's own answer
  origin: [
    "I found myself enjoying watching everything. How light moves across a wall, how people stand in a crowd, how a street changes when the sun drops.",
    "So I started keeping the things I saw differently from others. That is still the whole job: I notice, I keep, and I hand it to you.",
  ],
  // DRAFT
  approach: [
    { title: "Before", text: "We talk first. A call to understand what you need and how the work should feel." },
    { title: "On set", text: "I take charge when it helps and step back when it doesn't. People relax around me, and it shows in the frames." },
    { title: "After", text: "A careful edit, delivered as promised. You get the frames worth keeping." },
  ],
  portrait: pic("portrait", 0, "Portrait of Hassan Badawy."),
  hero: pic("hero", 0, "Two guides walking toward the mountains of Saint Catherine."),
  email: "hassanayman98@hotmail.com",
  whatsapp: "201112289036",
  whatsappMessage: "Hi Hassan, I saw your portfolio and I'd love to talk about a project.",
  calLink: undefined,
  clients: ["L'Oréal", "Kérastase", "Elle"],
  socials: [
    { label: "Instagram", url: "https://www.instagram.com/hassanbadawy__", handle: "@hassanbadawy__" },
    { label: "Behance", url: "https://www.behance.net/hassanbadawy__", handle: "hassanbadawy__" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/hassan-badawy-511530154/", handle: "Hassan Badawy" },
  ],
  cvUrl: undefined,
  seoDescription:
    "Hassan Badawy is a photographer and director based in Cairo, Egypt. Street, architecture, portraits and events for brands and people worldwide. Clients include L'Oréal, Kérastase and Elle.",
};

export const seed = { settings, projects, films };
