// import type { Metadata } from "next";
import {
    ArrowRight,
    Braces,
    Crosshair,
    HeartPulse,
    Layers3,
    ShieldQuestion,
} from "lucide-react";
import Link from "next/link";

import { ReferenceExplorer } from "@/app/components/ReferenceExplorer";
import { getContent } from "@/lib/content";
import { getServerI18n } from "@/i18n/server";

type ReferencePageProps = { params: Promise<{ project: string }> };

// export async function generateMetadata({ params }: ReferencePageProps): Promise<Metadata> {
//   const { project } = await params;
//   const meta = getProjectMeta(project);
//   if (!meta) return {};
//   return {
//     title: "Referência da API",
//     description: "Uma página individual para cada função, método e construtor.",
//     alternates: { canonical: `/${project}/reference` },
//   };
// }

export default async function ReferencePage({ params }: ReferencePageProps) {
    const { project } = await params;
    const { t, locale } = await getServerI18n();
    const { referenceEntries, referenceCategoryDetails } = getContent(
        project,
        locale,
    );
    const routePrefix = `/${project}`;

    const featured = [
        {
            title: t("reference.featured.enemies"),
            icon: ShieldQuestion,
            href: `${routePrefix}/reference/categories/enemies`,
            description: t("reference.featured.enemies.desc"),
        },
        {
            title: t("reference.featured.bullets"),
            icon: Crosshair,
            href: `${routePrefix}/reference/categories/bullet-patterns`,
            description: t("reference.featured.bullets.desc"),
        },
        {
            title: t("reference.featured.health"),
            icon: HeartPulse,
            href: `${routePrefix}/reference/categories/health-damage`,
            description: t("reference.featured.health.desc"),
        },
    ] as const;

    return (
        <div className="content-page reference-page">
            <header className="page-hero compact-hero">
                <span className="eyebrow">
                    <Braces size={15} /> {t("reference.hero.eyebrow")}
                </span>
                <h1>{t("reference.hero.title")}</h1>
                <p>{t("reference.hero.description")}</p>
                <div className="page-hero-stats">
                    <span>
                        <strong>{referenceEntries.length}</strong>{" "}
                        {t("reference.hero.stats.functions")}
                    </span>
                    <span>
                        <Layers3 size={16} /> {referenceCategoryDetails.length}{" "}
                        {t("reference.hero.stats.areas")}
                    </span>
                </div>
            </header>

            {referenceCategoryDetails.length > 0 && (
                <section className="featured-reference-section">
                    <div className="reference-section-heading">
                        <span className="eyebrow">
                            {t("reference.featured.eyebrow")}
                        </span>
                        <h2>{t("reference.featured.title")}</h2>
                    </div>
                    <div className="featured-reference-grid">
                        {featured.map(
                            ({ title, icon: Icon, href, description }) => (
                                <Link
                                    href={href}
                                    className="featured-reference-card"
                                    key={href}
                                >
                                    <span>
                                        <Icon size={24} />
                                    </span>
                                    <div>
                                        <strong>{title}</strong>
                                        <p>{description}</p>
                                    </div>
                                    <ArrowRight size={18} />
                                </Link>
                            ),
                        )}
                    </div>
                </section>
            )}

            <section className="reference-domains-section">
                <div className="reference-section-heading">
                    <span className="eyebrow">
                        {t("reference.domains.eyebrow")}
                    </span>
                    <h2>{t("reference.domains.title")}</h2>
                </div>
                <div className="domain-grid">
                    {referenceCategoryDetails.map((category) => (
                        <Link
                            href={`${routePrefix}/reference/categories/${category.slug}`}
                            key={category.slug}
                        >
                            <span>
                                <strong>{category.title}</strong>
                                <small>{category.description}</small>
                            </span>
                            <span className="domain-count">
                                {category.count}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="all-reference-section">
                <div className="reference-section-heading">
                    <span className="eyebrow">
                        {t("reference.all.eyebrow")}
                    </span>
                    <h2>{t("reference.all.title")}</h2>
                    <p>{t("reference.all.description")}</p>
                </div>
                <ReferenceExplorer
                    entries={referenceEntries.map(
                        ({
                            slug,
                            name,
                            signature,
                            description,
                            category,
                            subcategory,
                        }) => ({
                            slug,
                            name,
                            signature,
                            description,
                            category,
                            subcategory,
                        }),
                    )}
                    categories={[
                        ...new Set(
                            referenceEntries.map((entry) => entry.category),
                        ),
                    ]}
                    basePath={`${routePrefix}/reference`}
                />
            </section>
        </div>
    );
}
