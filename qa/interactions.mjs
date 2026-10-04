/**
 * Interaction checks: intro, index menu, lightbox, keyboard, filters,
 * contact sheet and reduced motion.
 *
 *   npm run build && npm start   (in one terminal)
 *   npm run qa:interactions      (in another)
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const failures = [];
const check = (ok, label) => {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failures.push(label);
};

/* Intro plays once, ends by itself, and can be skipped */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + "/");
  check((await page.evaluate(() => document.documentElement.dataset.intro)) === "1", "intro starts on first visit");
  await page.waitForTimeout(3000);
  check((await page.evaluate(() => document.documentElement.dataset.intro)) === undefined, "intro ends on its own");
  await page.reload();
  check((await page.evaluate(() => document.documentElement.dataset.intro)) === undefined, "intro does not replay in the same session");
  await page.close();

  const fresh = await browser.newPage();
  await fresh.goto(BASE + "/");
  await fresh.keyboard.press("Space");
  await fresh.waitForTimeout(100);
  check((await fresh.evaluate(() => document.documentElement.dataset.intro)) === undefined, "any key skips the intro");
  await fresh.close();
}

/* Reduced motion: no intro */
{
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/");
  check((await page.evaluate(() => document.documentElement.dataset.intro)) === undefined, "reduced motion skips the intro");
  await ctx.close();
}

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem("hb-intro", "1"));
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

/* Keyboard: skip link first, index menu opens and closes with focus restored */
await page.goto(BASE + "/");
await page.keyboard.press("Tab");
check((await page.evaluate(() => document.activeElement?.className)) === "skip-link", "first Tab reaches the skip link");
await page.getByRole("button", { name: "Index" }).click();
check(await page.locator("dialog.menu[open]").isVisible(), "Index opens the full-screen menu");
await page.keyboard.press("Escape");
await page.waitForTimeout(200);
check(!(await page.locator("dialog.menu[open]").count()), "Escape closes the menu");

/* Fixed interface stays put while scrolling */
await page.mouse.wheel(0, 2400);
await page.waitForTimeout(600);
const top = await page.evaluate(() => document.querySelector(".mode-switch").getBoundingClientRect().top);
check(top >= 0 && top < 80, "view switch stays fixed while scrolling");

/* Contact sheet */
await page.getByRole("button", { name: "Contact sheet" }).click();
check(page.url().endsWith("#sheet"), "contact sheet updates the URL");
check(await page.locator(".sheet").isVisible(), "contact sheet is visible");
await page.goBack();
await page.waitForTimeout(200);
check(!(await page.locator(".sheet").isVisible()), "back button returns to the screening");

/* Project lightbox */
await page.goto(BASE + "/work/saint-catherine");
await page.locator("[data-open-frame='0']").click();
check(await page.locator("dialog.lightbox[open]").isVisible(), "clicking a frame opens the lightbox");
const first = await page.locator(".lb-bottom").innerText();
await page.keyboard.press("ArrowRight");
const second = await page.locator(".lb-bottom").innerText();
check(first !== second, "arrow key moves to the next frame");
await page.keyboard.press("Escape");
await page.waitForTimeout(200);
check(!(await page.locator("dialog.lightbox[open]").count()), "Escape closes the lightbox");
check((await page.evaluate(() => document.activeElement?.getAttribute("data-open-frame"))) === "0", "focus returns to the frame");

/* Deep link from the contact sheet lands on the frame */
await page.goto(BASE + "/work/saint-catherine#fr-5");
await page.waitForTimeout(400);
const y = await page.evaluate(() => document.getElementById("fr-5").getBoundingClientRect().top);
check(Math.abs(y) < 120, "frame deep link scrolls to the frame");

/* Index filters */
await page.goto(BASE + "/work");
await page.getByRole("button", { name: "Commissioned" }).click();
check((await page.locator("main .plist-row").count()) === 1, "filter narrows the list");

/* Readout follows frames */
await page.goto(BASE + "/work/saint-catherine");
await page.evaluate(() => document.getElementById("fr-6").scrollIntoView({ block: "center" }));
await page.waitForTimeout(500);
check((await page.locator(".vf-readout").innerText()).includes("006"), "readout shows the frame at the centre of the screen");

check(errors.length === 0, `no page errors${errors.length ? ": " + errors.join(" | ") : ""}`);
await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log("\nAll interaction checks passed.");
