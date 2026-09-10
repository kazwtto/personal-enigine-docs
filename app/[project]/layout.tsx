// import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocShell } from "@/app/components/DocShell";
import { getContent } from "@/lib/content";
import { getProjectCopy, getProjectMeta } from "@/lib/projects";
import { getServerI18n } from "@/i18n/server";

// export async function generateMetadata({ params }: { params: Promise<{ project: string }> }): Promise<Metadata> {
//   const { project } = await params;
//   const meta = getProjectMeta(project);
//   if (!meta) return {};
//   const { t } = await getServerI18n();
//   const title = `${meta.title} ${t("brand.unofficialTag")}`;
//   return {
//     title: { default: title, template: `%s | ${title}` },
//     description: `${meta.subtitle} — ${t("footer.unofficial")}`,
//   };
// }

export default async function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ project: string }>;
}) {
    const { project } = await params;
    const { locale } = await getServerI18n();

    const meta = getProjectMeta(project);
    if (!meta) notFound();

    const { guides, systemGuides, complements, searchItems, referenceEntries } =
        getContent(project, locale);
    const shellGuides = guides
        .filter((guide) => guide.slug !== "api-reference")
        .map(({ slug, title, eyebrow }) => ({ slug, title, eyebrow }));
    const shellSystemGuides = systemGuides.map(({ slug, title, eyebrow }) => ({
        slug,
        title,
        eyebrow,
    }));
    const copy = getProjectCopy(project, locale);

    return (
        <DocShell
            project={project}
            meta={meta}
            copy={copy}
            guides={shellGuides}
            systemGuides={shellSystemGuides}
            complements={complements}
            searchItems={searchItems}
            referenceCount={referenceEntries.length}
        >
            {children}
        </DocShell>
    );
}
