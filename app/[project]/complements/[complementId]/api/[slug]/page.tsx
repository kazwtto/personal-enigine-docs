// import type { Metadata } from "next";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Braces,
    CheckCircle2,
    Code2,
    ExternalLink,
    Info,
    RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import {
    discoverProjects,
    getProjectCanonicalLocale,
    getProjectMeta,
} from "@/lib/projects";
import { getServerI18n } from "@/i18n/server";
import type { MessageKey } from "@/i18n/locales/pt-BR/ui";

type ComplementApiPageProps = {
    params: Promise<{ project: string; complementId: string; slug: string }>;
};

export function generateStaticParams() {
    return discoverProjects().flatMap((project) => {
        const { referenceEntries, complements } = getContent(
            project.slug,
            getProjectCanonicalLocale(project.slug),
        );
        return complements.flatMap((comp) => {
            if (!comp.hasApi) return [];
            return referenceEntries
                .filter((e) => e.guideSlug === comp.slug)
                .map((entry) => ({
                    project: project.slug,
                    complementId: comp.slug,
                    slug: entry.slug,
                }));
        });
    });
}

// export async function generateMetadata({ params }: ComplementApiPageProps): Promise<Metadata> {
//   const { project, slug, complementId } = await params;
//   const { locale } = await getServerI18n();
//   const { referenceBySlug, complementBySlug } = getContent(project, locale);
//   const entry = referenceBySlug.get(slug);
//   const comp = complementBySlug.get(complementId);
//   if (!entry || !comp || entry.guideSlug !== complementId) return {};
//   return { title: `${entry.name} - ${comp.title}`, description: entry.summary, alternates: { canonical: `/${project}/complements/${comp.slug}/api/${entry.slug}` } };
// }

function inlineCode(value: string) {
    const parts = value.split(/(`[^`]+`)/g);
    return parts.map((part, index) =>
        part.startsWith("`") && part.endsWith("`") ? (
            <code key={index}>{part.slice(1, -1)}</code>
        ) : (
            part
        ),
    );
}

export default async function ComplementApiDetailPage({
    params,
}: ComplementApiPageProps) {
    const { project, slug, complementId } = await params;
    const { t, locale } = await getServerI18n();
    const { referenceBySlug, referenceEntries, complementBySlug } = getContent(
        project,
        locale,
    );

    const comp = complementBySlug.get(complementId);
    if (!comp || !comp.hasApi) notFound();

    const entry = referenceBySlug.get(slug);
    if (!entry || entry.guideSlug !== complementId) notFound();

    const routePrefix = `/${project}`;
    const isPt = locale === "pt-BR";
    const allEntries = referenceEntries.filter(
        (item) => item.guideSlug === complementId,
    );
    const sameCategory = allEntries.filter(
        (item) => item.category === entry.category && item.slug !== entry.slug,
    );
    const related = sameCategory.slice(0, 6);

    const index = allEntries.findIndex((item) => item.slug === slug);
    const previous = index > 0 ? allEntries[index - 1] : null;
    const next = index < allEntries.length - 1 ? allEntries[index + 1] : null;

    const categoryHref = `${routePrefix}/complements/${complementId}/api`;
    const sourceBranch = getProjectMeta(project)?.branch ?? "master";

    return (
        <div className="content-page api-detail-page">
            <div className="breadcrumbs">
                <Link href={routePrefix}>{isPt ? "Início" : "Home"}</Link>
                <span>/</span>
                <Link href={`${routePrefix}/complements/${complementId}`}>
                    {comp.title}
                </Link>
                <span>/</span>
                <Link href={categoryHref}>API</Link>
                <span>/</span>
                <strong>{entry.name}</strong>
            </div>

            <header className="api-header">
                <div className="api-title-row">
                    <span className="api-symbol">
                        <Code2 size={25} />
                    </span>
                    <div>
                        <Link className="eyebrow" href={categoryHref}>
                            {entry.category} · {entry.subcategory}
                        </Link>
                        <h1>{entry.name}</h1>
                    </div>
                </div>
                <p>{inlineCode(entry.summary)}</p>
                <div className="api-chips">
                    <span>{entry.kind}</span>
                    <span>{comp.title}</span>
                </div>
            </header>

            <div className="api-layout">
                <article className="api-main">
                    <section className="api-section overview-section">
                        <h2>
                            <Info size={20} />{" "}
                            {t("reference.detail.overview" as MessageKey)}
                        </h2>
                        <div className="api-overview-grid">
                            <div>
                                <span>
                                    {t(
                                        "reference.detail.purpose" as MessageKey,
                                    )}
                                </span>
                                <p>{entry.purpose}</p>
                            </div>
                            <div>
                                <span>
                                    {t(
                                        "reference.detail.whenToUse" as MessageKey,
                                    )}
                                </span>
                                <p>{entry.whenToUse}</p>
                            </div>
                        </div>
                    </section>

                    <section className="api-section">
                        <h2>
                            <Braces size={20} />{" "}
                            {t("reference.detail.signature" as MessageKey)}
                        </h2>
                        <pre className="signature-block">
                            <code>{entry.signature}</code>
                        </pre>
                    </section>

                    <section className="api-section">
                        <div className="section-title-line">
                            <h2>
                                {t("reference.detail.arguments" as MessageKey)}
                            </h2>
                            <span className="section-count">
                                {entry.parameters.length}
                            </span>
                        </div>
                        {entry.parameters.length ? (
                            <div className="parameter-list">
                                {entry.parameters.map((parameter) => (
                                    <div
                                        className="parameter-row detailed"
                                        key={parameter.name}
                                    >
                                        <div className="parameter-identity">
                                            <code>{parameter.name}</code>
                                            <span>{parameter.type}</span>
                                        </div>
                                        <div className="parameter-description">
                                            <p>
                                                {inlineCode(
                                                    parameter.description,
                                                )}
                                            </p>
                                            <small>
                                                {parameter.required ? (
                                                    t(
                                                        "reference.detail.required" as MessageKey,
                                                    )
                                                ) : (
                                                    <>
                                                        {t(
                                                            "reference.detail.optional" as MessageKey,
                                                        )}{" "}
                                                        <code>
                                                            {
                                                                parameter.defaultValue
                                                            }
                                                        </code>
                                                    </>
                                                )}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-parameters">
                                <CheckCircle2 size={18} />
                                <span>
                                    {t("reference.detail.noArgs" as MessageKey)}
                                </span>
                            </div>
                        )}
                    </section>

                    <section className="api-section">
                        <h2>
                            <RotateCcw size={20} />{" "}
                            {t("reference.detail.return" as MessageKey)}
                        </h2>
                        <div className="return-card">
                            <code>{entry.returns.type}</code>
                            <p>{inlineCode(entry.returns.description)}</p>
                        </div>
                    </section>

                    {entry.example && (
                        <section className="api-section">
                            <h2>
                                {t("reference.detail.example" as MessageKey)}
                            </h2>
                            <pre className="example-block">
                                <code>{entry.example}</code>
                            </pre>
                            <p className="example-caption">
                                {t(
                                    "reference.detail.exampleCaption" as MessageKey,
                                )}
                            </p>
                        </section>
                    )}

                    {(entry.sideEffects.length > 0 ||
                        entry.notes.length > 0) && (
                        <section className="api-section behavior-section">
                            <h2>
                                <AlertTriangle size={20} />{" "}
                                {t("reference.detail.behavior" as MessageKey)}
                            </h2>
                            {entry.sideEffects.length > 0 && (
                                <div className="behavior-group">
                                    <span>
                                        {t(
                                            "reference.detail.effects" as MessageKey,
                                        )}
                                    </span>
                                    <ul>
                                        {entry.sideEffects.map((effect) => (
                                            <li key={effect}>{effect}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {entry.notes.length > 0 && (
                                <div className="behavior-group warning">
                                    <span>
                                        {t(
                                            "reference.detail.notes" as MessageKey,
                                        )}
                                    </span>
                                    <ul>
                                        {entry.notes.map((note) => (
                                            <li key={note}>
                                                {inlineCode(note)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </section>
                    )}

                    {entry.sourcePath && comp.sourceUrl && (
                        <section className="source-section">
                            <div>
                                <span>
                                    {t("reference.detail.source" as MessageKey)}
                                </span>
                                <code>{entry.sourcePath}</code>
                            </div>
                            <a
                                href={`${comp.sourceUrl}/blob/${sourceBranch}/${entry.sourcePath}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {t("reference.detail.viewSource" as MessageKey)}{" "}
                                <ExternalLink size={15} />
                            </a>
                        </section>
                    )}
                </article>

                <aside className="api-aside">
                    {related.length > 0 && (
                        <div className="aside-card">
                            <span>
                                {t("reference.detail.related" as MessageKey)}
                            </span>
                            {related.map((item) => (
                                <Link
                                    href={`${routePrefix}/complements/${complementId}/api/${item.slug}`}
                                    key={item.slug}
                                >
                                    <code>{item.name}</code>
                                    <ArrowRight size={15} />
                                </Link>
                            ))}
                        </div>
                    )}
                    <Link className="aside-category" href={categoryHref}>
                        {t("reference.detail.viewSection" as MessageKey)}{" "}
                        <strong>{entry.category}</strong>
                        <ArrowRight size={15} />
                    </Link>
                </aside>
            </div>

            <nav
                className="api-pagination"
                aria-label="Referência anterior e próxima"
            >
                {previous ? (
                    <Link
                        href={`${routePrefix}/complements/${complementId}/api/${previous.slug}`}
                    >
                        <ArrowLeft size={17} />
                        <span>
                            <small>
                                {t("reference.detail.previous" as MessageKey)}
                            </small>
                            <code>{previous.name}</code>
                        </span>
                    </Link>
                ) : (
                    <span />
                )}
                {next ? (
                    <Link
                        className="next"
                        href={`${routePrefix}/complements/${complementId}/api/${next.slug}`}
                    >
                        <span>
                            <small>
                                {t("reference.detail.next" as MessageKey)}
                            </small>
                            <code>{next.name}</code>
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
