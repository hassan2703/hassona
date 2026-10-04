import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Underexposed", robots: { index: false } };

export default function NotFound() {
  return (
    <main
      className="wrap"
      style={{ minHeight: "100svh", display: "grid", alignContent: "center", gap: "2rem", background: "var(--color-darkroom)" }}
    >
      <p className="t-data" style={{ color: "var(--color-ash)" }}>404 · Underexposed</p>
      <h1 className="t-display t-hero">
        Nothing <i>developed</i> here.
      </h1>
      <p className="t-body">This frame was never taken, or it has been moved.</p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link href="/" className="btn-line">Back to the screening</Link>
        <Link href="/work" className="btn-line">See the index</Link>
      </div>
    </main>
  );
}
