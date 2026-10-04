import { frameLabel, ratio } from "@/lib/image";
import type { Project, RowLayout } from "@/lib/types";
import { Picture } from "./Picture";

const SIZES: Record<RowLayout, string> = {
  full: "100vw",
  pair: "(max-width: 767px) 100vw, 50vw",
  silence: "(max-width: 767px) 100vw, 450px",
  offset: "(max-width: 767px) 100vw, 60vw",
  sequence: "(max-width: 767px) 33vw, 33vw",
};

/** A project's photographs, composed row by row in the layout chosen for each. */
export function Rows({ project, total }: { project: Project; total: number }) {
  let index = 0;
  return (
    <div className="rows">
      {project.rows.map((row) => (
        <div key={row.key} className={`row row-${row.layout}`}>
          {row.frames.map((frame) => {
            const i = index++;
            const r = ratio(frame.picture);
            const label = frameLabel(frame.no);
            return (
              <figure
                key={frame.key}
                id={`fr-${frame.no}`}
                className="frame"
                data-readout={`${label} / ${String(total).padStart(3, "0")} · ${project.title}`}
                style={row.layout === "full" ? { width: `min(100%, calc(100svh * ${r.toFixed(4)}))`, justifySelf: "center" } : undefined}
              >
                <button type="button" className="frame-open" data-open-frame={i} data-cursor="View" aria-label={`View ${label} full screen`}>
                  <Picture picture={frame.picture} fit="natural" sizes={SIZES[row.layout]} />
                </button>
                <figcaption className="t-data">
                  <span>{label}</span>
                  {frame.caption ? <span className="cap">{frame.caption}</span> : null}
                  {frame.exposure ? (
                    <span>
                      {[frame.exposure.camera, frame.exposure.lens, frame.exposure.shutter, frame.exposure.aperture, frame.exposure.iso && `ISO ${frame.exposure.iso}`, frame.exposure.film]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  ) : null}
                </figcaption>
              </figure>
            );
          })}
        </div>
      ))}
    </div>
  );
}
