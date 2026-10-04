export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-10-01";

/** True once Hassan has created a Sanity project and added its ID to the environment. */
export const sanityConfigured = /^[a-z0-9-]+$/.test(projectId);
