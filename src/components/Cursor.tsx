"use client";

import { useEffect, useRef } from "react";

/**
 * A small ring that appears over photographs and films with a one-word label
 * (View, Play, Open). Only on devices with a precise pointer; the normal
 * cursor is untouched everywhere else.
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = root.current!;
    const text = label.current!;
    document.documentElement.classList.add("has-cursor");
    let x = -100;
    let y = -100;
    let frame = 0;

    const render = () => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = 0;
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(render);
      const target = (event.target as Element | null)?.closest?.("[data-cursor]");
      const word = target?.getAttribute("data-cursor");
      if (word) {
        if (text.textContent !== word) text.textContent = word;
        el.setAttribute("data-label", "");
        el.removeAttribute("data-hidden");
      } else {
        el.removeAttribute("data-label");
        el.setAttribute("data-hidden", "");
      }
    };
    const hide = () => el.setAttribute("data-hidden", "");

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      document.documentElement.classList.remove("has-cursor");
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={root} className="cursor" aria-hidden="true" data-hidden="">
      <span className="cursor-ring" />
      <span ref={label} className="cursor-label t-data" />
    </div>
  );
}
