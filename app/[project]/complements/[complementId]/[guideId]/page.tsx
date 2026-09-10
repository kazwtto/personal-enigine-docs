// import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownArticle } from "@/app/components/MarkdownArticle";
import { getContent } from "@/lib/content";
import { discoverProjects, getProjectCanonicalLocale } from "@/lib/projects";
import { getServerI18n } from "@/i18n/server";
import type { MessageKey } from "@/i18n/locales/pt-BR/ui";

type ComplementGuidePageProps = {
    params: Promise<{ project: string; complementId: string; guideId: string }>;
};

export function generateStaticParams() {
    return discoverProjects().flatMap((project) => {
        const { complements } = getContent(
            project.slug,
            getProjectCanonicalLocale(project.slug),
        );
        return complements.flatMap((comp) =>
            comp.guides.map((guide) => ({
                project: project.slug,
                complementId: comp.slug,
                guideId: guide.id,
            })),
        );
    });
}

// export async function generateMetadata({ params }: ComplementGuidePageProps): Promise<Metadata> {
//   const { project, complementId, guideId } = await params;
//   const { locale } = await getServerI18n();
//   const { complementBySlug } = getContent(project, locale);
//   const comp = complementBySlug.get(complementId);
//   const guide = comp?.guides.find(g => g.id === guideId);
//   if (!comp || !guide) return {};
//   return { title: `${guide.title} - ${comp.title}`, alternates: { canonical: `/${project}/complements/${comp.slug}/${guide.id}` } };
// }

export default async function ComplementGuidePage({
    params,
}: ComplementGuidePageProps) {
    const { project, complementId, guideId } = await params;
    const { locale, t } = await getServerI18n();
    const { complementBySlug } = getContent(project, locale);

    const comp = complementBySlug.get(complementId);
    if (!comp) notFound();

    const index = comp.guides.findIndex((item) => item.id === guideId);
    if (index === -1) notFound();

    const routePrefix = `/${project}`;
    const guide = comp.guides[index];
    const previous = index > 0 ? comp.guides[index - 1] : null;
    const next = index < comp.guides.length - 1 ? comp.guides[index + 1] : null;
    const isPt = locale === "pt-BR";

    return (
        <div className="content-page">
            <div className="breadcrumbs">
                <Link href={routePrefix}>{isPt ? "Início" : "Home"}</Link>
                <span>/</span>
                <span>{t("nav.complements" as MessageKey)}</span>
                <span>/</span>
                <strong>{comp.title}</strong>
                <span>/</span>
                <strong>{guide.title}</strong>
            </div>

            {index === 0 && (
                <div
                    className="admonition warning"
                    style={{ marginTop: "2rem", marginBottom: "2rem" }}
                >
                    <p>
                        <strong>{t("ui.warning" as MessageKey)}</strong>
                    </p>
                    <p>{t("complements.warning" as MessageKey)}</p>
                    {comp.sourceUrl && (
                        <p style={{ marginTop: "1rem" }}>
                            <a
                                href={comp.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontWeight: 600,
                                }}
                            >
                                <span>
                                    {t("complements.sourceLink" as MessageKey)}
                                </span>
                                <ExternalLink size={16} />
                            </a>
                        </p>
                    )}
                </div>
            )}

            <MarkdownArticle
                guide={{
                    ...guide,
                    slug: guide.id,
                    eyebrow: comp.title,
                    description: comp.description,
                }}
                project={project}
            />

            <nav
                className="article-pagination"
                aria-label={isPt ? "Capítulos" : "Chapters"}
            >
                {previous ? (
                    <Link
                        href={`${routePrefix}/complements/${comp.slug}/${previous.id}`}
                    >
                        <ArrowLeft size={18} />
                        <span>
                            <small>{isPt ? "Anterior" : "Previous"}</small>
                            <strong>{previous.title}</strong>
                        </span>
                    </Link>
                ) : (
                    <span />
                )}

                {next ? (
                    <Link
                        className="next"
                        href={`${routePrefix}/complements/${comp.slug}/${next.id}`}
                    >
                        <span>
                            <small>{isPt ? "Próximo" : "Next"}</small>
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
