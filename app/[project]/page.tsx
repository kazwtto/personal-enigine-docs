import {
    ArrowRight,
    BookOpenCheck,
    Braces,
    CheckCircle2,
    Code2,
    Route,
    Search,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getContent } from "@/lib/content";
import { getProjectCopy, getProjectMeta } from "@/lib/projects";
import { getServerI18n } from "@/i18n/server";

import { ProjectIcon } from "@/app/components/projectIcons";

type ProjectHomeProps = { params: Promise<{ project: string }> };

export default async function ProjectHome({ params }: ProjectHomeProps) {
    const { project } = await params;
    const { locale } = await getServerI18n();

    const meta = getProjectMeta(project);
    if (!meta) notFound();

    const { guides, referenceEntries } = getContent(project, locale);
    const copy = getProjectCopy(project, locale);
    const tr = (key: string) => copy[key] ?? key;
    const routePrefix = `/${project}`;

    const mainTopics = (meta.homeTopics ?? []).map((topic) => ({
        icon: topic.icon,
        title: tr(topic.titleKey),
        description: tr(topic.descriptionKey),
        href: `${routePrefix}${topic.href}`,
        tone: topic.tone,
    }));

    const path = (meta.homePath ?? []).map(
        (step, index) =>
            [
                String(index + 1).padStart(2, "0"),
                tr(step.titleKey),
                tr(step.descriptionKey),
                `${routePrefix}${step.href}`,
            ] as const,
    );

    const startHref = meta.homePath?.[0]
        ? `${routePrefix}${meta.homePath[0].href}`
        : guides.length > 0
          ? `${routePrefix}/guides/${guides[0].slug}`
          : routePrefix;

    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="hero-copy">
                    <span className="eyebrow">
                        <span className="status-dot" />{" "}
                        {tr("home.hero.eyebrow")}
                    </span>
                    <h1>{tr("home.hero.title")}</h1>
                    <p>{tr("home.hero.description")}</p>
                    <div className="hero-actions">
                        <Link className="button filled" href={startHref}>
                            {tr("home.hero.start")} <ArrowRight size={18} />
                        </Link>
                        <Link
                            className="button tonal"
                            href={`${routePrefix}/reference`}
                        >
                            <Code2 size={18} /> {tr("home.hero.explore")}
                        </Link>
                    </div>
                    <div className="hero-proof" style={{ display: "none" }}>
                        <span>
                            <CheckCircle2 size={16} />{" "}
                            {tr("home.hero.proof.examples")}
                        </span>
                        <span>
                            <CheckCircle2 size={16} />{" "}
                            {tr("home.hero.proof.search")}
                        </span>
                        <span>
                            <CheckCircle2 size={16} />{" "}
                            {tr("home.hero.proof.checked")}
                        </span>
                    </div>
                </div>
                <div className="hero-visual" aria-hidden="true">
                    <div className="visual-orbit orbit-one" />
                    <div className="visual-orbit orbit-two" />
                    <div className="visual-card code-card">
                        <Braces size={28} />
                        <span>Battle_SetEnemy</span>
                        <small>inimigo · slot</small>
                    </div>
                    <div className="visual-card search-card">
                        <Search size={22} />
                        <span>{tr("home.visual.search")}</span>
                        <kbd>Ctrl K</kbd>
                    </div>
                    <div className="visual-card route-card">
                        <Route size={25} />
                        <span>{tr("home.visual.route")}</span>
                    </div>
                </div>
            </section>

            <section
                className="stats-strip"
                aria-label="Cobertura da documentação"
            >
                <div>
                    <strong>{guides.length}</strong>
                    <span>{tr("home.stats.guides")}</span>
                </div>
                <div>
                    <strong>{referenceEntries.length}</strong>
                    <span>{tr("home.stats.functions")}</span>
                </div>
                {meta.stats?.objects !== undefined && (
                    <div>
                        <strong>{meta.stats.objects}</strong>
                        <span>{tr("home.stats.objects")}</span>
                    </div>
                )}
                {meta.stats?.commands !== undefined && (
                    <div>
                        <strong>{meta.stats.commands}</strong>
                        <span>{tr("home.stats.commands")}</span>
                    </div>
                )}
            </section>

            {mainTopics.length > 0 && (
                <section className="home-section">
                    <div className="section-heading">
                        <div>
                            <span className="eyebrow">
                                {tr("home.topics.eyebrow")}
                            </span>
                            <h2>{tr("home.topics.title")}</h2>
                        </div>
                        <p>{tr("home.topics.description")}</p>
                    </div>
                    <div className="topic-grid">
                        {mainTopics.map(
                            ({ icon, title, description, href, tone }) => (
                                <Link
                                    className={`topic-card ${tone}`}
                                    href={href}
                                    key={href}
                                >
                                    <span className="topic-icon">
                                        <ProjectIcon name={icon} size={26} />
                                    </span>
                                    <h3>{title}</h3>
                                    <p>{description}</p>
                                    <span className="topic-link">
                                        {tr("home.topics.open")}{" "}
                                        <ArrowRight size={17} />
                                    </span>
                                </Link>
                            ),
                        )}
                    </div>
                </section>
            )}

            {path.length > 0 && (
                <section className="home-section learning-section">
                    <div className="section-heading">
                        <div>
                            <span className="eyebrow">
                                {tr("home.path.eyebrow")}
                            </span>
                            <h2>{tr("home.path.title")}</h2>
                        </div>
                        <p>{tr("home.path.description")}</p>
                    </div>
                    <div className="learning-path">
                        {path.map(([number, title, description, href]) => (
                            <Link
                                className="path-step"
                                href={href}
                                key={number}
                            >
                                <span className="step-number">{number}</span>
                                <span className="step-copy">
                                    <strong>{title}</strong>
                                    <small>{description}</small>
                                </span>
                                <ArrowRight size={18} />
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className="home-section resource-panel">
                <div>
                    <span className="resource-icon">
                        <BookOpenCheck size={28} />
                    </span>
                    <span className="eyebrow">
                        {tr("home.resource.eyebrow")}
                    </span>
                    <h2>{tr("home.resource.title")}</h2>
                    <p>{tr("home.resource.description")}</p>
                </div>
                <Link
                    className="button filled"
                    href={`${routePrefix}/reference`}
                >
                    {tr("home.resource.viewAll")} <ArrowRight size={18} />
                </Link>
            </section>
        </div>
    );
}
