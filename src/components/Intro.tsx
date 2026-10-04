"use client";

import { useEffect, useState } from "react";

const LENGTH = 2.2;

/**
 * The exposure counter shown during the first-visit intro. The intro itself
 * (start, skip, end) is run by the inline script in the root layout so it
 * works before the page has hydrated; this only animates the readout.
 */
export function Intro() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (document.documentElement.dataset.intro !== "1") return;
    let frame = 0;
    const start = performance.now();
    const tick = () => {
      const s = (performance.now() - start) / 1000;
      setSeconds(Math.min(s, LENGTH));
      if (s < LENGTH && document.documentElement.dataset.intro === "1") frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="intro" aria-hidden="true">
      <span className="t-data">Exposure · {seconds.toFixed(1)}s · f/8 · ISO 100</span>
      <span className="t-data" style={{ opacity: 0.6 }}>Tap to skip</span>
    </div>
  );
}
