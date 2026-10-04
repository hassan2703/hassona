import { defineField, defineType } from "sanity";

/** A photograph with the details the site needs. Used for frames, covers and the portrait. */
export const picture = defineType({
  name: "picture",
  title: "Photograph",
  type: "image",
  options: { hotspot: true, metadata: ["lqip", "exif", "palette"] },
  fields: [
    defineField({
      name: "alt",
      title: "Description for screen readers and Google",
      description: "Describe what is in the frame in one sentence. Required.",
      type: "string",
      validation: (rule) => rule.required().warning("Please describe the photograph."),
    }),
  ],
});

/** A frame inside a project: a photograph plus an optional caption and camera data. */
export const frame = defineType({
  name: "frame",
  title: "Frame",
  type: "image",
  options: { hotspot: true, metadata: ["lqip", "exif"] },
  fields: [
    defineField({
      name: "alt",
      title: "Description for screen readers and Google",
      type: "string",
      validation: (rule) => rule.required().warning("Please describe the photograph."),
    }),
    defineField({ name: "caption", title: "Caption (optional)", type: "string" }),
    defineField({
      name: "exposure",
      title: "Camera data (optional)",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "camera", type: "string" }),
        defineField({ name: "lens", type: "string" }),
        defineField({ name: "shutter", type: "string", description: "e.g. 1/250 or 30s" }),
        defineField({ name: "aperture", type: "string", description: "e.g. f/8" }),
        defineField({ name: "iso", title: "ISO", type: "string" }),
        defineField({ name: "film", title: "Film stock", type: "string", description: "For analog work, e.g. Portra 400" }),
      ],
    }),
  ],
});

/** A row of frames with a layout. This is how projects are composed. */
export const row = defineType({
  name: "row",
  title: "Row",
  type: "object",
  fields: [
    defineField({
      name: "layout",
      type: "string",
      initialValue: "full",
      options: {
        layout: "radio",
        list: [
          { title: "Full bleed · 1 frame, edge to edge", value: "full" },
          { title: "Pair · 2 frames side by side", value: "pair" },
          { title: "Silence · 1 small frame in a lot of black", value: "silence" },
          { title: "Offset · 2 frames, asymmetric", value: "offset" },
          { title: "Sequence · 3 frames in a strip", value: "sequence" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "frames",
      type: "array",
      of: [{ type: "frame" }],
      options: { layout: "grid" },
      validation: (rule) =>
        rule.min(1).custom((frames, context) => {
          const layout = (context.parent as { layout?: string })?.layout;
          const want = { full: 1, silence: 1, pair: 2, offset: 2, sequence: 3 }[layout || "full"];
          return !frames || frames.length === want || `This layout looks best with ${want} frame${want === 1 ? "" : "s"}.`;
        }).warning(),
    }),
  ],
  preview: {
    select: { layout: "layout", media: "frames.0", count: "frames.length" },
    prepare: ({ layout, media }) => ({ title: `${(layout || "full").toUpperCase()}`, media }),
  },
});
