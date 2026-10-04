# Long Exposure

The portfolio of **Hassan Badawy**, photographer and director based in Cairo.

> A photograph is a piece of time someone chose to keep. This site is where Hassan keeps the moments he saw differently, and hands them to you.

The site behaves like a long exposure. Every page starts in near-black and photographs *develop* into view. The interface sits in the four corners of the screen like a camera viewfinder, so it never covers the work. The home page is a **screening**: one project per screen, like scenes in a film. One switch turns it into a **contact sheet** of every numbered frame. Films play in a **theatre** that dims everything else to black.

---

## Contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Running it locally](#running-it-locally)
- [Deployment](#deployment)
- [Connecting the admin panel](#connecting-the-admin-panel)
- [Updating content](#updating-content)
- [Environment variables](#environment-variables)
- [Quality checks](#quality-checks)
- [Credits and licence](#credits-and-licence)

---

## Tech stack

| Piece | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript | Pages are pre-rendered, so they load almost instantly; metadata and social images are built in. |
| Admin panel | Sanity Studio, embedded at `/studio` | A visual editor for photos, projects, films and bio. Free plan is enough. |
| Images | Sanity image CDN | Upload full resolution once; visitors get correctly sized AVIF or WebP. Focal points set in the Studio. |
| Video | Mux (via `sanity-plugin-mux-input`) | Adaptive 4K streaming, automatic posters and the silent hover previews. A plain MP4 upload also works. |
| Styling | Tailwind CSS 4 with design tokens in `src/app/globals.css` | One source of truth for colour, type, spacing and timing. |
| Motion | CSS only | Exposures, page changes and the intro need no animation library, so no extra JavaScript. |
| Booking | Cal.com embed, loaded on demand | Opens in place; the script only loads when someone hovers or taps "Book a call". |
| Analytics | Vercel Web Analytics | No cookies, so no cookie banner. Only loads on Vercel. |
| Fonts | Bodoni Moda (display), Geist (text), Geist Mono (data) | Self-hosted, no requests to Google. |

## Project structure

```
src/
  app/
    (site)/            the public site: home, work, films, about, contact
    studio/            the admin panel at /studio
    api/revalidate/    webhook Sanity calls when you publish
    globals.css        the whole design system (tokens, type, motion)
    layout.tsx         root layout, metadata, pre-paint intro script
    opengraph-image.tsx, sitemap.ts, robots.ts, manifest.ts, icon.svg
  components/          Viewfinder, IndexMenu, Picture, Rows, Lightbox, Theatre, ...
  content/
    seed.ts            built-in content used until Sanity is connected
    placeholders.json  sizes of the generated placeholder images
  lib/
    content.ts         loads content from Sanity, falls back to seed.ts
    types.ts           the shapes every page works with
  sanity/              Sanity client, environment and GROQ query
sanity/schemas/        the admin panel's content model
sanity.config.ts       Studio configuration
public/placeholders/   generated, clearly labelled stand-in artwork
scripts/               placeholder generator
qa/                    Playwright smoke and interaction tests
docs/                  content guide, showreel brief, content checklist
```

**How content flows:** every page asks `getArchive()` in `src/lib/content.ts` for content. If Sanity is configured it reads from Sanity; otherwise it uses `src/content/seed.ts`. If Sanity is connected but *Site settings* has not been filled in yet, the seed bio and contact details are used so the site never shows blanks.

## Running it locally

Requirements: Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # optional: add your Sanity project ID
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run build          # production build
npm start              # serve the production build
npm run lint           # ESLint
npm run typecheck      # TypeScript
npm run placeholders   # regenerate the placeholder artwork
npm run qa             # smoke test (needs the site running, see below)
```

## Deployment

The site is built for **Vercel**.

1. In Vercel, choose **Add New > Project** and import the GitHub repository `hassan2703/hassona`.
2. Framework preset: **Next.js**. Leave build settings as they are.
3. Add the [environment variables](#environment-variables) (all optional for the first deploy).
4. Deploy. Every push to the main branch redeploys automatically; other branches get preview URLs.

**Custom domain:** in the Vercel project, open **Settings > Domains**, add the domain and follow the DNS instructions (if the domain is bought through Vercel this is automatic). Then set `NEXT_PUBLIC_SITE_URL` to the domain and redeploy so search engines and social cards use it.

**Hobby plan note:** Vercel's free Hobby plan is intended for non-commercial use. Personal portfolios commonly run on it, but if Vercel asks, move to Pro.

## Connecting the admin panel

Until this is done, `/studio` shows a short setup page and the site runs on the built-in content.

1. **Create the Sanity project.** Go to [sanity.io/manage](https://www.sanity.io/manage), sign in with Google or GitHub, and create a project (for example "Hassan Badawy"). Use the dataset name `production` with **public** visibility. Copy the **Project ID**.
2. **Add environment variables in Vercel** (Settings > Environment Variables):
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` = your Project ID
   - `NEXT_PUBLIC_SANITY_DATASET` = `production`
   - `SANITY_REVALIDATE_SECRET` = any long random string (keep it private)
   - `NEXT_PUBLIC_SITE_URL` = your live address, for example `https://hassanbadawy.vercel.app`

   Then redeploy.
3. **Allow the site to talk to Sanity.** In sanity.io/manage > your project > **API > CORS origins**, add your live address and `http://localhost:3000`, both with **Allow credentials** ticked.
4. **Open `https://your-site/studio`** and sign in with the same account.
5. **Instant updates.** In sanity.io/manage > **API > Webhooks**, create a webhook:
   - URL: `https://your-site/api/revalidate`
   - Dataset: `production`, trigger on create, update and delete
   - Filter: `_type in ["settings", "project", "film"]`
   - HTTP method: POST, and paste the same `SANITY_REVALIDATE_SECRET` into **Secret**

   Without the webhook, changes still appear within an hour.
6. **Video (Mux).** Create an account at [mux.com](https://www.mux.com). Under **Settings > Access Tokens**, create a token with **Mux Video: Read and Write**. The first time you open a Film in the Studio, the video field asks for the token ID and secret. They are stored privately in your Sanity project, not in this repository.

## Updating content

Everything below happens in the Studio at `/studio`. Press **Publish** when done; with the webhook in place the live site updates within seconds.

### Replace or add photos in a project

Open **Projects**, choose a project and go to the **Frames** tab. Each **row** has a layout:

| Layout | Frames | Use it for |
| --- | --- | --- |
| Full bleed | 1 | Openers and frames that need to hit hard |
| Pair | 2 | Two frames in conversation |
| Silence | 1 | A small frame in a lot of black; makes people lean in |
| Offset | 2 | Asymmetric, good for street and architecture |
| Sequence | 3 | A strip read left to right; moments in motion |

Drag photos into a row, write a one-sentence description for each (required: it is read aloud to blind visitors and helps Google), and optionally a caption and camera data. Drag rows to reorder. Click a photo and use the **crop and hotspot** tool to mark the focal point; phones crop chapter covers around it.

Image files: JPEG, sRGB, 3000 to 4000 px on the long edge. See `docs/CONTENT-GUIDE.md`.

### Add a new project

**Projects > Create**. Fill in the **Story** tab (title, subtitle, web address via *Generate*, one-line summary, story), set a **Cover frame** and rows on the **Frames** tab, then **Details**: personal or commissioned, client, place, year, role, categories, whether it appears as a chapter on the home page, and its **Order** (1 comes first).

### Add reels and films

**Films > Create**. Upload the master file to **Video** (Mux), add a **Poster frame**, pick the **Shape** (16:9, 2.39:1, 9:16, 4:5), your roles, year and length. Tick **This is the showreel** on the showreel so it always leads. **Hover preview starts at** sets which 4 seconds play silently on hover.

### Change your bio, contact details or social links

Open **Site settings**:

- **About you:** name, title, opening line, opening frame, portrait, short bio, your story, how a shoot works, clients, CV (PDF).
- **Contact:** email, WhatsApp number (digits only with country code, e.g. `201112289036`), the first WhatsApp line, your Cal.com link (the part after `cal.com/`, e.g. `hassanbadawy/intro`), location, availability and social links.
- **Search & sharing:** the description Google shows.

### Without the Studio

Before Sanity is connected, the same content lives in `src/content/seed.ts`. Edit it and push to GitHub; Vercel redeploys.

## Environment variables

| Name | Required | Where | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Vercel | The live address. Used for canonical URLs, sitemap and social cards. Falls back to Vercel's production URL. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | For the admin panel | Vercel | Connects the site and Studio to Sanity. Public by design. |
| `NEXT_PUBLIC_SANITY_DATASET` | For the admin panel | Vercel | Usually `production`. |
| `SANITY_REVALIDATE_SECRET` | For instant updates | Vercel and the Sanity webhook | Proves publish notifications come from Sanity. **Secret: never commit it.** |

No other keys are needed. The Mux token lives inside Sanity, and Cal.com needs none. `.env.local` is git-ignored; `.env.example` lists the keys without values.

## Quality checks

```bash
npm run build && npm start      # terminal 1
npm run qa                      # terminal 2: every page at desktop and phone size
npm run qa:interactions         # intro, menu, lightbox, keyboard, filters, reduced motion
```

`npm run qa` fails on console errors, broken internal links, sideways scrolling, missing titles, descriptions, social images or alt text, and saves screenshots to `qa/screenshots/` (git-ignored). Set `BASE_URL` to test another address.

## Credits and licence

- Design, art direction and development: Long Exposure, for Hassan Badawy.
- Bodoni Moda by Owen Earl (indestructible type*), SIL Open Font License 1.1 (`src/fonts/BodoniModa-OFL.txt`).
- Geist and Geist Mono by Vercel, SIL Open Font License 1.1.
- Placeholder artwork in `public/placeholders/` is generated by `scripts/generate-placeholders.mjs` and is not photography.

**Licence:** the code is private and all rights are reserved. All photographs, films and text are © Hassan Badawy and may not be reused without permission.
