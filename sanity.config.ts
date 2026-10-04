"use client";

/**
 * The admin panel, served at /studio.
 * Content model lives in sanity/schemas. Environment in src/sanity/env.ts.
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { muxInput } from "sanity-plugin-mux-input";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";
import { apiVersion, dataset, projectId } from "./src/sanity/env";

export default defineConfig({
  name: "default",
  title: "Hassan Badawy · Studio",
  basePath: "/studio",
  projectId: projectId || "missing",
  dataset,
  schema: {
    types: schemaTypes,
    // Site settings is a single document; hide it from "create new"
    templates: (templates) => templates.filter((t) => t.schemaType !== "settings"),
  },
  document: {
    actions: (actions, { schemaType }) =>
      schemaType === "settings" ? actions.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action)) : actions,
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem().title("Site settings").id("settings").child(S.document().schemaType("settings").documentId("settings")),
            S.divider(),
            S.documentTypeListItem("project").title("Projects"),
            S.documentTypeListItem("film").title("Films"),
          ]),
    }),
    muxInput({ mp4_support: "standard", max_resolution_tier: "2160p" }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
