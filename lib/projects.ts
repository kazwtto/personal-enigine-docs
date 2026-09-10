import fs from "fs";
import path from "path";

import { getMessages, type MessageKey } from "@/i18n/messages";
import { defaultLocale, type Locale } from "@/i18n/config";

const DOCUMENTATION_ROOT = path.join(process.cwd(), "documentation");

export type ProjectQuickTopic = {
    icon: string;
    labelKey: string;
    href: string;
};

export type ProjectHomeTopic = {
    icon: string;
    tone: string;
    titleKey: string;
    descriptionKey: string;
    href: string;
};

export type ProjectHomePathStep = {
    titleKey: string;
    descriptionKey: string;
    href: string;
};

export type ProjectStats = {
    objects?: number;
    commands?: number;
};

export type ProjectMeta = {
    slug: string;
    title: string;
    subtitle: string;
    order: number;
    locales: Locale[];
    githubUrl?: string;
    branch?: string;
    source?: { name: string; url: string };
    stats?: ProjectStats;
    quickTopics?: ProjectQuickTopic[];
    homeTopics?: ProjectHomeTopic[];
    homePath?: ProjectHomePathStep[];
};

export type ProjectAliases = {
    guides: Record<string, string>;
    systems: Record<string, string>;
};

export type GuideMetadata = {
    eyebrow?: string;
    description?: string;
};

export type ProjectMetadata = {
    guides: Record<string, GuideMetadata>;
    systems: Record<string, GuideMetadata>;
    categoryDescriptions: Record<string, string>;
};

const emptyProjectMetadata: ProjectMetadata = {
    guides: {},
    systems: {},
    categoryDescriptions: {},
};

const emptyAliases: ProjectAliases = {
    guides: {},
    systems: {},
};

const fileCache = new Map<string, { mtimeMs: number; data: unknown }>();
const dirCache = new Map<string, { mtimeMs: number; files: string[] }>();

function readJson<T>(filePath: string, fallback: T): T {
    let stat: fs.Stats;
    try {
        stat = fs.statSync(filePath);
    } catch {
        return fallback;
    }
    const hit = fileCache.get(filePath);
    if (hit && hit.mtimeMs === stat.mtimeMs) return hit.data as T;
    let data: T;
    try {
        data = JSON.parse(
            fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, ""),
        ) as T;
    } catch {
        return fallback;
    }
    fileCache.set(filePath, { mtimeMs: stat.mtimeMs, data });
    return data;
}

function listDirectory(dir: string): string[] {
    let stat: fs.Stats;
    try {
        stat = fs.statSync(dir);
    } catch {
        return [];
    }
    const hit = dirCache.get(dir);
    if (hit && hit.mtimeMs === stat.mtimeMs) return hit.files;
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    dirCache.set(dir, { mtimeMs: stat.mtimeMs, files });
    return files;
}

export function getProjectRoot(project: string) {
    return path.join(DOCUMENTATION_ROOT, project);
}

export function humanizeSlug(slug: string) {
    return slug
        .split(/[-_]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function discoverProjects(): ProjectMeta[] {
    if (!fs.existsSync(DOCUMENTATION_ROOT)) return [];
    return fs
        .readdirSync(DOCUMENTATION_ROOT, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => {
            const slug = entry.name;
            const metaPath = path.join(
                DOCUMENTATION_ROOT,
                slug,
                "documentation.json",
            );
            const raw = readJson<Partial<ProjectMeta>>(metaPath, {});
            return {
                slug,
                title: raw.title ?? humanizeSlug(slug),
                subtitle: raw.subtitle ?? "",
                order: raw.order ?? 0,
                locales: (raw.locales as Locale[] | undefined) ?? [
                    "pt-BR",
                    "en-US",
                    "es-ES",
                ],
                githubUrl: raw.githubUrl,
                branch: raw.branch,
                source: raw.source,
                stats: raw.stats,
                quickTopics: raw.quickTopics,
                homeTopics: raw.homeTopics,
                homePath: raw.homePath,
            } satisfies ProjectMeta;
        })
        .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export function getProjectMeta(project: string): ProjectMeta | null {
    return discoverProjects().find((entry) => entry.slug === project) ?? null;
}

export function getProjectAliases(project: string): ProjectAliases {
    return readJson(
        path.join(getProjectRoot(project), "aliases.json"),
        emptyAliases,
    );
}

export function getProjectMetadata(
    project: string,
    locale: Locale,
): ProjectMetadata {
    return readJson(
        path.join(getProjectRoot(project), locale, "metadata.json"),
        emptyProjectMetadata,
    );
}

export function getProjectCopy(
    project: string,
    locale: Locale,
): Record<string, string> {
    const shell = getMessages(locale) as unknown as Record<string, string>;
    const override = readJson<Record<string, string>>(
        path.join(getProjectRoot(project), locale, "messages.json"),
        {},
    );
    return { ...shell, ...override };
}

export function getProjectCopyKey(
    project: string,
    locale: Locale,
    key: string,
): string {
    return (
        getProjectCopy(project, locale)[key] ??
        getMessages(locale)[key as MessageKey] ??
        key
    );
}

export function listGuides(project: string, locale: Locale): string[] {
    const dir = path.join(getProjectRoot(project), locale, "guides");
    return listDirectory(dir)
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.replace(/\.md$/, ""));
}

export function listSystems(project: string, locale: Locale): string[] {
    const dir = path.join(getProjectRoot(project), locale, "systems");
    return listDirectory(dir)
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.replace(/\.md$/, ""));
}

export function listComplements(project: string, locale: Locale): string[] {
    const dir = path.join(getProjectRoot(project), locale, "complements");
    return listDirectory(dir);
}

export function getProjectGuideSlugs(project: string): string[] {
    const meta = getProjectMeta(project);
    if (!meta) return [];
    const slugs = new Set<string>();
    for (const locale of meta.locales) {
        for (const slug of listGuides(project, locale)) slugs.add(slug);
    }
    return [...slugs];
}

export function getProjectSystemSlugs(project: string): string[] {
    const meta = getProjectMeta(project);
    if (!meta) return [];
    const slugs = new Set<string>();
    for (const locale of meta.locales) {
        for (const slug of listSystems(project, locale)) slugs.add(slug);
    }
    return [...slugs];
}

export function getProjectComplementSlugs(project: string): string[] {
    const meta = getProjectMeta(project);
    if (!meta) return [];
    const slugs = new Set<string>();
    for (const locale of meta.locales) {
        for (const slug of listComplements(project, locale)) slugs.add(slug);
    }
    return [...slugs];
}

export function getProjectCanonicalLocale(project: string): Locale {
    const meta = getProjectMeta(project);
    const locales = meta?.locales ?? [];
    if (locales.includes("en-US")) return "en-US";
    if (locales.length > 0) return locales[0];
    return defaultLocale;
}
