import type { CSSProperties } from "react";
import { objectPosition, ratio, sized, srcSet } from "@/lib/image";
import type { Picture as PictureType } from "@/lib/types";

type Props = {
  picture: PictureType;
  /** The `sizes` attribute: how wide the image renders at each breakpoint. */
  sizes?: string;
  /** Load immediately with high priority. Only for the first image on a page. */
  priority?: boolean;
  /** cover fills the box, contain fits inside it, natural keeps the original ratio. */
  fit?: "cover" | "contain" | "natural";
  className?: string;
  style?: CSSProperties;
  /** Show the alt text to assistive tech. False when the image is decorative here. */
  decorative?: boolean;
};

/**
 * Every photograph on the site goes through this component. It develops into
 * view (see .expose in globals.css) and never crops unless asked to cover.
 */
export function Picture({ picture, sizes = "100vw", priority, fit = "cover", className = "", style, decorative }: Props) {
  const landscape = ratio(picture) > 1.05;
  const classes = [
    "expose",
    fit === "contain" && "fit-contain",
    fit === "natural" && "fit-natural",
    landscape && "is-landscape",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      style={{
        ...(fit === "natural" ? { aspectRatio: `${picture.width} / ${picture.height}` } : null),
        ...(picture.lqip ? { backgroundImage: `url(${picture.lqip})` } : null),
        ...style,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Sanity's CDN does the resizing; next/image would resize twice */}
      <img
        src={sized(picture, 1920)}
        srcSet={srcSet(picture)}
        sizes={sizes}
        width={picture.width}
        height={picture.height}
        alt={decorative ? "" : picture.alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        style={{ objectPosition: objectPosition(picture) }}
      />
    </div>
  );
}
