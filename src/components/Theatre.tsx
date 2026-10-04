"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Film } from "@/lib/types";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

const AR: Record<Film["aspect"], number> = { "16:9": 16 / 9, "2.39:1": 2.39, "9:16": 9 / 16, "4:5": 4 / 5 };

/**
 * The lights go down: a film plays alone on black. Opens from any
 * [data-play-film] element on the page. Sound plays because the viewer asked
 * for it by pressing play; closing stops and unloads the player.
 */
export function Theatre({ films }: { films: Film[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [film, setFilm] = useState<Film | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const el = (event.target as Element).closest<HTMLElement>("[data-play-film]");
      const found = el && films.find((f) => f.slug === el.dataset.playFilm);
      if (!found?.source) return;
      opener.current = el;
      setFilm(found);
      dialog.current?.showModal();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [films]);

  return (
    <dialog
      ref={dialog}
      className="theatre"
      aria-label={film ? `${film.title}, playing` : "Film player"}
      onClose={() => {
        setFilm(null);
        opener.current?.focus();
      }}
    >
      {film?.source ? (
        <>
          <div className="lb-bar lb-top t-data">
            <span>
              {film.title} · {film.roles.join(", ")}
            </span>
            <button type="button" className="lb-btn t-data" onClick={() => dialog.current?.close()} autoFocus>
              Close
            </button>
          </div>
          <div className="theatre-stage">
            <div className="theatre-screen" style={{ ["--ar" as string]: AR[film.aspect] }}>
              {film.source.kind === "mux" ? (
                <MuxPlayer
                  playbackId={film.source.playbackId}
                  streamType="on-demand"
                  autoPlay
                  accentColor="#C9A27A"
                  primaryColor="#ECE6DD"
                  metadata={{ video_title: film.title }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <video src={film.source.url} controls autoPlay playsInline preload="auto" />
              )}
            </div>
          </div>
        </>
      ) : null}
    </dialog>
  );
}
