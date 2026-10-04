"use client";

import { useMemo, useState } from "react";
import { categoryLabels } from "@/lib/site";
import { ProjectList, type ListItem } from "./ProjectList";

type Filter = { id: string; label: string; test: (item: ListItem) => boolean };

/** The Index page: every project, filterable by kind of work and category. */
export function WorkIndex({ items }: { items: ListItem[] }) {
  const filters = useMemo<Filter[]>(() => {
    const list: Filter[] = [{ id: "all", label: "All", test: () => true }];
    if (items.some((i) => i.kind === "commissioned")) list.push({ id: "commissioned", label: "Commissioned", test: (i) => i.kind === "commissioned" });
    if (items.some((i) => i.kind === "personal")) list.push({ id: "personal", label: "Personal", test: (i) => i.kind === "personal" });
    for (const [id, label] of Object.entries(categoryLabels)) {
      if (items.some((i) => i.categories.includes(id))) list.push({ id, label, test: (i) => i.categories.includes(id) });
    }
    return list;
  }, [items]);

  const [active, setActive] = useState("all");
  const filter = filters.find((f) => f.id === active) ?? filters[0];
  const shown = items.filter(filter.test);

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      {filters.length > 2 ? (
        <div className="filters" role="group" aria-label="Filter projects">
          {filters.map((f) => (
            <button key={f.id} type="button" className="btn-line" aria-pressed={f.id === active} onClick={() => setActive(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite">
        Showing {shown.length} {shown.length === 1 ? "project" : "projects"}
      </p>
      {shown.length ? <ProjectList key={active} items={shown} /> : <p className="t-body">Nothing filed here yet.</p>}
    </div>
  );
}
