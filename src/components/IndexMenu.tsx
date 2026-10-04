"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ProjectList, type ListItem } from "./ProjectList";

type Props = { open: boolean; onClose: () => void; items: ListItem[]; hasFilms: boolean };

/** Full-screen index of every project, plus the other rooms of the site. */
export function IndexMenu({ open, onClose, items, hasFilms }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog ref={dialog} className="menu" aria-label="Index" onClose={onClose}>
      <button type="button" className="menu-close t-data link" onClick={onClose}>
        Close
      </button>
      <div className="menu-inner">
        <p className="t-data" style={{ color: "var(--color-ash)" }}>
          Index · {items.length} {items.length === 1 ? "project" : "projects"}
        </p>
        <ProjectList items={items} onNavigate={onClose} />
        <nav className="menu-pages" aria-label="Pages">
          <Link href="/work" className="link" onClick={onClose}>All work</Link>
          {hasFilms ? <Link href="/films" className="link" onClick={onClose}>Films</Link> : null}
          <Link href="/about" className="link" onClick={onClose}>About</Link>
          <Link href="/contact" className="link" onClick={onClose}>Contact</Link>
        </nav>
      </div>
    </dialog>
  );
}
