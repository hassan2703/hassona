"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useReadout } from "./Readout";

/**
 * One observer for the whole site:
 * - develops each .expose image once it is in view and loaded
 * - updates the viewfinder readout from the [data-readout] element at the centre of the screen
 */
export function Darkroom() {
  const pathname = usePathname();
  const { setReadout } = useReadout();

  useEffect(() => {
    setReadout(null);

    const develop = (el: Element) => {
      const img = el.querySelector("img");
      const done = () => el.classList.add("is-exposed");
      if (!img || (img.complete && img.naturalWidth > 0)) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    };

    const exposer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          exposer.unobserve(entry.target);
          develop(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );

    const reader = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setReadout((visible[visible.length - 1].target as HTMLElement).dataset.readout || null);
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );

    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll(".expose:not(.is-exposed)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        exposer.observe(el);
      });
      document.querySelectorAll("[data-readout]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        reader.observe(el);
      });
    };

    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      exposer.disconnect();
      reader.disconnect();
      mutations.disconnect();
    };
  }, [pathname, setReadout]);

  return null;
}
