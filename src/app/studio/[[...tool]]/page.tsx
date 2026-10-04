import { sanityConfigured } from "@/sanity/env";
import { Studio } from "./Studio";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!sanityConfigured) return <StudioSetup />;
  return <Studio />;
}

/** Shown at /studio until a Sanity project is connected. */
function StudioSetup() {
  return (
    <main className="wrap" style={{ minHeight: "100svh", display: "grid", alignContent: "center", gap: "1.5rem", maxWidth: "46rem" }}>
      <p className="t-data" style={{ color: "var(--color-ash)" }}>Studio · not connected yet</p>
      <h1 className="t-display t-lg">The admin panel is ready. It needs a Sanity project.</h1>
      <ol className="t-body" style={{ display: "grid", gap: "0.6rem", paddingLeft: "1.2rem" }}>
        <li>Create a free project at sanity.io/manage and copy its Project ID.</li>
        <li>Add NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET in Vercel, then redeploy.</li>
        <li>In the Sanity project, add this site&apos;s address under API &gt; CORS origins, with credentials allowed.</li>
      </ol>
      <p className="t-body">The full walkthrough is in the README, under &ldquo;Connecting the admin panel&rdquo;.</p>
    </main>
  );
}
