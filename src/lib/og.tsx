import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { Picture } from "./types";
import { sized } from "./image";

export const ogSize = { width: 1200, height: 630 };

const font = (file: string) => readFile(join(process.cwd(), "src/fonts/og", file));

/** The social preview card: a frame, a title in the display face, camera data in mono. */
export async function ogCard({ eyebrow, title, italic, footer, picture }: { eyebrow: string; title: string; italic?: string; footer: string; picture?: Picture }) {
  const [serif, serifItalic, mono] = await Promise.all([
    font("bodoni-moda-latin-400-normal.woff"),
    font("bodoni-moda-latin-400-italic.woff"),
    font("GeistMono-Regular.ttf"),
  ]);
  // Only real photographs from the CDN are used as backgrounds; placeholders are SVG and stay out.
  const bg = picture?.cdn ? `${sized(picture, 1200, 75)}&fm=jpg&h=630&fit=crop` : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0a0908", color: "#ece6dd" }}>
        {bg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bg} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover", opacity: 0.55 }} />
        ) : (
          <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex", background: "linear-gradient(180deg, #0a0908 0%, #2b2620 55%, #6d5743 78%, #14110e 100%)", opacity: 0.6 }} />
        )}
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Mono", fontSize: 20, letterSpacing: 3, textTransform: "uppercase", color: "#cfc8be" }}>
            <span>{eyebrow}</span>
            <span>Hassan Badawy</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontFamily: "Bodoni", fontSize: 104, lineHeight: 1, letterSpacing: -2 }}>{title}</div>
            {italic ? <div style={{ fontFamily: "Bodoni", fontStyle: "italic", fontSize: 48, color: "#c9a27a" }}>{italic}</div> : null}
            <div style={{ marginTop: 28, fontFamily: "Mono", fontSize: 20, letterSpacing: 3, textTransform: "uppercase", color: "#8c857c" }}>{footer}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Bodoni", data: serif, style: "normal", weight: 400 },
        { name: "Bodoni", data: serifItalic, style: "italic", weight: 400 },
        { name: "Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
