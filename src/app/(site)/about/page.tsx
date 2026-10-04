import type { Metadata } from "next";
import Link from "next/link";
import { CalButton } from "@/components/CalButton";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Picture } from "@/components/Picture";
import { getArchive } from "@/lib/content";
import { personSchema } from "@/lib/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getArchive();
  return {
    title: "About",
    description: settings.intro,
    alternates: { canonical: "/about" },
    openGraph: { type: "profile", title: `${settings.name}, ${settings.title}`, description: settings.intro, url: "/about", images: ["/opengraph-image"] },
  };
}

export default async function AboutPage() {
  const { settings } = await getArchive();

  return (
    <>
      <section className="wrap" style={{ paddingTop: "clamp(7rem, 16vw, 12rem)", paddingBottom: "clamp(5rem, 10vw, 9rem)" }}>
        <div className="about-grid">
          <div className="about-portrait" data-readout="The Observer">
            <Picture picture={settings.portrait} fit="natural" priority sizes="(max-width: 900px) 100vw, 40vw" />
          </div>
          <div style={{ display: "grid", gap: "clamp(3rem, 6vw, 5rem)" }}>
            <header style={{ display: "grid", gap: "1.25rem" }}>
              <p className="t-data" style={{ color: "var(--color-ash)" }}>
                {settings.title} · {settings.location}
              </p>
              <h1 className="t-display t-hero">
                The <i>Observer</i>
              </h1>
              <p className="t-lede">{settings.intro}</p>
            </header>

            <div className="t-body t-lede" style={{ color: "var(--color-silver)" }}>
              {settings.origin.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {settings.clients.length ? (
              <div style={{ display: "grid", gap: "1rem" }}>
                <h2 className="t-data" style={{ color: "var(--color-ash)" }}>Worked with</h2>
                <ul className="clients" style={{ margin: 0, padding: 0 }}>
                  {settings.clients.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {settings.approach.length ? (
              <div style={{ display: "grid", gap: "1.25rem" }}>
                <h2 className="t-data" style={{ color: "var(--color-ash)" }}>Working together</h2>
                <div className="steps">
                  {settings.approach.map((step) => (
                    <div key={step.title}>
                      <h3 className="t-display t-md">{step.title}</h3>
                      <p className="t-body" style={{ fontSize: "0.98rem" }}>{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
              <CalButton calLink={settings.calLink} className="btn-dusk">Book a call</CalButton>
              {settings.cvUrl ? (
                <a href={`${settings.cvUrl}?dl=`} className="btn-line" download>
                  Download CV
                </a>
              ) : null}
              <Link href="/work" className="t-data link link-under">See the work</Link>
            </div>

            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: "0.5rem 2rem" }} className="t-data">
              {settings.socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} className="link" target="_blank" rel="noopener noreferrer me">
                    {s.label} {s.handle ? <span style={{ color: "var(--color-ash)" }}>{s.handle}</span> : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <Footer settings={settings} />
      <JsonLd data={personSchema(settings)} />
    </>
  );
}
