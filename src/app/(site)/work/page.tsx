import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { WorkIndex } from "@/components/WorkIndex";
import { getArchive } from "@/lib/content";

export const metadata: Metadata = {
  title: "Index",
  description: "Every project by Hassan Badawy: commissioned and personal work in street, architecture, portraits and events.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const { settings, projects, totalFrames } = await getArchive();
  const items = projects.map(({ slug, title, subtitle, year, kind, client, cover, categories }) => ({
    slug, title, subtitle, year, kind, client, cover, categories,
  }));

  return (
    <>
      <section className="wrap" style={{ paddingTop: "clamp(7rem, 16vw, 12rem)", paddingBottom: "8rem", display: "grid", gap: "3rem" }}>
        <header style={{ display: "grid", gap: "1rem" }}>
          <p className="t-data" style={{ color: "var(--color-ash)" }}>
            Index · {projects.length} projects · {totalFrames} frames
          </p>
          <h1 className="t-display t-hero">
            The <i>work</i>
          </h1>
        </header>
        {items.length ? <WorkIndex items={items} /> : <p className="t-body">No projects are published yet.</p>}
      </section>
      <Footer settings={settings} />
    </>
  );
}
