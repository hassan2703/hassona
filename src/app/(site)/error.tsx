"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="wrap" style={{ minHeight: "100svh", display: "grid", alignContent: "center", gap: "2rem" }}>
      <p className="t-data" style={{ color: "var(--color-ash)" }}>Error · the frame didn&apos;t develop</p>
      <h1 className="t-display t-xl">Light leak.</h1>
      <p className="t-body">Something went wrong loading this page. Try again, or head back to the work.</p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <button type="button" className="btn-line" onClick={reset}>Try again</button>
        <Link href="/" className="btn-line">Back to the screening</Link>
      </div>
    </section>
  );
}
