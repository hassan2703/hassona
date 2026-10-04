import { getArchive, getProject } from "@/lib/content";
import { ogCard, ogSize } from "@/lib/og";

export const alt = "Project by Hassan Badawy";
export const size = ogSize;
export const contentType = "image/png";

export async function generateStaticParams() {
  const { projects } = await getArchive();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await getProject(slug);
  const project = found?.project;
  return ogCard({
    eyebrow: project ? (project.kind === "commissioned" ? project.client ?? "Commissioned" : "Personal work") : "Project",
    title: project?.title ?? "Hassan Badawy",
    italic: project?.subtitle,
    footer: project ? [project.place, project.year].filter(Boolean).join(" · ") : "",
    picture: project?.cover,
  });
}
