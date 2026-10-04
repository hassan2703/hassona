"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { frameLabel, sized, srcSet } from "@/lib/image";
import type { Frame } from "@/lib/types";

/**
 * Full-screen viewer for a project's frames. Opens from any [data-open-frame]
 * button on the page. Arrow keys and swipe move between frames; Escape closes
 * and returns focus to the frame you came from.
 */
export function Lightbox({ frames, title }: { frames: Frame[]; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const swipe = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const go = useCallback((step: number) => setIndex((i) => (i + step + frames.length) % frames.length), [frames.length]);
  const close = useCallback(() => dialog.current?.close(), []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const button = (event.target as Element).closest<HTMLElement>("[data-open-frame]");
      if (!button) return;
      opener.current = button;
      setIndex(Number(button.dataset.openFrame) || 0);
      setOpen(true);
      dialog.current?.showModal();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const frame = frames[index];
  if (!frame) return null;

  return (
    <dialog
      ref={dialog}
      className="lightbox"
      aria-label={`${title}, full screen viewer`}
      onClose={() => {
        setOpen(false);
        opener.current?.focus();
      }}
    >
      {open ? (
        <>
          <div className="lb-bar lb-top t-data">
            <span>{title}</span>
            <button type="button" className="lb-btn t-data" onClick={close} autoFocus>
              Close
            </button>
          </div>
          <div
            className="lb-stage"
            onPointerDown={(e) => (swipe.current = e.clientX)}
            onPointerUp={(e) => {
              if (swipe.current === null) return;
              const dx = e.clientX - swipe.current;
              swipe.current = null;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={frame.key}
              src={sized(frame.picture, 2560, 85)}
              srcSet={srcSet(frame.picture)}
              sizes="100vw"
              width={frame.picture.width}
              height={frame.picture.height}
              alt={frame.picture.alt}
              draggable={false}
            />
          </div>
          {frames.length > 1 ? (
            <>
              <button type="button" className="lb-nav lb-prev" onClick={() => go(-1)} aria-label="Previous frame" />
              <button type="button" className="lb-nav lb-next" onClick={() => go(1)} aria-label="Next frame" />
            </>
          ) : null}
          <div className="lb-bar lb-bottom t-data" aria-live="polite">
            <span>
              {frameLabel(frame.no)} · {index + 1} / {frames.length}
            </span>
            <span style={{ color: "var(--color-silver)", textAlign: "right" }}>{frame.caption}</span>
          </div>
        </>
      ) : null}
    </dialog>
  );
}
