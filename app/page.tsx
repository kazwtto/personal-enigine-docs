import { ArrowRight, BookOpenCheck } from "lucide-react";
import Link from "next/link";

import { discoverProjects } from "@/lib/projects";

import { getServerI18n } from "@/i18n/server";

export default async function Home() {
    const { t } = await getServerI18n();
    const projects = discoverProjects();

    return (
        <div className="home-page portal-page">
            <section className="hero-section">
                <div className="hero-copy">
                    <span className="eyebrow">
                        <span className="status-dot" /> {t("portal.eyebrow")}
                    </span>
                    <h1>{t("portal.title")}</h1>
                    <p>{t("portal.description")}</p>
                </div>
            </section>

            <section className="home-section">
                <div className="topic-grid">
                    {projects.map((project) => (
                        <Link
                            className="topic-card blue"
                            href={`/${project.slug}`}
                            key={project.slug}
                        >
                            <span className="topic-icon">
                                <BookOpenCheck size={26} />
                            </span>
                            <h3>{project.title}</h3>
                            <p>{project.subtitle}</p>
                            <span className="topic-link">
                                {t("portal.open")} <ArrowRight size={17} />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
