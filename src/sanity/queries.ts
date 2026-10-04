import { defineQuery } from "next-sanity";

const pictureFields = `
  alt,
  hotspot,
  "url": asset->url,
  "lqip": asset->metadata.lqip,
  "w": asset->metadata.dimensions.width,
  "h": asset->metadata.dimensions.height`;

const picture = `{${pictureFields}}`;

export const archiveQuery = defineQuery(`{
  "settings": *[_type == "settings"][0]{
    name, title, tagline, location, availability, intro, origin, approach[]{title, text},
    email, whatsapp, whatsappMessage, calLink, clients, socials[]{label, url, handle},
    seoDescription,
    "portrait": portrait${picture},
    "hero": hero${picture},
    "cvUrl": cv.asset->url
  },
  "projects": *[_type == "project" && defined(slug.current)] | order(coalesce(position, 999) asc, year desc){
    "slug": slug.current, title, subtitle, kind, categories, client, place, year, role,
    summary, story, brief, featured,
    "cover": cover${picture},
    rows[]{
      _key, layout,
      frames[]{ _key, caption, exposure, ${pictureFields} }
    }
  },
  "films": *[_type == "film" && defined(slug.current)] | order(showreel desc, coalesce(position, 999) asc, year desc){
    "slug": slug.current, title, client, year, roles, duration, aspect, previewStart, note,
    credits[]{role, name}, showreel,
    "poster": poster${picture},
    "playbackId": video.asset->playbackId,
    "fileUrl": file.asset->url
  }
}`);
