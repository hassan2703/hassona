/**
 * Smoke test: loads every page at desktop and phone sizes, fails on console
 * errors, broken links or missing metadata, and saves screenshots.
 *
 *   npm run build && npm start   (in one terminal)
 *   npm run qa                   (in another; BASE_URL defaults to http://localhost:3000)
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = new URL("./screenshots/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const routes = ["/", "/#sheet", "/work", "/work/saint-catherine", "/work/kerastase-elixir", "/films", "/films/showreel", "/about", "/contact", "/this-does-not-exist"];
const viewports = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

const problems = [];
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

for (const [name, viewport] of Object.entries(viewports)) {
  const context = await browser.newContext({ viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch, deviceScaleFactor: viewport.deviceScaleFactor });
  // skip the first-visit intro so screenshots show the page itself
  await context.addInitScript(() => sessionStorage.setItem("hb-intro", "1"));
  const page = await context.newPage();
  let current = "";
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    if (current === "/this-does-not-exist" && msg.text().includes("404")) return; // expected
    problems.push(`[${name}] ${current} console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => problems.push(`[${name}] page error: ${err.message}`));

  for (const route of routes) {
    current = route;
    const res = await page.goto(BASE + route, { waitUntil: "networkidle" });
    const expected = route === "/this-does-not-exist" ? 404 : 200;
    if (res && res.status() !== expected) problems.push(`[${name}] ${route} returned ${res?.status()}`);
    await page.waitForTimeout(1200);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) problems.push(`[${name}] ${route} scrolls sideways by ${overflow}px`);

    if (expected === 200) {
      const meta = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
        og: document.querySelector('meta[property="og:image"]')?.getAttribute("content"),
        h1: document.querySelectorAll("h1").length,
        missingAlt: [...document.querySelectorAll("img:not([alt])")].length,
      }));
      if (!meta.title) problems.push(`[${name}] ${route} has no title`);
      if (!meta.description) problems.push(`[${name}] ${route} has no description`);
      if (!meta.og) problems.push(`[${name}] ${route} has no og:image`);
      if (meta.h1 < 1) problems.push(`[${name}] ${route} has no h1`);
      if (meta.missingAlt) problems.push(`[${name}] ${route} has ${meta.missingAlt} images without alt`);
    }

    const file = `${name}-${route.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home"}.png`;
    await page.screenshot({ path: OUT + file });
  }

  // internal links all resolve
  const links = new Set();
  for (const route of ["/", "/work", "/films", "/about", "/contact"]) {
    await page.goto(BASE + route);
    for (const href of await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")))) links.add(href.split("#")[0]);
  }
  for (const href of links) {
    const res = await page.request.get(BASE + href);
    if (res.status() >= 400) problems.push(`[${name}] broken link ${href} (${res.status()})`);
  }
  await context.close();
}

await browser.close();

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n` + problems.map((p) => "  · " + p).join("\n"));
  process.exit(1);
}
console.log(`All clear. Screenshots in ${OUT}`);
