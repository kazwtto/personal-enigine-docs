import { marked } from "marked";

import { getContentPack } from "@/i18n/content";
import type { Locale } from "@/i18n/config";
import { getProjectAliases, getProjectCanonicalLocale } from "@/lib/projects";

export type Heading = {
    depth: number;
    title: string;
    id: string;
};

export type Guide = {
    slug: string;
    title: string;
    eyebrow: string;
    description: string;
    readingTime: number;
    markdown: string;
    headings: Heading[];
};

export type ComplementGuide = {
    id: string;
    title: string;
    markdown: string;
    headings: Heading[];
    readingTime: number;
};

export type Complement = {
    slug: string;
    title: string;
    description: string;
    sourceUrl?: string;
    guides: ComplementGuide[];
    hasApi: boolean;
};

export type ReferenceEntry = {
    slug: string;
    name: string;
    signature: string;
    description: string;
    summary: string;
    purpose: string;
    whenToUse: string;
    category: string;
    subcategory: string;
    kind: "função" | "método" | "construtor";
    guideSlug: string;
    parameters: Array<{
        name: string;
        type: string;
        required: boolean;
        defaultValue: string | null;
        description: string;
    }>;
    returns: { type: string; description: string };
    sideEffects: string[];
    notes: string[];
    example: string;
    sourcePath: string;
};

export type ReferenceEntrySummary = Pick<
    ReferenceEntry,
    "slug" | "name" | "signature" | "description" | "category" | "subcategory"
>;

export type ReferenceCategory = {
    slug: string;
    title: string;
    sourceTitle: string;
    description: string;
    count: number;
    subcategories: string[];
};

export type SearchItem = {
    title: string;
    subtitle: string;
    href: string;
    type: "Guia" | "Seção" | "API";
    keywords: string;
    parameters?: string[];
};

function stripInlineMarkdown(value: string) {
    return value
        .replace(/<[^>]+>/g, "")
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[`*_~]/g, "")
        .trim();
}

export function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function extractHeadings(markdown: string) {
    const seenIds = new Set<string>();
    let inFence = false;
    return markdown
        .split("\n")
        .map((line) => {
            if (line.startsWith("```")) {
                inFence = !inFence;
                return null;
            }
            if (inFence) return null;
            return line.match(/^(#{1,4})\s+(.+)$/);
        })
        .filter((match): match is RegExpMatchArray => Boolean(match))
        .map((match) => {
            const raw = match[2];
            const explicitAnchor = raw.match(/\s*\{#([\w-]+)\}\s*$/);
            const title = stripInlineMarkdown(
                explicitAnchor ? raw.slice(0, explicitAnchor.index) : raw,
            );
            let base = explicitAnchor
                ? explicitAnchor[1]
                : slugify(title.replace(/^[0-9]+[\.\-\)]\s*/, ""));

            if (seenIds.has(base)) {
                let counter = 1;
                while (seenIds.has(`${base}-${counter}`)) counter++;
                base = `${base}-${counter}`;
            }
            seenIds.add(base);

            return {
                depth: match[1].length,
                title,
                id: base,
            };
        });
}

function firstParagraph(markdown: string) {
    const withoutTitle = markdown.replace(/^#\s+.+$/m, "");
    const paragraph = withoutTitle
        .split(/\n\s*\n/)
        .map((part) => part.replace(/\n/g, " ").trim())
        .find((part) => part && !/^(#|```|\||-|>|\d+\.)/.test(part));

    return stripInlineMarkdown(
        paragraph ?? "Guia prático da Undertale Engine.",
    );
}

const categoryRouteNames: Record<string, string> = {
    "Padrões de bala": "Bullet Patterns",
    Inimigos: "Enemies",
    "Vida e dano": "Health & Damage",
    "Itens e inventários": "Items & Inventories",
    Batalha: "Battle",
    Encontros: "Encounters",
    Jogador: "Player",
    "Diálogos e texto": "Dialogues & Text",
    Localização: "Localization",
    "Saves e dados": "Saves & Data",
    Áudio: "Audio",
    Entrada: "Input",
    Animações: "Animations",
    "Câmera e tela": "Camera & Screen",
    "Efeitos visuais": "Visual Effects",
    "Estruturas e gerenciadores": "Structures & Managers",
    "Demos e replay": "Demos & Replay",
    Utilitários: "Utilities",
};

export function getReferenceCategoryTitle(category: string) {
    return category;
}

export function getReferenceCategorySlug(category: string) {
    return slugify(categoryRouteNames[category] ?? category);
}

export type ContentResult = {
    guides: Guide[];
    guideBySlug: Map<string, Guide>;
    systemGuides: Guide[];
    systemGuideBySlug: Map<string, Guide>;
    complements: Complement[];
    complementBySlug: Map<string, Complement>;
    referenceEntries: ReferenceEntry[];
    referenceBySlug: Map<string, ReferenceEntry>;
    referenceCategories: string[];
    referenceCategoryDetails: ReferenceCategory[];
    referenceCategoryBySlug: Map<string, ReferenceCategory>;
    searchItems: SearchItem[];
};

const contentCache = new Map<string, ContentResult>();

export function getContent(project: string, locale: Locale): ContentResult {
    const cacheKey = `${project}:${locale}`;
    if (process.env.NODE_ENV === "production") {
        const cached = contentCache.get(cacheKey);
        if (cached) return cached;
    }

    const activeContent = getContentPack(project, locale);
    const canonicalContent = getContentPack(
        project,
        getProjectCanonicalLocale(project),
    );
    const aliases = getProjectAliases(project);
    const routePrefix = `/${project}`;

    const canonicalGuidesBySlug = new Map(
        Object.entries(canonicalContent.guides),
    );
    const guideDefinitions = Object.entries(activeContent.guides).map(
        ([slug, document]) => ({ slug, ...document }),
    );
    const guides: Guide[] = guideDefinitions.map((definition) => {
        const canonicalHeadings = extractHeadings(
            canonicalGuidesBySlug.get(definition.slug)?.markdown ?? "",
        );
        const headings = extractHeadings(definition.markdown).map(
            (heading, i) => ({
                ...heading,
                id: canonicalHeadings[i]?.id ?? heading.id,
            }),
        );
        const wordCount = stripInlineMarkdown(definition.markdown).split(
            /\s+/,
        ).length;

        return {
            ...definition,
            title: headings[0]?.title ?? "Guia",
            description:
                definition.description || firstParagraph(definition.markdown),
            readingTime: Math.max(2, Math.ceil(wordCount / 220)),
            headings,
        };
    });
    const guideBySlug = new Map(guides.map((guide) => [guide.slug, guide]));

    const canonicalSystemsBySlug = new Map(
        Object.entries(canonicalContent.systems),
    );
    const systemGuideDefinitions = Object.entries(activeContent.systems).map(
        ([slug, document]) => ({ slug, ...document }),
    );
    const systemGuides: Guide[] = systemGuideDefinitions.map((definition) => {
        const canonicalHeadings = extractHeadings(
            canonicalSystemsBySlug.get(definition.slug)?.markdown ?? "",
        );
        const headings = extractHeadings(definition.markdown).map(
            (heading, i) => ({
                ...heading,
                id: canonicalHeadings[i]?.id ?? heading.id,
            }),
        );
        const wordCount = stripInlineMarkdown(definition.markdown).split(
            /\s+/,
        ).length;
        return {
            ...definition,
            title: headings[0]?.title ?? "Sistema",
            readingTime: Math.max(2, Math.ceil(wordCount / 220)),
            headings,
        };
    });
    const systemGuideBySlug = new Map(
        systemGuides.map((guide) => [guide.slug, guide]),
    );

    const complements: Complement[] = Object.entries(
        activeContent.complements,
    ).map(([slug, data]) => {
        const canonicalData = canonicalContent.complements[slug];
        const complementGuides: ComplementGuide[] = Object.entries(
            data.guides,
        ).map(([guideId, markdown]) => {
            const canonicalHeadings = canonicalData
                ? extractHeadings(canonicalData.guides[guideId] || "")
                : [];
            const headings = extractHeadings(markdown).map((heading, i) => ({
                ...heading,
                id: canonicalHeadings[i]?.id ?? heading.id,
            }));
            const wordCount = stripInlineMarkdown(markdown).split(/\s+/).length;
            return {
                id: guideId,
                title: headings[0]?.title ?? guideId,
                markdown,
                headings,
                readingTime: Math.max(2, Math.ceil(wordCount / 220)),
            };
        });

        // Check if the global apiReference has entries for this complement
        const hasApi = (activeContent.apiReference as ApiData).entries.some(
            (e) => e.guideSlug === slug,
        );

        return {
            slug,
            title: data.title,
            description: data.description,
            sourceUrl: data.sourceUrl,
            guides: complementGuides,
            hasApi,
        };
    });
    const complementBySlug = new Map(
        complements.map((comp) => [comp.slug, comp]),
    );

    type ApiData = { entries: Omit<ReferenceEntry, "description">[] };
    const referenceEntries: ReferenceEntry[] = (
        activeContent.apiReference as ApiData
    ).entries.map((entry) => ({
        ...entry,
        guideSlug: aliases.guides[entry.guideSlug] ?? entry.guideSlug,
        description: entry.summary,
    }));
    const referenceBySlug = new Map(
        referenceEntries.map((entry) => [entry.slug, entry]),
    );
    const referenceCategories = [
        ...new Set(referenceEntries.map((entry) => entry.category)),
    ];
    const categoryDescriptions = activeContent.categoryDescriptions;

    const referenceCategoryDetails: ReferenceCategory[] =
        referenceCategories.map((title) => {
            const entries = referenceEntries.filter(
                (entry) => entry.category === title,
            );
            return {
                slug: getReferenceCategorySlug(title),
                title,
                sourceTitle: title,
                description:
                    categoryDescriptions[title] ??
                    `Chamadas relacionadas a ${title.toLowerCase()}.`,
                count: entries.length,
                subcategories: [
                    ...new Set(entries.map((entry) => entry.subcategory)),
                ],
            };
        });
    const referenceCategoryBySlug = new Map(
        referenceCategoryDetails.map((category) => [category.slug, category]),
    );

    const searchItems: SearchItem[] = [
        ...guides.map((guide) => ({
            title: guide.title,
            subtitle: guide.description,
            href: `${routePrefix}/guides/${guide.slug}`,
            type: "Guia" as const,
            keywords: `${guide.eyebrow} ${guide.markdown.slice(0, 4000)}`,
        })),
        ...guides.flatMap((guide) =>
            guide.headings
                .filter((heading) => heading.depth > 1)
                .map((heading) => ({
                    title: heading.title,
                    subtitle: guide.title,
                    href: `${routePrefix}/guides/${guide.slug}#${heading.id}`,
                    type: "Seção" as const,
                    keywords: `${guide.eyebrow} ${guide.title}`,
                })),
        ),
        ...systemGuides.map((guide) => ({
            title: guide.title,
            subtitle: guide.description,
            href: `${routePrefix}/systems/${guide.slug}`,
            type: "Guia" as const,
            keywords: `${guide.eyebrow} ${guide.markdown}`,
        })),
        ...systemGuides.flatMap((guide) =>
            guide.headings
                .filter((heading) => heading.depth > 1)
                .map((heading) => ({
                    title: heading.title,
                    subtitle: guide.title,
                    href: `${routePrefix}/systems/${guide.slug}#${heading.id}`,
                    type: "Seção" as const,
                    keywords: `${guide.eyebrow} ${guide.title}`,
                })),
        ),
        ...complements.flatMap((comp) =>
            comp.guides.map((guide) => ({
                title: guide.title,
                subtitle: comp.description,
                href: `${routePrefix}/complements/${comp.slug}/${guide.id}`,
                type: "Guia" as const,
                keywords: `${comp.title} ${guide.markdown}`,
            })),
        ),
        ...complements.flatMap((comp) =>
            comp.guides.flatMap((guide) =>
                guide.headings
                    .filter((heading) => heading.depth > 1)
                    .map((heading) => ({
                        title: heading.title,
                        subtitle: guide.title,
                        href: `${routePrefix}/complements/${comp.slug}/${guide.id}#${heading.id}`,
                        type: "Seção" as const,
                        keywords: `${comp.title} ${guide.title}`,
                    })),
            ),
        ),
        ...referenceEntries.map((entry) => ({
            title: entry.name,
            subtitle: entry.description,
            href: `${routePrefix}/reference/${entry.slug}`,
            type: "API" as const,
            keywords: `${entry.signature} ${entry.category} ${entry.subcategory} ${entry.purpose} ${entry.whenToUse}`,
            parameters: entry.parameters.map((parameter) => parameter.name),
        })),
    ];

    const result = {
        guides,
        guideBySlug,
        systemGuides,
        systemGuideBySlug,
        complements,
        complementBySlug,
        referenceEntries,
        referenceBySlug,
        referenceCategories,
        referenceCategoryDetails,
        referenceCategoryBySlug,
        searchItems,
    };

    if (process.env.NODE_ENV === "production")
        contentCache.set(cacheKey, result);
    return result;
}

export function renderMarkdown(
    markdown: string,
    t?: (key: string) => string,
    headings?: Heading[],
    references?: Map<string, string>,
) {
    const headingIds = headings ?? extractHeadings(markdown);
    let headingIndex = 0;
    let inFence = false;

    const withAnchors = markdown
        .split("\n")
        .map((line) => {
            if (line.startsWith("```")) {
                inFence = !inFence;
                return line;
            }
            if (inFence) return line;

            const match = line.match(/^(#{1,4})\s+(.+)$/);
            if (!match) return line;
            const heading = headingIds[headingIndex++];
            const depth = match[1].length;
            const label = marked.parseInline(match[2], {
                async: false,
            }) as string;
            return `<h${depth} id="${heading.id}">${label}<a class="heading-anchor" href="#${heading.id}" aria-label="Link para ${heading.title}">#</a></h${depth}>`;
        })
        .join("\n");

    let html = marked.parse(withAnchors, { async: false, gfm: true }) as string;
    html = html.replace(
        /<a href="(https?:\/\/[^\"]+)"/g,
        '<a href="$1" target="_blank" rel="noreferrer"',
    );

    const warningLabel = t ? t("ui.warning") : "Atenção";
    const noteLabel = t ? t("ui.note") : "Nota";
    const tipLabel = t ? t("ui.tip") : "Dica";
    const importantLabel = t ? t("ui.important") : "Importante";
    const cautionLabel = t ? t("ui.caution") : "Cuidado";

    html = html
        .replace(
            /<blockquote>\s*<p>\[!WARNING\]/gi,
            `<blockquote class="admonition warning"><p><strong>${warningLabel}</strong>`,
        )
        .replace(
            /<blockquote>\s*<p>\[!NOTE\]/gi,
            `<blockquote class="admonition note"><p><strong>${noteLabel}</strong>`,
        )
        .replace(
            /<blockquote>\s*<p>\[!TIP\]/gi,
            `<blockquote class="admonition tip"><p><strong>${tipLabel}</strong>`,
        )
        .replace(
            /<blockquote>\s*<p>\[!IMPORTANT\]/gi,
            `<blockquote class="admonition important"><p><strong>${importantLabel}</strong>`,
        )
        .replace(
            /<blockquote>\s*<p>\[!CAUTION\]/gi,
            `<blockquote class="admonition caution"><p><strong>${cautionLabel}</strong>`,
        );

    if (references) {
        html = html.replace(/<code>([^<]+)<\/code>/g, (match, content) => {
            const name = content.trim().replace(/\s*\(.*\)?\s*$/, "");
            const href = references.get(name);
            return href
                ? `<code><a class="ref-link" href="${href}">${content}</a></code>`
                : match;
        });
    }
    return html;
}

export function parseParameters(signature: string) {
    const start = signature.indexOf("(");
    const end = signature.lastIndexOf(")");
    if (start < 0 || end <= start + 1) return [];

    return signature
        .slice(start + 1, end)
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
            const [name, fallback] = part
                .split("=")
                .map((value) => value.trim());
            return { name, fallback };
        });
}
