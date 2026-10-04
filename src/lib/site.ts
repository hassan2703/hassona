/** Absolute base URL of the live site, used for metadata, sitemap and structured data. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");

export const categoryLabels = {
  street: "Street",
  architecture: "Architecture",
  portraits: "Portraits",
  events: "Events",
  journeys: "Journeys",
} as const;

export function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
