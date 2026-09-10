import { Clock3 } from "lucide-react";
import type { Guide } from "@/lib/content";
import { getContent, renderMarkdown } from "@/lib/content";
import { getServerI18n } from "@/i18n/server";

export async function MarkdownArticle({
    guide,
    project,
}: {
    guide: Guide;
    project: string;
}) {
    const { t, locale } = await getServerI18n();
    const { referenceBySlug } = getContent(project, locale);
    const references = new Map(
        [...referenceBySlug].map(([slug, entry]) => [
            entry.name,
            `/${project}/reference/${slug}`,
        ]),
    );
    const toc = guide.headings.filter(
        (heading) => heading.depth === 2 || heading.depth === 3,
    );

    return (
        <div className="article-layout">
            <article className="article-card">
                <div className="article-kicker">
                    <span>{guide.eyebrow}</span>
                    <span>
                        <Clock3 size={15} /> {guide.readingTime}{" "}
                        {t("article.readingTime")}
                    </span>
                </div>
                <div
                    className="markdown-body"
                    dangerouslySetInnerHTML={{
                        __html: renderMarkdown(
                            guide.markdown,
                            t as (key: string) => string,
                            guide.headings,
                            references,
                        ),
                    }}
                />
            </article>
            <aside className="article-toc" aria-label={t("article.onThisPage")}>
                <span>{t("article.onThisPage")}</span>
                <nav>
                    {toc.map((heading) => (
                        <a
                            className={heading.depth === 3 ? "toc-child" : ""}
                            href={`#${heading.id}`}
                            key={heading.id}
                        >
                            {heading.title}
                        </a>
                    ))}
                </nav>
            </aside>
        </div>
    );
}
