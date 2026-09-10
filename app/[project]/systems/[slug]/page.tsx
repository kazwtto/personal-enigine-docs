// import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownArticle } from "@/app/components/MarkdownArticle";
import { getContent } from "@/lib/content";
import { discoverProjects, getProjectSystemSlugs } from "@/lib/projects";
import { getServerI18n } from "@/i18n/server";

type SystemPageProps = { params: Promise<{ project: string; slug: string }> };

export function generateStaticParams() {
    return discoverProjects().flatMap((project) =>
        getProjectSystemSlugs(project.slug).map((slug) => ({
            project: project.slug,
            slug,
        })),
    );
}

// export async function generateMetadata({ params }: SystemPageProps): Promise<Metadata> {
//   const { project, slug } = await params;
//   const { locale } = await getServerI18n();
//   const { systemGuideBySlug } = getContent(project, locale);
//   const guide = systemGuideBySlug.get(slug);
//   if (!guide) return {};
//   return { title: guide.title, description: guide.description, alternates: { canonical: `/${project}/systems/${guide.slug}` } };
// }

export default async function SystemPage({ params }: SystemPageProps) {
    const { project, slug } = await params;
    const { locale } = await getServerI18n();
    const { systemGuideBySlug, systemGuides } = getContent(project, locale);

    const guide = systemGuideBySlug.get(slug);
    if (!guide) notFound();

    const routePrefix = `/${project}`;
    const index = systemGuides.findIndex((item) => item.slug === slug);
    const previous = index > 0 ? systemGuides[index - 1] : null;
    const next =
        index < systemGuides.length - 1 ? systemGuides[index + 1] : null;
    const homeLabel = locale === "pt-BR" ? "Início" : "Home";

    return (
        <div className="content-page">
            <div className="breadcrumbs">
                <Link href={routePrefix}>{homeLabel}</Link>
                <span>/</span>
                <span>Manuais de sistema</span>
                <span>/</span>
                <strong>{guide.title}</strong>
            </div>
            <MarkdownArticle guide={guide} project={project} />
            <nav className="article-pagination" aria-label="Manuais de sistema">
                {previous ? (
                    <Link href={`${routePrefix}/systems/${previous.slug}`}>
                        <ArrowLeft size={18} />
                        <span>
                            <small>Anterior</small>
                            <strong>{previous.title}</strong>
                        </span>
                    </Link>
                ) : (
                    <span />
                )}
                {next ? (
                    <Link
                        className="next"
                        href={`${routePrefix}/systems/${next.slug}`}
                    >
                        <span>
                            <small>Próximo</small>
                            <strong>{next.title}</strong>
                        </span>
                        <ArrowRight size={18} />
                    </Link>
                ) : (
                    <span />
                )}
            </nav>
        </div>
    );
}
