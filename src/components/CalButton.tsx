"use client";

import Link from "next/link";
import { useCallback, useRef, type ReactNode } from "react";

type CalApi = (action: string, options?: Record<string, unknown>) => void;

type Props = { calLink?: string; className?: string; children: ReactNode; "data-cursor"?: string };

/**
 * Opens Cal.com booking in place. The embed script only loads when someone shows
 * intent (hover, focus or click), so it costs nothing on page load. Without a
 * Cal.com link it falls back to the contact page; if the embed fails it opens
 * Cal.com in a new tab.
 */
export function CalButton({ calLink, className, children, ...rest }: Props) {
  const api = useRef<Promise<CalApi | null> | null>(null);

  const warm = useCallback(() => {
    if (!calLink) return Promise.resolve(null);
    api.current ??= import("@calcom/embed-react")
      .then(({ getCalApi }) => getCalApi({ namespace: "book" }))
      .then((cal) => {
        const call = cal as unknown as CalApi;
        call("ui", {
          theme: "dark",
          layout: "month_view",
          cssVarsPerTheme: { dark: { "cal-brand": "#C9A27A" } },
        });
        return call;
      })
      .catch(() => null);
    return api.current;
  }, [calLink]);

  if (!calLink) {
    return (
      <Link href="/contact" className={className} {...rest}>
        {children}
      </Link>
    );
  }

  const href = `https://cal.com/${calLink}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onPointerEnter={warm}
      onFocus={warm}
      onClick={async (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        const cal = await Promise.race([warm(), new Promise<null>((r) => setTimeout(() => r(null), 4000))]);
        if (cal) cal("modal", { calLink, config: { layout: "month_view", theme: "dark" } });
        else window.open(href, "_blank", "noopener,noreferrer");
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
