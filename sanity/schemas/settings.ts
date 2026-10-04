import { defineField, defineType } from "sanity";

/** One document holding everything about Hassan: bio, contact, socials, CV. */
export const settings = defineType({
  name: "settings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "you", title: "About you", default: true },
    { name: "contact", title: "Contact" },
    { name: "seo", title: "Search & sharing" },
  ],
  fields: [
    defineField({ name: "name", type: "string", group: "you", initialValue: "Hassan Badawy" }),
    defineField({ name: "title", title: "Title", type: "string", group: "you", initialValue: "Photographer & Director" }),
    defineField({ name: "tagline", title: "Opening line", description: "The line on the first screen.", type: "string", group: "you", initialValue: "I keep what I see." }),
    defineField({ name: "hero", title: "Opening frame", description: "The photograph that develops when someone first arrives.", type: "picture", group: "you" }),
    defineField({ name: "portrait", title: "Your portrait", type: "picture", group: "you" }),
    defineField({ name: "intro", title: "Short bio", description: "Two or three sentences.", type: "text", rows: 3, group: "you" }),
    defineField({ name: "origin", title: "Your story", description: "How it started. Leave a blank line between paragraphs.", type: "text", rows: 6, group: "you" }),
    defineField({
      name: "approach",
      title: "How a shoot with you works",
      type: "array",
      group: "you",
      of: [{ type: "object", fields: [defineField({ name: "title", type: "string" }), defineField({ name: "text", type: "text", rows: 2 })] }],
    }),
    defineField({ name: "clients", title: "Clients", type: "array", of: [{ type: "string" }], group: "you" }),
    defineField({ name: "cv", title: "CV (PDF)", type: "file", options: { accept: "application/pdf" }, group: "you" }),
    defineField({ name: "location", type: "string", group: "contact", initialValue: "Cairo, Egypt" }),
    defineField({ name: "availability", type: "string", group: "contact", initialValue: "Based in Cairo. Working worldwide." }),
    defineField({ name: "email", type: "string", group: "contact", validation: (rule) => rule.email() }),
    defineField({ name: "whatsapp", title: "WhatsApp number", description: "With country code, digits only. e.g. 201112289036", type: "string", group: "contact" }),
    defineField({ name: "whatsappMessage", title: "WhatsApp first line", type: "string", group: "contact" }),
    defineField({ name: "calLink", title: "Cal.com link", description: "e.g. hassanbadawy/intro (the part after cal.com/)", type: "string", group: "contact" }),
    defineField({
      name: "socials",
      title: "Social links",
      type: "array",
      group: "contact",
      of: [{ type: "object", fields: [defineField({ name: "label", type: "string" }), defineField({ name: "url", type: "url" }), defineField({ name: "handle", type: "string" })], preview: { select: { title: "label", subtitle: "url" } } }],
    }),
    defineField({ name: "seoDescription", title: "Description for Google", type: "text", rows: 3, group: "seo", validation: (rule) => rule.max(170) }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
