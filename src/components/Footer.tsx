import Link from "next/link";
import type { Settings } from "@/lib/types";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="site-foot t-data">
      <span>
        © {new Date().getFullYear()} {settings.name} · {settings.location}
      </span>
      <nav aria-label="Elsewhere">
        {settings.socials.map((s) => (
          <a key={s.url} href={s.url} className="link" target="_blank" rel="noopener noreferrer me">
            {s.label}
          </a>
        ))}
        <Link href="/contact" className="link">
          Contact
        </Link>
      </nav>
    </footer>
  );
}
