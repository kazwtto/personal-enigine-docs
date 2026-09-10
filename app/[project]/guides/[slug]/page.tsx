// import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownArticle } from "@/app/components/MarkdownArticle";
import { getContent } from "@/lib/content";
import { discoverProjects, getProjectGuideSlugs } from "@/lib/projects";
import { getServerI18n } from "@/i18n/server";

type GuidePageProps = { params: Promise<{ project: string; slug: string }> };

export function generateStaticParams() {
    return discoverProjects().flatMap((project) =>
        getProjectGuideSlugs(project.slug).map((slug) => ({
            project: project.slug,
            slug,
        })),
    );
}

// export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
//   const { project, slug } = await params;
//   const { locale } = await getServerI18n();
//   const { guideBySlug } = getContent(project, locale);
//   const guide = guideBySlug.get(slug);
//   if (!guide) return {};
//   return { title: guide.title, description: guide.description, alternates: { canonical: `/${project}/guides/${guide.slug}` } };
// }

export default async function GuidePage({ params }: GuidePageProps) {
    const { project, slug } = await params;
    const { locale } = await getServerI18n();
    const { guideBySlug, guides } = getContent(project, locale);

    const guide = guideBySlug.get(slug);
    if (!guide) notFound();

    const routePrefix = `/${project}`;
    const index = guides.findIndex((item) => item.slug === slug);
    const previous = index > 0 ? guides[index - 1] : null;
    const next = index < guides.length - 1 ? guides[index + 1] : null;
    const homeLabel = locale === "pt-BR" ? "Início" : "Home";

    return (
        <div className="content-page">
            <div className="breadcrumbs">
                <Link href={routePrefix}>{homeLabel}</Link>
                <span>/</span>
                <span>Guias</span>
                <span>/</span>
                <strong>{guide.title}</strong>
            </div>
            <MarkdownArticle guide={guide} project={project} />
            <nav className="article-pagination" aria-label="Capítulos">
                {previous ? (
                    <Link href={`${routePrefix}/guides/${previous.slug}`}>
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
                        href={`${routePrefix}/guides/${next.slug}`}
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
