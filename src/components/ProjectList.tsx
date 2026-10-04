"use client";

import Link from "next/link";
import { useState } from "react";
import { Picture } from "./Picture";
import type { Picture as PictureType } from "@/lib/types";

export type ListItem = {
  slug: string;
  title: string;
  subtitle?: string;
  year: string;
  kind: "commissioned" | "personal";
  client?: string;
  cover: PictureType;
  categories: string[];
};

type Props = {
  items: ListItem[];
  onNavigate?: () => void;
  /** Expose each project's cover behind the list on hover (desktop). */
  preview?: boolean;
};

/** The big typographic list of projects used by the Index page and the menu. */
export function ProjectList({ items, onNavigate, preview = true }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const [touched, setTouched] = useState<string[]>([]);

  const show = (slug: string | null) => {
    setActive(slug);
    if (slug && !touched.includes(slug)) setTouched((t) => [...t, slug]);
  };

  return (
    <>
      <ul className="plist" onPointerLeave={() => show(null)}>
        {items.map((item, i) => (
          <li key={item.slug} style={{ ["--i" as string]: i }}>
            <Link
              href={`/work/${item.slug}`}
              className="plist-row"
              onClick={onNavigate}
              onPointerEnter={() => show(item.slug)}
              onFocus={() => show(item.slug)}
            >
              <span className="plist-no t-data">{String(i + 1).padStart(2, "0")}</span>
              <span className="plist-thumb">
                <Picture picture={item.cover} sizes="96px" decorative />
              </span>
              <span className="plist-title">
                {item.title}
                {item.subtitle ? <em>{item.subtitle}</em> : null}
              </span>
              <span className="plist-meta t-data">
                {item.kind === "commissioned" ? item.client || "Commissioned" : "Personal"} · {item.year}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {preview ? (
        <div className="preview-stage" aria-hidden="true">
          {items
            .filter((item) => touched.includes(item.slug))
            .map((item) => (
              <Picture key={item.slug} picture={item.cover} sizes="100vw" className={active === item.slug ? "on" : ""} decorative />
            ))}
        </div>
      ) : null}
    </>
  );
}
