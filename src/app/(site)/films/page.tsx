import type { Metadata } from "next";
import Link from "next/link";
import { FilmPoster } from "@/components/FilmPoster";
import { Footer } from "@/components/Footer";
import { Theatre } from "@/components/Theatre";
import { getArchive } from "@/lib/content";

export const metadata: Metadata = {
  title: "Films",
  description: "Showreel and films by Hassan Badawy: directed, shot and edited.",
  alternates: { canonical: "/films" },
};

export default async function FilmsPage() {
  const { settings, films } = await getArchive();
  const [lead, ...rest] = films;

  return (
    <>
      <section className="wrap" style={{ paddingTop: "clamp(7rem, 16vw, 12rem)", paddingBottom: "8rem", display: "grid", gap: "clamp(3rem, 7vw, 6rem)" }}>
        <header style={{ display: "grid", gap: "1rem" }}>
          <p className="t-data" style={{ color: "var(--color-ash)" }}>
            Screening room · {films.length} {films.length === 1 ? "film" : "films"}
          </p>
          <h1 className="t-display t-hero">
            Moving <i>image</i>
          </h1>
        </header>

        {!lead ? <p className="t-body">No films are published yet.</p> : null}

        {lead ? (
          <div className="reel-lead" data-readout={lead.title}>
            <FilmPoster film={lead} priority />
            <div className="film-meta">
              <h2 className="t-display t-lg">
                <Link href={`/films/${lead.slug}`} className="link">{lead.title}</Link>
              </h2>
              <p className="t-data" style={{ color: "var(--color-ash)" }}>
                {[lead.roles.join(", "), lead.year, lead.duration].filter(Boolean).join(" · ")}
              </p>
            </div>
            {lead.note ? <p className="t-body">{lead.note}</p> : null}
          </div>
        ) : null}

        {rest.length ? (
          <div className="film-grid">
            {rest.map((film) => (
              <div key={film.slug} className="film-card" data-readout={film.title}>
                <FilmPoster film={film} />
                <div className="film-meta">
                  <h2 className="t-display t-md">
                    <Link href={`/films/${film.slug}`} className="link">{film.title}</Link>
                  </h2>
                  <p className="t-data" style={{ color: "var(--color-ash)" }}>
                    {[film.client, film.roles.join(", "), film.year, film.duration].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>
      <Footer settings={settings} />
      <Theatre films={films} />
    </>
  );
}
