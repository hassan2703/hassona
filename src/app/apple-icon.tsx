import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0a0908" }}>
        <div style={{ position: "absolute", left: 64, top: 52, width: 52, height: 52, borderRadius: 26, background: "#c9a27a" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: "#2a2622" }} />
      </div>
    ),
    size,
  );
}
