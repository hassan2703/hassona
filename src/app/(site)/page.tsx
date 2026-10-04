import Link from "next/link";
import { CalButton } from "@/components/CalButton";
import { ContactSheet } from "@/components/ContactSheet";
import { Footer } from "@/components/Footer";
import { HomeViews } from "@/components/HomeViews";
import { Intro } from "@/components/Intro";
import { JsonLd } from "@/components/JsonLd";
import { Picture } from "@/components/Picture";
import { getArchive } from "@/lib/content";
import { frameLabel } from "@/lib/image";
import { whatsappUrl } from "@/lib/site";
import { personSchema } from "@/lib/structured-data";

export default async function Home() {
  const { settings, projects, films, totalFrames } = await getArchive();
  const chapters = projects.filter((p) => p.featured);
  const reel = films[0];
  const count = (n: number) => `${frameLabel(n)} / ${String(totalFrames).padStart(3, "0")}`;

  const screening = (
    <>
      <section className="opening scrim" data-readout={settings.location}>
        <Picture picture={settings.hero} priority sizes="100vw" />
        <div className="title-card opening-copy">
          <h1 className="t-data">
            {settings.name} · {settings.title}
          </h1>
          <p className="t-display t-hero">{settings.tagline}</p>
          <p className="t-data">{settings.availability}</p>
        </div>
      </section>

      {chapters.length === 0 ? (
        <section className="coda wrap">
          <p className="t-data" style={{ color: "var(--color-ash)" }}>The darkroom is empty</p>
          <p className="t-body">No projects are published yet. Add one in the Studio and it will appear here.</p>
        </section>
      ) : null}

      {chapters.map((project, i) => (
        <section
          key={project.slug}
          className="chapter scrim"
          data-readout={`${count(project.coverNo)} · ${project.title}`}
          data-cursor="View"
          aria-labelledby={`ch-${project.slug}`}
        >
          <Picture picture={project.cover} sizes="100vw" />
          <div className="title-card">
            <p className="t-data">
              Chapter {String(i + 1).padStart(2, "0")} · {project.kind === "commissioned" ? project.client || "Commissioned" : "Personal work"}
            </p>
            <h2 id={`ch-${project.slug}`} className="t-display t-xl">
              <Link href={`/work/${project.slug}`} className="stretch">
                {project.title}
              </Link>
            </h2>
            {project.subtitle ? <p className="sub">{project.subtitle}</p> : null}
            <p className="t-data">
              {[project.place, project.year, project.role].filter(Boolean).join(" · ")}
              <span className="enter" aria-hidden="true">&nbsp;&nbsp;→ Enter</span>
            </p>
          </div>
        </section>
      ))}

      {reel ? (
        <section className="chapter scrim" data-readout="Screening room" data-cursor="Play" aria-labelledby="ch-films">
          <Picture picture={reel.poster} sizes="100vw" />
          <div className="title-card">
            <p className="t-data">Moving image · {films.length} {films.length === 1 ? "film" : "films"}</p>
            <h2 id="ch-films" className="t-display t-xl">
              <Link href="/films" className="stretch">
                Screening <i>room</i>
              </Link>
            </h2>
            <p className="sub">{reel.showreel ? "The showreel, and the films behind it" : "Films, directed, shot and cut"}</p>
          </div>
        </section>
      ) : null}

      <section className="coda wrap" aria-labelledby="begin" data-readout="Begin">
        <p className="t-data" style={{ color: "var(--color-ash)" }}>{settings.availability}</p>
        <h2 id="begin" className="t-display t-xl" style={{ maxWidth: "14ch" }}>
          Let&apos;s make something <i>worth keeping.</i>
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem 2rem", alignItems: "center" }}>
          <CalButton calLink={settings.calLink} className="btn-dusk">Book a call</CalButton>
          {settings.whatsapp ? (
            <a className="t-data link link-under" href={whatsappUrl(settings.whatsapp, settings.whatsappMessage)} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          ) : null}
          <a className="t-data link link-under" href={`mailto:${settings.email}`}>Email</a>
        </div>
      </section>
      <Footer settings={settings} />
    </>
  );

  return (
    <>
      <Intro />
      <HomeViews screening={screening} sheet={<><ContactSheet projects={projects} total={totalFrames} /><Footer settings={settings} /></>} />
      <JsonLd data={personSchema(settings)} />
    </>
  );
}
