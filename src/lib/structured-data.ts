import { sized } from "./image";
import { siteUrl } from "./site";
import type { Film, Project, Settings } from "./types";

const abs = (path: string) => (path.startsWith("http") ? path : `${siteUrl}${path}`);

export function personSchema(settings: Settings) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: settings.name,
    jobTitle: settings.title,
    description: settings.seoDescription,
    url: siteUrl,
    email: `mailto:${settings.email}`,
    image: abs(sized(settings.portrait, 1200)),
    address: { "@type": "PostalAddress", addressLocality: "Cairo", addressCountry: "EG" },
    sameAs: settings.socials.map((s) => s.url),
    knowsAbout: ["Photography", "Street photography", "Architectural photography", "Portrait photography", "Event photography", "Film direction", "Cinematography"],
  };
}

export function projectSchema(project: Project, settings: Settings) {
  const frames = project.rows.flatMap((r) => r.frames);
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: project.title,
    description: project.summary,
    url: `${siteUrl}/work/${project.slug}`,
    dateCreated: /^\d{4}$/.test(project.year) ? project.year : undefined,
    locationCreated: project.place ? { "@type": "Place", name: project.place } : undefined,
    creator: { "@id": `${siteUrl}/#person`, "@type": "Person", name: settings.name },
    image: frames.slice(0, 20).map((f) => ({
      "@type": "ImageObject",
      contentUrl: abs(sized(f.picture, 1920)),
      caption: f.caption || f.picture.alt,
      creator: { "@type": "Person", name: settings.name },
      copyrightNotice: `© ${settings.name}`,
    })),
  };
}

export function filmSchema(film: Film, settings: Settings) {
  if (!film.source) return null;
  const [m, s] = (film.duration || "0:0").split(":").map(Number);
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: film.title,
    description: film.note || `${film.title}, ${film.roles.join(", ")} by ${settings.name}.`,
    thumbnailUrl: [abs(sized(film.poster, 1280))],
    uploadDate: /^\d{4}$/.test(film.year) ? `${film.year}-01-01` : undefined,
    duration: film.duration ? `PT${m || 0}M${s || 0}S` : undefined,
    contentUrl: film.source.kind === "file" ? film.source.url : `https://stream.mux.com/${film.source.playbackId}.m3u8`,
    creator: { "@id": `${siteUrl}/#person`, "@type": "Person", name: settings.name },
  };
}
