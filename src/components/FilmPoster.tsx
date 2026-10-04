"use client";

import { useState } from "react";
import type { Film } from "@/lib/types";
import { Picture } from "./Picture";

const AR: Record<Film["aspect"], string> = { "16:9": "16 / 9", "2.39:1": "2.39 / 1", "9:16": "9 / 16", "4:5": "4 / 5" };

/**
 * A film's poster frame. On desktop, hovering plays a silent few-second loop
 * (Mux films only, loaded on first hover). Clicking opens the theatre.
 */
export function FilmPoster({ film, sizes = "100vw", priority }: { film: Film; sizes?: string; priority?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [ready, setReady] = useState(false);
  const playable = !!film.source;
  const muxId = film.source?.kind === "mux" ? film.source.playbackId : null;
  const start = film.previewStart ?? 0;

  return (
    <button
      type="button"
      className="film-poster"
      data-play-film={playable ? film.slug : undefined}
      data-cursor={playable ? "Play" : undefined}
      disabled={!playable}
      aria-label={playable ? `Play ${film.title}` : `${film.title}, coming soon`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      style={{ aspectRatio: AR[film.aspect] }}
    >
      <Picture picture={film.poster} sizes={sizes} priority={priority} style={{ aspectRatio: AR[film.aspect] }} decorative />
      {muxId && hovered ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={`film-preview${ready ? " ready" : ""}`}
          src={`https://image.mux.com/${muxId}/animated.webp?start=${start}&end=${start + 4}&width=640&fps=15`}
          alt=""
          onLoad={() => setReady(true)}
        />
      ) : null}
      <span className="play-mark t-data" aria-hidden="true">
        {playable ? "▶ Play" : "Coming soon"}
      </span>
    </button>
  );
}
