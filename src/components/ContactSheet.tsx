import Link from "next/link";
import { frameLabel, ratio } from "@/lib/image";
import type { Project } from "@/lib/types";
import { Picture } from "./Picture";

/** Every published frame, numbered, laid out in strips like a developed roll. */
export function ContactSheet({ projects, total }: { projects: Project[]; total: number }) {
  return (
    <section className="sheet wrap" aria-labelledby="sheet-title">
      <header style={{ display: "grid", gap: "0.75rem" }}>
        <p className="t-data" style={{ color: "var(--color-ash)" }}>
          Contact sheet · {total} frames
        </p>
        <h1 id="sheet-title" className="t-display t-lg">
          Everything <i>kept</i>
        </h1>
      </header>
      {projects.map((project) => {
        const frames = project.rows.flatMap((r) => r.frames);
        return (
          <div className="strip" key={project.slug}>
            <div className="strip-head t-data">
              <Link href={`/work/${project.slug}`} className="link">
                {project.title}
              </Link>
              <span>
                {project.place} · {project.year} · {frames.length} frames
              </span>
            </div>
            <div className="strip-frames">
              {frames.map((frame) => (
                <Link
                  key={frame.key}
                  href={`/work/${project.slug}#fr-${frame.no}`}
                  className="sheet-frame"
                  style={{ width: `calc(var(--h) * ${ratio(frame.picture).toFixed(4)})` }}
                  data-cursor="Open"
                  aria-label={`${frameLabel(frame.no)}, ${project.title}${frame.caption ? `: ${frame.caption}` : ""}`}
                >
                  <span className="t-data" aria-hidden="true">{frameLabel(frame.no)}</span>
                  <Picture picture={frame.picture} sizes="(max-width: 768px) 40vw, 260px" decorative />
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
