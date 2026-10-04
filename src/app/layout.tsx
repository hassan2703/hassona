import type { Metadata, Viewport } from "next";
import { getArchive } from "@/lib/content";
import { fontVariables } from "@/lib/fonts";
import { siteUrl } from "@/lib/site";
import "./globals.css";

/* Runs before first paint: marks JS as available (so images can start dark and
   develop) and runs the first-visit exposure on the home page. The intro ends
   by itself after 2.4s, or at the first key, click or tap, even if the rest of
   the JavaScript is still loading. */
const boot = `(function(){var d=document.documentElement;d.classList.add('js');try{if(location.pathname!=='/'||sessionStorage.getItem('hb-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.dataset.intro='1';var t,end=function(){clearTimeout(t);try{sessionStorage.setItem('hb-intro','1')}catch(e){}delete d.dataset.intro;['keydown','pointerdown'].forEach(function(e){removeEventListener(e,end,true)})};t=setTimeout(end,2450);['keydown','pointerdown'].forEach(function(e){addEventListener(e,end,true)})}catch(e){}})();`;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getArchive();
  const title = `${settings.name} · ${settings.title}`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${title} in Cairo`, template: `%s · ${settings.name}` },
    description: settings.seoDescription,
    applicationName: settings.name,
    authors: [{ name: settings.name, url: siteUrl }],
    creator: settings.name,
    keywords: ["photographer Cairo", "Egypt photographer", "director", "street photography", "architecture photography", "portrait photographer", "event photographer", settings.name],
    openGraph: {
      type: "website",
      siteName: settings.name,
      title,
      description: settings.seoDescription,
      locale: "en_US",
      url: "/",
    },
    twitter: { card: "summary_large_image", title, description: settings.seoDescription },
    alternates: { canonical: "/" },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0908",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
