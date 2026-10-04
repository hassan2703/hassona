import { getArchive, getFilm } from "@/lib/content";
import { ogCard, ogSize } from "@/lib/og";

export const alt = "Film by Hassan Badawy";
export const size = ogSize;
export const contentType = "image/png";

export async function generateStaticParams() {
  const { films } = await getArchive();
  return films.map((f) => ({ slug: f.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const film = await getFilm(slug);
  return ogCard({
    eyebrow: "Screening room",
    title: film?.title ?? "Films",
    italic: film?.roles.join(", "),
    footer: film ? [film.client, film.year, film.duration].filter(Boolean).join(" · ") : "",
    picture: film?.poster,
  });
}
