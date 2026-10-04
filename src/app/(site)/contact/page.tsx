import type { Metadata } from "next";
import { CairoClock } from "@/components/CairoClock";
import { CalButton } from "@/components/CalButton";
import { CopyButton } from "@/components/CopyButton";
import { Footer } from "@/components/Footer";
import { getArchive } from "@/lib/content";
import { whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Book a call, message on WhatsApp or email Hassan Badawy, photographer and director in Cairo.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { settings } = await getArchive();

  return (
    <>
      <section className="wrap" style={{ paddingTop: "clamp(7rem, 16vw, 12rem)", paddingBottom: "clamp(5rem, 10vw, 8rem)", display: "grid", gap: "clamp(3rem, 7vw, 5rem)" }}>
        <header style={{ display: "grid", gap: "1.25rem" }}>
          <p className="t-data" style={{ color: "var(--color-ash)" }}>
            Begin · <CairoClock />
          </p>
          <h1 className="t-display t-hero">
            Tell me what you <i>want to keep.</i>
          </h1>
          <p className="t-lede">
            A launch, a portrait, a city, a film. Whatever you&apos;re planning, it starts with a conversation. Pick whichever way feels easiest.
          </p>
        </header>

        <div className="doors">
          <div className="door">
            <div style={{ display: "grid", gap: "0.6rem" }}>
              <p className="t-data" style={{ color: "var(--color-ash)" }}>01 · Talk it through</p>
              <h2 className="t-display t-md">Book a call</h2>
              <p className="t-body" style={{ fontSize: "0.98rem" }}>
                {settings.calLink ? "Pick a time that suits you. Video or phone, about twenty minutes." : "Online booking is coming soon. Email or WhatsApp and we'll find a time."}
              </p>
            </div>
            {settings.calLink ? (
              <CalButton calLink={settings.calLink} className="btn-dusk">Choose a time</CalButton>
            ) : (
              <a className="btn-dusk" href={`mailto:${settings.email}?subject=${encodeURIComponent("Booking a call")}`}>Ask for a call</a>
            )}
          </div>

          {settings.whatsapp ? (
            <div className="door door-whatsapp">
              <div style={{ display: "grid", gap: "0.6rem" }}>
                <p className="t-data" style={{ color: "var(--color-ash)" }}>02 · Quick question</p>
                <h2 className="t-display t-md">WhatsApp</h2>
                <p className="t-body" style={{ fontSize: "0.98rem" }}>The fastest way to reach me. A first line is written for you.</p>
              </div>
              <a className="btn-line" href={whatsappUrl(settings.whatsapp, settings.whatsappMessage)} target="_blank" rel="noopener noreferrer">
                Open chat
              </a>
            </div>
          ) : null}

          <div className="door">
            <div style={{ display: "grid", gap: "0.6rem" }}>
              <p className="t-data" style={{ color: "var(--color-ash)" }}>03 · Send the details</p>
              <h2 className="t-display t-md">Email</h2>
              <p className="t-data addr">{settings.email}</p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a className="btn-line" href={`mailto:${settings.email}`}>Write</a>
              <CopyButton text={settings.email} label="Copy address" />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "1rem 2rem" }} className="t-data">
          <span style={{ color: "var(--color-ash)" }}>{settings.availability}</span>
          <span style={{ display: "flex", gap: "0.5rem 1.5rem", flexWrap: "wrap" }}>
            {settings.socials.map((s) => (
              <a key={s.url} href={s.url} className="link" target="_blank" rel="noopener noreferrer me">
                {s.label}
              </a>
            ))}
          </span>
        </div>
      </section>
      <Footer settings={settings} />
    </>
  );
}
