export default function Loading() {
  return (
    <div style={{ minHeight: "100svh", display: "grid", placeItems: "center" }} role="status">
      <span className="t-data" style={{ color: "var(--color-ash)" }}>Developing…</span>
    </div>
  );
}
