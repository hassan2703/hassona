import type { MetadataRoute } from "next";
import { getArchive } from "@/lib/content";
import { sized } from "@/lib/image";
import { siteUrl } from "@/lib/site";

const abs = (p: string) => (p.startsWith("http") ? p : `${siteUrl}${p}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, films } = await getArchive();
  const now = new Date();
  return [
    { url: siteUrl, lastModified: now, priority: 1, images: projects.slice(0, 10).map((p) => abs(sized(p.cover, 1600))) },
    { url: `${siteUrl}/work`, lastModified: now, priority: 0.9 },
    ...projects.map((p) => ({
      url: `${siteUrl}/work/${p.slug}`,
      lastModified: now,
      priority: 0.8,
      images: p.rows.flatMap((r) => r.frames).map((f) => abs(sized(f.picture, 1600))),
    })),
    ...(films.length ? [{ url: `${siteUrl}/films`, lastModified: now, priority: 0.7 }] : []),
    ...films.map((f) => ({ url: `${siteUrl}/films/${f.slug}`, lastModified: now, priority: 0.6 })),
    { url: `${siteUrl}/about`, lastModified: now, priority: 0.7 },
    { url: `${siteUrl}/contact`, lastModified: now, priority: 0.7 },
  ];
}
