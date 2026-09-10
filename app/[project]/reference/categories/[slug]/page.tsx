// import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Boxes, Code2, Layers3 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReferenceExplorer } from "@/app/components/ReferenceExplorer";
import { getContent } from "@/lib/content";
import { discoverProjects, getProjectCanonicalLocale } from "@/lib/projects";
import { getServerI18n } from "@/i18n/server";

type CategoryPageProps = { params: Promise<{ project: string; slug: string }> };

export function generateStaticParams() {
    return discoverProjects().flatMap((project) => {
        const { referenceCategoryDetails } = getContent(
            project.slug,
            getProjectCanonicalLocale(project.slug),
        );
        return referenceCategoryDetails.map((category) => ({
            project: project.slug,
            slug: category.slug,
        }));
    });
}

// export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
//   const { project, slug } = await params;
//   const { locale } = await getServerI18n();
//   const { referenceCategoryBySlug } = getContent(project, locale);
//   const category = referenceCategoryBySlug.get(slug);
//   if (!category) return {};
//   return { title: category.title, description: `${category.description} Referência individual de cada função e método.`, alternates: { canonical: `/${project}/reference/categories/${category.slug}` } };
// }

export default async function ReferenceCategoryPage({
    params,
}: CategoryPageProps) {
    const { project, slug } = await params;
    const { t, locale } = await getServerI18n();
    const {
        referenceCategoryBySlug,
        referenceCategoryDetails,
        referenceEntries,
    } = getContent(project, locale);

    const category = referenceCategoryBySlug.get(slug);
    if (!category) notFound();

    const routePrefix = `/${project}`;
    const entries = referenceEntries.filter(
        (entry) => entry.category === category.sourceTitle,
    );
    const index = referenceCategoryDetails.findIndex(
        (item) => item.slug === slug,
    );
    const previous = index > 0 ? referenceCategoryDetails[index - 1] : null;
    const next =
        index < referenceCategoryDetails.length - 1
            ? referenceCategoryDetails[index + 1]
            : null;

    return (
        <div className="content-page reference-page category-page">
            <div className="breadcrumbs">
                <Link href={routePrefix}>{t("reference.detail.home")}</Link>
                <span>/</span>
                <Link href={`${routePrefix}/reference`}>
                    {t("reference.detail.api")}
                </Link>
                <span>/</span>
                <strong>{category.title}</strong>
            </div>
            <header className="page-hero compact-hero category-hero">
                <span className="category-symbol">
                    <Code2 size={24} />
                </span>
                <div>
                    <span className="eyebrow">
                        <Boxes size={15} />{" "}
                        {t("reference.category.heroEyebrow")}
                    </span>
                    <h1>{category.title}</h1>
                    <p>{category.description}</p>
                </div>
                <div className="page-hero-stats">
                    <span>
                        <strong>{category.count}</strong>{" "}
                        {t("reference.category.documented")}
                    </span>
                    <span>
                        <Layers3 size={16} /> {category.subcategories.length}{" "}
                        {t("reference.category.subsections")}
                    </span>
                </div>
            </header>

            <div className="subcategory-strip">
                {category.subcategories.map((subcategory) => (
                    <span key={subcategory}>
                        {subcategory}
                        <small>
                            {
                                entries.filter(
                                    (entry) =>
                                        entry.subcategory === subcategory,
                                ).length
                            }
                        </small>
                    </span>
                ))}
            </div>

            <ReferenceExplorer
                entries={entries}
                categories={[]}
                basePath={`${routePrefix}/reference`}
            />

            <nav
                className="category-pagination"
                aria-label={t("reference.category.heroEyebrow")}
            >
                {previous ? (
                    <Link
                        href={`${routePrefix}/reference/categories/${previous.slug}`}
                    >
                        <ArrowLeft size={17} />
                        <span>
                            <small>{t("reference.category.prevSection")}</small>
                            <strong>{previous.title}</strong>
                        </span>
                    </Link>
                ) : (
                    <span />
                )}
                {next ? (
                    <Link
                        className="next"
                        href={`${routePrefix}/reference/categories/${next.slug}`}
                    >
                        <span>
                            <small>{t("reference.category.nextSection")}</small>
                            <strong>{next.title}</strong>
                        </span>
                        <ArrowRight size={17} />
                    </Link>
                ) : (
                    <span />
                )}
            </nav>
        </div>
    );
}
