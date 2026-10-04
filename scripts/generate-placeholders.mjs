/**
 * Generates the clearly labelled stand-in artwork the site ships with until
 * Hassan's real photographs are uploaded to the Studio.
 *
 *   npm run placeholders
 *
 * Writes SVG files to public/placeholders/<series>/ and a manifest to
 * src/content/placeholders.json that the seed content reads.
 * None of this is photography and every file says so on its face.
 */
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "placeholders");
const manifestPath = join(root, "src", "content", "placeholders.json");

/* Deterministic random so re-running produces identical files. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RATIOS = {
  "3:2": [1800, 1200],
  "2:3": [1200, 1800],
  "4:5": [1440, 1800],
  "16:9": [1920, 1080],
  "2.39:1": [2390, 1000],
  "1:1": [1500, 1500],
};

const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function label(w, h, text) {
  const size = Math.round(Math.min(w, h) * 0.02);
  return `
  <text x="${w / 2}" y="${h * 0.5}" text-anchor="middle" font-family="${mono}" font-size="${size}" letter-spacing="${size * 0.14}" fill="#ECE6DD" fill-opacity="0.55">PLACEHOLDER · ${text}</text>`;
}

function ridgePath(r, w, h, base, amp, steps) {
  let d = `M0 ${h} L0 ${base}`;
  for (let i = 1; i <= steps; i++) {
    const x = (w / steps) * i;
    const y = base - r() * amp + amp * 0.3;
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + ` L${w} ${h} Z`;
}

/* ---------- scenes ---------- */

function desert(r, w, h, { bw = false, walkers = false } = {}) {
  const sky = bw
    ? ["#1b1b1a", "#5a5956", "#a3a19c"]
    : ["#2b2620", "#6d5743", "#c49a70"];
  const ridges = bw
    ? ["#3a3937", "#262524", "#151514"]
    : ["#4a3a2e", "#2a221c", "#14110e"];
  const horizon = 0.5 + r() * 0.12;
  let out = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${sky[0]}"/>
      <stop offset="${(horizon * 0.8).toFixed(2)}" stop-color="${sky[1]}"/>
      <stop offset="${horizon.toFixed(2)}" stop-color="${sky[2]}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>`;
  ridges.forEach((fill, i) => {
    const base = h * (horizon + 0.04 + i * 0.12);
    out += `<path d="${ridgePath(r, w, h, base, h * (0.22 - i * 0.05), 7 + i * 3)}" fill="${fill}"/>`;
  });
  if (walkers) {
    const gx = w * (0.44 + r() * 0.1);
    const gy = h * (horizon + 0.2);
    const fh = h * 0.07;
    const fw = Math.max(6, w * 0.006);
    out += `<g fill="#0d0b09">
      <rect x="${gx}" y="${gy - fh}" width="${fw}" height="${fh}" rx="${fw / 2}"/>
      <rect x="${gx + fw * 3}" y="${gy - fh * 0.92}" width="${fw}" height="${fh * 0.92}" rx="${fw / 2}"/>
    </g>`;
  }
  return out;
}

function event(r, w, h) {
  let out = `
  <defs>
    <radialGradient id="room" cx="0.5" cy="0.38" r="0.8">
      <stop offset="0" stop-color="#3a2a22"/>
      <stop offset="0.6" stop-color="#140f0c"/>
      <stop offset="1" stop-color="#0a0807"/>
    </radialGradient>
    <radialGradient id="bok"><stop offset="0" stop-color="#e8c79a" stop-opacity="0.9"/><stop offset="1" stop-color="#e8c79a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#room)"/>`;
  // arches: the Citadel's stone, abstracted
  const arches = 3 + Math.floor(r() * 3);
  for (let i = 0; i < arches; i++) {
    const aw = w / arches;
    const x = i * aw + aw * 0.18;
    const top = h * (0.18 + r() * 0.06);
    const ww = aw * 0.64;
    out += `<path d="M${x} ${h * 0.72} L${x} ${top + ww / 2} A${ww / 2} ${ww / 2} 0 0 1 ${x + ww} ${top + ww / 2} L${x + ww} ${h * 0.72} Z" fill="#1d1612" stroke="#4b3a2e" stroke-width="${w * 0.002}"/>`;
  }
  for (let i = 0; i < 26; i++) {
    const cx = r() * w;
    const cy = r() * h * 0.55;
    const rad = Math.min(w, h) * (0.01 + r() * 0.05);
    out += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="url(#bok)" opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`;
  }
  // crowd line
  let crowd = `M0 ${h}`;
  for (let x = 0; x <= w; x += w / 40) {
    crowd += ` L${x} ${h * (0.74 + r() * 0.08)}`;
  }
  out += `<path d="${crowd} L${w} ${h} Z" fill="#080605"/>`;
  return out;
}

function street(r, w, h) {
  let out = `
  <defs>
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b0c10"/><stop offset="1" stop-color="#1c1814"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#night)"/>`;
  let x = 0;
  while (x < w) {
    const bw = w * (0.08 + r() * 0.14);
    const top = h * (0.08 + r() * 0.4);
    out += `<rect x="${x}" y="${top}" width="${bw}" height="${h}" fill="#15130f" stroke="#221e19" stroke-width="2"/>`;
    for (let wy = top + 30; wy < h * 0.7; wy += h * 0.05) {
      for (let wx = x + 14; wx < x + bw - 20; wx += w * 0.025) {
        if (r() > 0.72) out += `<rect x="${wx}" y="${wy}" width="${w * 0.01}" height="${h * 0.018}" fill="#d9b27e" opacity="${(0.3 + r() * 0.6).toFixed(2)}"/>`;
      }
    }
    x += bw + w * 0.004;
  }
  // long exposure light trails
  for (let i = 0; i < 7; i++) {
    const y = h * (0.78 + i * 0.02 + r() * 0.01);
    const col = i % 3 === 0 ? "#c4492f" : "#f0dcc0";
    out += `<path d="M${-w * 0.05} ${y} C ${w * 0.3} ${y - h * 0.03}, ${w * 0.7} ${y + h * 0.02}, ${w * 1.05} ${y - h * 0.01}" stroke="${col}" stroke-width="${2 + r() * 4}" fill="none" opacity="${(0.4 + r() * 0.5).toFixed(2)}"/>`;
  }
  out += `<rect y="${h * 0.86}" width="${w}" height="${h * 0.14}" fill="#0a0908"/>`;
  return out;
}

function structure(r, w, h) {
  const light = 0.55 + r() * 0.25;
  let out = `<rect width="${w}" height="${h}" fill="#151514"/>`;
  const n = 5 + Math.floor(r() * 6);
  for (let i = 0; i < n; i++) {
    const x1 = r() * w, x2 = r() * w;
    const shade = Math.floor(30 + r() * 120 * light);
    out += `<polygon points="${x1},0 ${x1 + w * 0.2},0 ${x2 + w * 0.12},${h} ${x2},${h}" fill="rgb(${shade},${shade},${shade - 4})" opacity="${(0.35 + r() * 0.5).toFixed(2)}"/>`;
  }
  // grid of a facade
  const cols = 6 + Math.floor(r() * 8);
  for (let c = 0; c <= cols; c++) {
    out += `<line x1="${(w / cols) * c}" y1="${h * 0.12}" x2="${(w / cols) * c}" y2="${h}" stroke="#0b0b0a" stroke-width="${w * 0.004}"/>`;
  }
  out += `<line x1="0" y1="${h * 0.12}" x2="${w}" y2="${h * 0.12}" stroke="#d8d4cc" stroke-width="${w * 0.002}" opacity="0.5"/>`;
  return out;
}

function portrait(r, w, h, { bw = false } = {}) {
  const key = bw ? "#8f8d89" : "#8a6a52";
  const cx = w * (0.4 + r() * 0.2);
  return `
  <defs>
    <radialGradient id="keylight" cx="${(cx / w).toFixed(2)}" cy="0.35" r="0.55">
      <stop offset="0" stop-color="${key}"/><stop offset="1" stop-color="#0b0a09"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#keylight)"/>
  <ellipse cx="${cx}" cy="${h * 0.42}" rx="${w * 0.13}" ry="${h * 0.12}" fill="#0f0d0b"/>
  <path d="M${cx - w * 0.34} ${h} C ${cx - w * 0.3} ${h * 0.62}, ${cx + w * 0.3} ${h * 0.62}, ${cx + w * 0.34} ${h} Z" fill="#0f0d0b"/>`;
}

function filmFrame(r, w, h) {
  return desert(r, w, h, { walkers: r() > 0.5 }) + `
  <rect width="${w}" height="${h * 0.06}" fill="#000"/><rect y="${h * 0.94}" width="${w}" height="${h * 0.06}" fill="#000"/>`;
}

const SCENES = { desert, event, street, structure, portrait, film: filmFrame };

/* ---------- the series ---------- */

const SERIES = [
  { id: "hero", title: "SAINT CATHERINE", items: [["2.39:1", "desert", { walkers: true }]] },
  { id: "portrait", title: "PORTRAIT OF HASSAN", items: [["4:5", "portrait", {}]] },
  {
    id: "saint-catherine",
    title: "SAINT CATHERINE",
    items: [
      ["2.39:1", "desert", { walkers: true }], ["3:2", "desert", {}], ["2:3", "desert", { bw: true }],
      ["2:3", "desert", {}], ["3:2", "desert", { bw: true }], ["4:5", "portrait", {}],
      ["3:2", "desert", {}], ["3:2", "desert", { walkers: true }], ["1:1", "desert", { bw: true }],
      ["2:3", "desert", {}], ["3:2", "desert", {}], ["16:9", "desert", { bw: true }],
    ],
  },
  {
    id: "kerastase-elixir",
    title: "KÉRASTASE · ELIXIR",
    items: [
      ["3:2", "event", {}], ["2:3", "event", {}], ["2:3", "portrait", {}], ["3:2", "event", {}],
      ["16:9", "event", {}], ["4:5", "portrait", {}], ["3:2", "event", {}], ["3:2", "event", {}],
      ["2:3", "event", {}], ["3:2", "event", {}],
    ],
  },
  {
    id: "cairo-streets",
    title: "CAIRO STREETS",
    items: [
      ["3:2", "street", {}], ["2:3", "street", {}], ["3:2", "street", {}], ["16:9", "street", {}],
      ["2:3", "street", {}], ["3:2", "street", {}], ["3:2", "street", {}], ["2:3", "street", {}],
    ],
  },
  {
    id: "structures",
    title: "STRUCTURES",
    items: [
      ["2:3", "structure", {}], ["2:3", "structure", {}], ["3:2", "structure", {}], ["1:1", "structure", {}],
      ["2:3", "structure", {}], ["3:2", "structure", {}], ["2:3", "structure", {}], ["3:2", "structure", {}],
    ],
  },
  {
    id: "faces",
    title: "FACES",
    items: [
      ["4:5", "portrait", {}], ["4:5", "portrait", { bw: true }], ["2:3", "portrait", {}], ["4:5", "portrait", {}],
      ["2:3", "portrait", { bw: true }], ["4:5", "portrait", {}], ["4:5", "portrait", { bw: true }], ["2:3", "portrait", {}],
    ],
  },
  {
    id: "films",
    title: "FILM POSTER",
    items: [["2.39:1", "film", {}], ["16:9", "event", {}], ["16:9", "street", {}], ["2.39:1", "film", {}]],
  },
];

rmSync(outDir, { recursive: true, force: true });
const manifest = {};
let seed = 1984;

for (const series of SERIES) {
  const dir = join(outDir, series.id);
  mkdirSync(dir, { recursive: true });
  manifest[series.id] = series.items.map(([ratio, scene, opts], i) => {
    const [w, h] = RATIOS[ratio];
    const r = rng(seed++ * 7919);
    const n = String(i + 1).padStart(2, "0");
    const body = SCENES[scene](r, w, h, opts);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Placeholder artwork">${body}${label(w, h, `${series.title} · ${n}`)}</svg>\n`;
    const file = `${n}.svg`;
    writeFileSync(join(dir, file), svg);
    return { src: `/placeholders/${series.id}/${file}`, width: w, height: h };
  });
}

mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Wrote ${Object.values(manifest).flat().length} placeholders to public/placeholders`);
