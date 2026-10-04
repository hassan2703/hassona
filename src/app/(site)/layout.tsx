import { Analytics } from "@vercel/analytics/next";
import { Cursor } from "@/components/Cursor";
import { Darkroom } from "@/components/Darkroom";
import { ReadoutProvider } from "@/components/Readout";
import { Viewfinder } from "@/components/Viewfinder";
import { getArchive } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings, projects, films } = await getArchive();
  const items = projects.map(({ slug, title, subtitle, year, kind, client, cover, categories }) => ({
    slug, title, subtitle, year, kind, client, cover, categories,
  }));

  return (
    <ReadoutProvider>
      <a href="#main" className="skip-link">Skip to content</a>
      <Viewfinder name={settings.name} calLink={settings.calLink} items={items} hasFilms={films.length > 0} />
      <main id="main">{children}</main>
      <Darkroom />
      <Cursor />
      {process.env.VERCEL ? <Analytics /> : null}
    </ReadoutProvider>
  );
}
