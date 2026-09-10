// import type { Metadata } from "next";
import { Braces } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReferenceExplorer } from "@/app/components/ReferenceExplorer";
import { getContent } from "@/lib/content";
import { discoverProjects, getProjectCanonicalLocale } from "@/lib/projects";
import { getServerI18n } from "@/i18n/server";
import type { MessageKey } from "@/i18n/locales/pt-BR/ui";

type ComplementApiPageProps = {
    params: Promise<{ project: string; complementId: string }>;
};

export function generateStaticParams() {
    return discoverProjects().flatMap((project) => {
        const { complements } = getContent(
            project.slug,
            getProjectCanonicalLocale(project.slug),
        );
        return complements
            .filter((c) => c.hasApi)
            .map((c) => ({ project: project.slug, complementId: c.slug }));
    });
}

// export async function generateMetadata({ params }: ComplementApiPageProps): Promise<Metadata> {
//   const { project, complementId } = await params;
//   const { locale, t } = await getServerI18n();
//   const { complementBySlug } = getContent(project, locale);
//   const comp = complementBySlug.get(complementId);
//   if (!comp) return {};
//   return { title: `${comp.title} — ${t("complements.api" as MessageKey)}`, alternates: { canonical: `/${project}/complements/${comp.slug}/api` } };
// }

export default async function ComplementApiPage({
    params,
}: ComplementApiPageProps) {
    const { project, complementId } = await params;
    const { locale, t } = await getServerI18n();
    const { complementBySlug, referenceEntries } = getContent(project, locale);

    const comp = complementBySlug.get(complementId);
    if (!comp) notFound();

    const routePrefix = `/${project}`;
    const isPt = locale === "pt-BR";

    const entries = referenceEntries.filter(
        (entry) => entry.guideSlug === complementId,
    );
    if (entries.length === 0) notFound();

    const categories = [...new Set(entries.map((entry) => entry.category))];

    return (
        <div className="content-page reference-page">
            <div className="breadcrumbs">
                <Link href={routePrefix}>{isPt ? "Início" : "Home"}</Link>
                <span>/</span>
                <span>{t("nav.complements" as MessageKey)}</span>
                <span>/</span>
                <Link href={`${routePrefix}/complements/${complementId}`}>
                    {comp.title}
                </Link>
                <span>/</span>
                <strong>API</strong>
            </div>

            <header
                className="page-hero compact-hero"
                style={{ marginTop: "2rem" }}
            >
                <span className="eyebrow">
                    <Braces size={15} /> {comp.title}
                </span>
                <h1>{t("complements.api" as MessageKey)}</h1>
                <p>{t("complements.warning" as MessageKey)}</p>
                <div className="page-hero-stats">
                    <span>
                        <strong>{entries.length}</strong>{" "}
                        {t("nav.functions" as MessageKey)}
                    </span>
                </div>
            </header>

            <section className="all-reference-section">
                <ReferenceExplorer
                    entries={entries.map(
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
                    categories={categories}
                    basePath={`${routePrefix}/complements/${complementId}/api`}
                />
            </section>
        </div>
    );
}
