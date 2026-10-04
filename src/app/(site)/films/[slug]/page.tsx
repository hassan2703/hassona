import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmPoster } from "@/components/FilmPoster";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Theatre } from "@/components/Theatre";
import { getArchive, getFilm } from "@/lib/content";
import { filmSchema } from "@/lib/structured-data";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { films } = await getArchive();
  return films.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const film = await getFilm(slug);
  if (!film) return {};
  const description = film.note || `${film.title}: ${film.roles.join(", ")}.`;
  return {
    title: film.title,
    description,
    alternates: { canonical: `/films/${film.slug}` },
    openGraph: { type: "video.other", title: film.title, description, url: `/films/${film.slug}` },
  };
}

export default async function FilmPage({ params }: Params) {
  const { slug } = await params;
  const film = await getFilm(slug);
  if (!film) notFound();
  const { settings, films } = await getArchive();
  const others = films.filter((f) => f.slug !== film.slug);
  const schema = filmSchema(film, settings);

  return (
    <>
      <article className="wrap" style={{ paddingTop: "clamp(6rem, 13vw, 10rem)", paddingBottom: "8rem", display: "grid", gap: "clamp(2.5rem, 6vw, 5rem)" }}>
        <header style={{ display: "grid", gap: "1rem" }}>
          <p className="t-data" style={{ color: "var(--color-ash)" }}>
            <Link href="/films" className="link">Screening room</Link> · {film.year}
          </p>
          <h1 className="t-display t-hero">{film.title}</h1>
        </header>
        <FilmPoster film={film} priority />
        <dl className="credits t-data">
          {film.client ? <div><dt>Client</dt><dd>{film.client}</dd></div> : null}
          <div><dt>Role</dt><dd>{film.roles.join(", ")}</dd></div>
          {film.duration ? <div><dt>Length</dt><dd>{film.duration}</dd></div> : null}
          <div><dt>Format</dt><dd>{film.aspect}</dd></div>
          {film.credits.map((c) => (
            <div key={c.role + c.name}><dt>{c.role}</dt><dd>{c.name}</dd></div>
          ))}
        </dl>
        {film.note ? <p className="t-body t-lede">{film.note}</p> : null}
        {others.length ? (
          <nav aria-label="More films" style={{ display: "grid", gap: "1rem" }}>
            <p className="t-data" style={{ color: "var(--color-ash)" }}>More films</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: "0.5rem 2rem" }}>
              {others.map((f) => (
                <li key={f.slug}>
                  <Link href={`/films/${f.slug}`} className="t-display t-md link">{f.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </article>
      <Footer settings={settings} />
      <Theatre films={[film]} />
      {schema ? <JsonLd data={schema} /> : null}
    </>
  );
}
