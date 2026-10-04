"use client";

import { useEffect, useState, type ReactNode } from "react";

type View = "screening" | "sheet";

/** Switches the home page between the cinematic screening and the contact sheet. */
export function HomeViews({ screening, sheet }: { screening: ReactNode; sheet: ReactNode }) {
  const [view, setView] = useState<View>("screening");

  // follow the URL hash so the contact sheet can be linked to and the back button works
  useEffect(() => {
    const sync = () => setView(window.location.hash === "#sheet" ? "sheet" : "screening");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // gentle chapter snapping, only while the screening is showing
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("snap", view === "screening");
    return () => html.classList.remove("snap");
  }, [view]);

  const choose = (next: View) => {
    if (next === view) return;
    history.pushState(null, "", next === "sheet" ? "#sheet" : window.location.pathname);
    setView(next);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <div className="mode-switch t-data" role="group" aria-label="View">
        <button type="button" aria-pressed={view === "screening"} onClick={() => choose("screening")}>
          Screening
        </button>
        <button type="button" aria-pressed={view === "sheet"} onClick={() => choose("sheet")}>
          Contact sheet
        </button>
      </div>
      <div hidden={view !== "screening"}>{screening}</div>
      <div hidden={view !== "sheet"}>{sheet}</div>
    </>
  );
}
