import { getArchive } from "@/lib/content";
import { ogCard, ogSize } from "@/lib/og";

export const alt = "Hassan Badawy, photographer and director in Cairo";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  const { settings } = await getArchive();
  return ogCard({
    eyebrow: settings.location,
    title: settings.tagline,
    italic: settings.title,
    footer: settings.clients.length ? `Worked with ${settings.clients.join(" · ")}` : settings.availability,
    picture: settings.hero,
  });
}
