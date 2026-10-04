import type { Picture } from "./types";

const WIDTHS = [480, 768, 1080, 1440, 1920, 2560];

/** URL for a given width. Sanity CDN images are resized and served as AVIF/WebP. */
export function sized(picture: Picture, width: number, quality = 80): string {
  if (!picture.cdn) return picture.src;
  const w = Math.min(width, picture.width);
  return `${picture.src}?w=${w}&q=${quality}&auto=format&fit=max`;
}

export function srcSet(picture: Picture): string | undefined {
  if (!picture.cdn) return undefined;
  return WIDTHS.filter((w) => w < picture.width)
    .concat(picture.width)
    .map((w) => `${sized(picture, w)} ${w}w`)
    .join(", ");
}

export function objectPosition(picture: Picture): string {
  const f = picture.focus;
  return f ? `${(f.x * 100).toFixed(1)}% ${(f.y * 100).toFixed(1)}%` : "50% 50%";
}

export function ratio(picture: Picture): number {
  return picture.width / picture.height;
}

export function frameLabel(no: number): string {
  return `Fr. ${String(no).padStart(3, "0")}`;
}
