import { defineField, defineType } from "sanity";

export const film = defineType({
  name: "film",
  title: "Film",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Web address", type: "slug", options: { source: "title", maxLength: 64 }, validation: (rule) => rule.required() }),
    defineField({ name: "showreel", title: "This is the showreel", description: "The showreel always plays first.", type: "boolean", initialValue: false }),
    defineField({
      name: "video",
      title: "Video (recommended)",
      description: "Upload the master file here. Mux streams it in the right quality for every screen and makes the hover preview.",
      type: "mux.video",
    }),
    defineField({
      name: "file",
      title: "Video file (only if you are not using Mux)",
      description: "A compressed MP4, ideally under 50 MB.",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
    }),
    defineField({ name: "poster", title: "Poster frame", type: "picture", validation: (rule) => rule.required() }),
    defineField({ name: "previewStart", title: "Hover preview starts at (seconds)", type: "number", initialValue: 0 }),
    defineField({
      name: "aspect",
      title: "Shape",
      type: "string",
      initialValue: "16:9",
      options: { layout: "radio", direction: "horizontal", list: ["16:9", "2.39:1", "9:16", "4:5"] },
    }),
    defineField({ name: "client", type: "string" }),
    defineField({ name: "year", type: "string" }),
    defineField({ name: "duration", title: "Length", description: "e.g. 1:30", type: "string" }),
    defineField({
      name: "roles",
      title: "Your roles",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "grid", list: ["Director", "Director of Photography", "Editor", "Colourist", "Producer"] },
    }),
    defineField({ name: "note", title: "A few words about the film", type: "text", rows: 3 }),
    defineField({
      name: "credits",
      type: "array",
      of: [{ type: "object", fields: [defineField({ name: "role", type: "string" }), defineField({ name: "name", type: "string" })], preview: { select: { title: "name", subtitle: "role" } } }],
    }),
    defineField({ name: "position", title: "Order", type: "number" }),
  ],
  preview: {
    select: { title: "title", year: "year", media: "poster", showreel: "showreel" },
    prepare: ({ title, year, media, showreel }) => ({ title, subtitle: [showreel ? "Showreel" : null, year].filter(Boolean).join(" · "), media }),
  },
});
