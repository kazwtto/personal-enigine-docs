// import type { Metadata } from "next";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Braces,
    CheckCircle2,
    Code2,
    ExternalLink,
    Info,
    RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    getReferenceCategoryTitle,
    getReferenceCategorySlug,
    getContent,
} from "@/lib/content";
import { getContentPack } from "@/i18n/content";
import {
    discoverProjects,
    getProjectCanonicalLocale,
    getProjectMeta,
} from "@/lib/projects";
import { getServerI18n } from "@/i18n/server";

type ReferencePageProps = {
    params: Promise<{ project: string; slug: string }>;
};

export function generateStaticParams() {
    return discoverProjects().flatMap((project) => {
        const { referenceEntries } = getContent(
            project.slug,
            getProjectCanonicalLocale(project.slug),
        );
        return referenceEntries.map((entry) => ({
            project: project.slug,
            slug: entry.slug,
        }));
    });
}

// export async function generateMetadata({ params }: ReferencePageProps): Promise<Metadata> {
//   const { project, slug } = await params;
//   const { locale } = await getServerI18n();
//   const { referenceBySlug } = getContent(project, locale);
//   const entry = referenceBySlug.get(slug);
//   if (!entry) return {};
//   return { title: entry.name, description: `${entry.summary} Veja argumentos, retorno, efeitos e exemplo em GML.`, alternates: { canonical: `/${project}/reference/${entry.slug}` } };
// }

function systemSlugFor(category: string) {
    if (category === "Inimigos") return "defining-enemies";
    if (category === "Padrões de bala") return "bullet-patterns";
    if (category === "Vida e dano") return "health-healing-and-damage";
    return null;
}

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

export default async function ReferenceDetailPage({
    params,
}: ReferencePageProps) {
    const { project, slug } = await params;
    const { t, locale } = await getServerI18n();
    const {
        referenceBySlug,
        referenceEntries,
        guideBySlug,
        systemGuideBySlug,
    } = getContent(project, locale);

    const entry = referenceBySlug.get(slug);
    if (!entry) notFound();

    const routePrefix = `/${project}`;
    const meta = getProjectMeta(project);
    const sourceHref =
        meta?.githubUrl && entry.sourcePath
            ? `${meta.githubUrl}/blob/${meta.branch ?? "master"}/${entry.sourcePath}`
            : null;
    const engineVersion = getContentPack(project, locale).apiReference
        .engineVersion;
    const guide = guideBySlug.get(entry.guideSlug);
    const systemGuide = systemGuideBySlug.get(
        systemSlugFor(entry.category) ?? "",
    );
    const sameSubcategory = referenceEntries.filter(
        (item) =>
            item.subcategory === entry.subcategory && item.slug !== entry.slug,
    );
    const sameCategory = referenceEntries.filter(
        (item) =>
            item.category === entry.category &&
            item.slug !== entry.slug &&
            !sameSubcategory.some((related) => related.slug === item.slug),
    );
    const related = [...sameSubcategory, ...sameCategory].slice(0, 6);
    const index = referenceEntries.findIndex((item) => item.slug === slug);
    const previous = index > 0 ? referenceEntries[index - 1] : null;
    const next =
        index < referenceEntries.length - 1
            ? referenceEntries[index + 1]
            : null;
    const categoryTitle = getReferenceCategoryTitle(entry.category);
    const categoryHref = `${routePrefix}/reference/categories/${getReferenceCategorySlug(entry.category)}`;

    return (
        <div className="content-page api-detail-page">
            <div className="breadcrumbs">
                <Link href={routePrefix}>{t("reference.detail.home")}</Link>
                <span>/</span>
                <Link href={`${routePrefix}/reference`}>
                    {t("reference.detail.api")}
                </Link>
                <span>/</span>
                <Link href={categoryHref}>{categoryTitle}</Link>
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
                            {categoryTitle} · {entry.subcategory}
                        </Link>
                        <h1>{entry.name}</h1>
                    </div>
                </div>
                <p>{inlineCode(entry.summary)}</p>
                <div className="api-chips">
                    <span>{entry.kind}</span>
                    {engineVersion && <span>Engine v{engineVersion}</span>}
                    {meta?.branch && <span>branch {meta.branch}</span>}
                </div>
            </header>

            <div className="api-layout">
                <article className="api-main">
                    <section className="api-section overview-section">
                        <h2>
                            <Info size={20} /> {t("reference.detail.overview")}
                        </h2>
                        <div className="api-overview-grid">
                            <div>
                                <span>{t("reference.detail.purpose")}</span>
                                <p>{entry.purpose}</p>
                            </div>
                            <div>
                                <span>{t("reference.detail.whenToUse")}</span>
                                <p>{entry.whenToUse}</p>
                            </div>
                        </div>
                    </section>

                    <section className="api-section">
                        <h2>
                            <Braces size={20} />{" "}
                            {t("reference.detail.signature")}
                        </h2>
                        <pre className="signature-block">
                            <code>{entry.signature}</code>
                        </pre>
                    </section>

                    <section className="api-section">
                        <div className="section-title-line">
                            <h2>{t("reference.detail.arguments")}</h2>
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
                                                        "reference.detail.required",
                                                    )
                                                ) : (
                                                    <>
                                                        {t(
                                                            "reference.detail.optional",
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
                                <span>{t("reference.detail.noArgs")}</span>
                            </div>
                        )}
                    </section>

                    <section className="api-section">
                        <h2>
                            <RotateCcw size={20} />{" "}
                            {t("reference.detail.return")}
                        </h2>
                        <div className="return-card">
                            <code>{entry.returns.type}</code>
                            <p>{inlineCode(entry.returns.description)}</p>
                        </div>
                    </section>

                    <section className="api-section">
                        <h2>{t("reference.detail.example")}</h2>
                        <pre className="example-block">
                            <code>{entry.example}</code>
                        </pre>
                        <p className="example-caption">
                            {t("reference.detail.exampleCaption")}
                        </p>
                    </section>

                    {(entry.sideEffects.length > 0 ||
                        entry.notes.length > 0) && (
                        <section className="api-section behavior-section">
                            <h2>
                                <AlertTriangle size={20} />{" "}
                                {t("reference.detail.behavior")}
                            </h2>
                            {entry.sideEffects.length > 0 && (
                                <div className="behavior-group">
                                    <span>{t("reference.detail.effects")}</span>
                                    <ul>
                                        {entry.sideEffects.map((effect) => (
                                            <li key={effect}>{effect}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {entry.notes.length > 0 && (
                                <div className="behavior-group warning">
                                    <span>{t("reference.detail.notes")}</span>
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

                    <section className="source-section">
                        <div>
                            <span>{t("reference.detail.source")}</span>
                            <code>{entry.sourcePath}</code>
                        </div>
                        {sourceHref && (
                            <a
                                href={sourceHref}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {t("reference.detail.viewSource")}{" "}
                                <ExternalLink size={15} />
                            </a>
                        )}
                    </section>

                    {(systemGuide || guide) && (
                        <section className="guide-cta">
                            <span className="guide-cta-icon">
                                <BookOpen size={22} />
                            </span>
                            <div>
                                <span>{t("reference.detail.continue")}</span>
                                <strong>
                                    {systemGuide?.title ?? guide?.title}
                                </strong>
                                <p>
                                    {systemGuide?.description ??
                                        guide?.description}
                                </p>
                            </div>
                            <Link
                                className="button tonal"
                                href={
                                    systemGuide
                                        ? `${routePrefix}/systems/${systemGuide.slug}`
                                        : `${routePrefix}/guides/${guide?.slug}`
                                }
                            >
                                {t("reference.detail.openManual")}{" "}
                                <ArrowRight size={17} />
                            </Link>
                        </section>
                    )}
                </article>

                <aside className="api-aside">
                    <div className="aside-card">
                        <span>{t("reference.detail.related")}</span>
                        {related.map((item) => (
                            <Link
                                href={`${routePrefix}/reference/${item.slug}`}
                                key={item.slug}
                            >
                                <code>{item.name}</code>
                                <ArrowRight size={15} />
                            </Link>
                        ))}
                    </div>
                    <Link className="aside-category" href={categoryHref}>
                        {t("reference.detail.viewSection")}{" "}
                        <strong>{categoryTitle}</strong>
                        <ArrowRight size={15} />
                    </Link>
                </aside>
            </div>

            <nav
                className="api-pagination"
                aria-label="Referência anterior e próxima"
            >
                {previous ? (
                    <Link href={`${routePrefix}/reference/${previous.slug}`}>
                        <ArrowLeft size={17} />
                        <span>
                            <small>{t("reference.detail.previous")}</small>
                            <code>{previous.name}</code>
                        </span>
                    </Link>
                ) : (
                    <span />
                )}
                {next ? (
                    <Link
                        className="next"
                        href={`${routePrefix}/reference/${next.slug}`}
                    >
                        <span>
                            <small>{t("reference.detail.next")}</small>
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
