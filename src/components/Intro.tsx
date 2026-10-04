"use client";

import { useEffect, useRef, useState } from "react";

const LENGTH = 2.2;

/**
 * The first exposure. Runs once per browser session on the home page, only when
 * motion is allowed (decided before paint by the inline script in the root
 * layout, which sets html[data-intro]). Any click, tap or key skips it.
 */
export function Intro() {
  const [seconds, setSeconds] = useState(0);
  const finish = useRef<() => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.intro !== "1") return;

    let frame = 0;
    const start = performance.now();
    const end = () => {
      cancelAnimationFrame(frame);
      try {
        sessionStorage.setItem("hb-intro", "1");
      } catch {}
      delete html.dataset.intro;
      window.removeEventListener("keydown", end);
    };
    finish.current = end;

    const tick = () => {
      const s = (performance.now() - start) / 1000;
      setSeconds(Math.min(s, LENGTH));
      if (s < LENGTH + 0.25) frame = requestAnimationFrame(tick);
      else end();
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("keydown", end);
    return end;
  }, []);

  return (
    <div className="intro" aria-hidden="true" onClick={() => finish.current()}>
      <span className="t-data">Exposure · {seconds.toFixed(1)}s · f/8 · ISO 100</span>
      <span className="t-data" style={{ opacity: 0.6 }}>Tap to skip</span>
    </div>
  );
}
