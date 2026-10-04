"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalButton } from "./CalButton";
import { IndexMenu } from "./IndexMenu";
import type { ListItem } from "./ProjectList";
import { useReadout } from "./Readout";

const ROOMS: [string, string][] = [
  ["/work/", "Project"],
  ["/work", "Index"],
  ["/films", "Screening room"],
  ["/about", "The Observer"],
  ["/contact", "Begin"],
];

type Props = { name: string; calLink?: string; items: ListItem[]; hasFilms: boolean };

/** The interface lives in the four corners, like the readout in a camera. */
export function Viewfinder({ name, calLink, items, hasFilms }: Props) {
  const pathname = usePathname();
  const { readout } = useReadout();
  const [menu, setMenu] = useState(false);

  // close the index whenever the page changes
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenu(false);
  }

  // dim the corners while scrolling, bring them back on any pointer movement
  useEffect(() => {
    const html = document.documentElement;
    let timer = 0;
    const onScroll = () => {
      html.dataset.dim = "1";
      window.clearTimeout(timer);
      timer = window.setTimeout(() => delete html.dataset.dim, 1200);
    };
    const wake = () => delete html.dataset.dim;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", wake, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", wake);
      window.clearTimeout(timer);
      delete html.dataset.dim;
    };
  }, []);

  const room = pathname === "/" ? "Screening" : ROOMS.find(([p]) => pathname.startsWith(p))?.[1] ?? "";

  return (
    <>
      <div className="vf">
        <div className="vf-marks" aria-hidden="true">
          <i /><i /><i /><i />
        </div>
        <div className="vf-corner vf-tl">
          <Link href="/" className="vf-name" aria-label={`${name}, home`}>
            {name}
          </Link>
        </div>
        <div className="vf-corner vf-tr">
          <button type="button" className="vf-btn t-data link" aria-haspopup="dialog" aria-expanded={menu} onClick={() => setMenu(true)}>
            Index
          </button>
        </div>
        <div className="vf-corner vf-bl">
          <span className="vf-readout t-data" aria-live="off">
            {readout ?? room}
          </span>
        </div>
        <div className="vf-corner vf-br">
          <CalButton calLink={calLink} className="vf-book t-data">
            Book a call
          </CalButton>
        </div>
      </div>
      <IndexMenu open={menu} onClose={() => setMenu(false)} items={items} hasFilms={hasFilms} />
    </>
  );
}
