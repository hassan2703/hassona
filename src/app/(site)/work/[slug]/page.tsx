import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Lightbox } from "@/components/Lightbox";
import { Picture } from "@/components/Picture";
import { Rows } from "@/components/Rows";
import { getArchive, getProject } from "@/lib/content";
import { frameLabel } from "@/lib/image";
import { categoryLabels } from "@/lib/site";
import { projectSchema } from "@/lib/structured-data";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { projects } = await getArchive();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const found = await getProject(slug);
  if (!found) return {};
  const { project } = found;
  const title = project.subtitle ? `${project.title}, ${project.subtitle}` : project.title;
  return {
    title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { type: "article", title, description: project.summary, url: `/work/${project.slug}` },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const found = await getProject(slug);
  if (!found) notFound();
  const { project, next } = found;
  const { settings, totalFrames } = await getArchive();
  const frames = project.rows.flatMap((r) => r.frames);
  const total = String(totalFrames).padStart(3, "0");

  const credits: [string, string | undefined][] = [
    ["Client", project.client],
    ["Place", project.place],
    ["Year", project.year],
    ["Role", project.role],
    ["Frames", `${frames.length} · ${frameLabel(frames[0]?.no ?? 0)} to ${frameLabel(frames.at(-1)?.no ?? 0)}`],
    ["Filed under", project.categories.map((c) => categoryLabels[c]).join(", ") || undefined],
  ];

  return (
    <article>
      <header className="chapter scrim" data-readout={`${frameLabel(project.coverNo)} / ${total} · ${project.title}`}>
        <Picture picture={project.cover} priority sizes="100vw" />
        <div className="title-card">
          <p className="t-data">{project.kind === "commissioned" ? `Commissioned · ${project.client ?? ""}` : "Personal work"}</p>
          <h1 className="t-display t-hero">{project.title}</h1>
          {project.subtitle ? <p className="sub">{project.subtitle}</p> : null}
        </div>
      </header>

      <section className="wrap" style={{ display: "grid", gap: "clamp(2.5rem, 6vw, 4.5rem)", paddingTop: "clamp(3rem, 8vw, 7rem)" }}>
        {project.placeholder ? (
          <p className="notice t-data">Placeholder series · replace these frames in the Studio</p>
        ) : null}
        <dl className="credits t-data">
          {credits
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
        <div style={{ display: "grid", gap: "2.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))" }}>
          {project.brief ? (
            <div style={{ display: "grid", gap: "0.8rem", alignContent: "start" }}>
              <h2 className="t-data" style={{ color: "var(--color-ash)" }}>The brief</h2>
              <p className="t-body">{project.brief}</p>
            </div>
          ) : null}
          {project.story.length ? (
            <div style={{ display: "grid", gap: "0.8rem", alignContent: "start" }}>
              <h2 className="t-data" style={{ color: "var(--color-ash)" }}>{project.kind === "commissioned" ? "The work" : "The story"}</h2>
              <div className="t-body t-lede">
                {project.story.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {frames.length ? (
        <Rows project={project} total={totalFrames} />
      ) : (
        <p className="wrap t-body" style={{ paddingBlock: "6rem" }}>No frames in this project yet.</p>
      )}

      {next && next.slug !== project.slug ? (
        <section className="next-project scrim" data-cursor="View" aria-labelledby="next-title">
          <Picture picture={next.cover} sizes="100vw" />
          <div className="title-card">
            <p className="t-data">Next exposure</p>
            <h2 id="next-title" className="t-display t-xl">
              <Link href={`/work/${next.slug}`} className="stretch">
                {next.title}
              </Link>
            </h2>
            {next.subtitle ? <p className="sub">{next.subtitle}</p> : null}
          </div>
        </section>
      ) : null}

      <Footer settings={settings} />
      <Lightbox frames={frames} title={project.title} />
      <JsonLd data={projectSchema(project, settings)} />
    </article>
  );
}
