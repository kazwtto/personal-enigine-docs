import fs from "fs";
import path from "path";

import apiReferencePtBR from "@/documentation/undertale-engine/pt-BR/api-reference.json";
import { defaultLocale, type Locale } from "./config";
import {
    getProjectMetadata,
    getProjectRoot,
    listGuides,
    listSystems,
} from "@/lib/projects";

const fileCache = new Map<string, { mtimeMs: number; data: string }>();

function readFileCached(filePath: string): string {
    let stat: fs.Stats;
    try {
        stat = fs.statSync(filePath);
    } catch {
        return "";
    }
    const hit = fileCache.get(filePath);
    if (hit && hit.mtimeMs === stat.mtimeMs) return hit.data;
    let data: string;
    try {
        data = fs
            .readFileSync(filePath, "utf-8")
            .replace(/^\uFEFF/, "")
            .replace(/\r\n/g, "\n");
    } catch {
        return "";
    }
    fileCache.set(filePath, { mtimeMs: stat.mtimeMs, data });
    return data;
}

const readMd = (filePath: string) => readFileCached(filePath);

const readJson = <T>(filePath: string, fallback: T): T => {
    const raw = readFileCached(filePath);
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
};

export type LocalizedDocument = {
    eyebrow: string;
    description: string;
    markdown: string;
};

export type LocalizedComplement = {
    title: string;
    description: string;
    guides: Record<string, string>;
    sourceUrl?: string;
};

export type ApiReferenceData = typeof apiReferencePtBR;
export type ApiReferenceSourceEntry = ApiReferenceData["entries"][number];

export type LocaleContentPack = {
    locale: Locale;
    guides: Record<string, LocalizedDocument>;
    systems: Record<string, LocalizedDocument>;
    complements: Record<string, LocalizedComplement>;
    apiReference: ApiReferenceData;
    categoryDescriptions: Record<string, string>;
};

type ComplementConfig = {
    id: string;
    sourceUrl: string;
    apiReference?: string;
    guides: string[];
};

function orderedSlugs(metadataSlugs: string[], fileSlugs: string[]) {
    return [
        ...metadataSlugs,
        ...fileSlugs.filter((slug) => !metadataSlugs.includes(slug)),
    ];
}

function loadComplements(project: string, locale: Locale) {
    const root = getProjectRoot(project);
    const complementsConfig = readJson<ComplementConfig[]>(
        path.join(root, "complements.json"),
        [],
    );
    const complements: Record<string, LocalizedComplement> = {};
    const extraApiEntries: ApiReferenceSourceEntry[] = [];

    for (const comp of complementsConfig) {
        const compDir = path.join(root, locale, "complements", comp.id);
        const meta = readJson<{ title?: string; description?: string }>(
            path.join(compDir, "meta.json"),
            {},
        );
        const title = meta.title || comp.id;
        const description = meta.description || "";

        const guides: Record<string, string> = {};
        for (const g of comp.guides) {
            guides[g] = readMd(path.join(compDir, `${g}.md`));
        }

        if (comp.apiReference) {
            const apiJson = readJson<{ entries: ApiReferenceSourceEntry[] }>(
                path.join(compDir, comp.apiReference),
                { entries: [] },
            );
            extraApiEntries.push(...apiJson.entries);
        }

        complements[comp.id] = {
            title,
            description,
            guides,
            sourceUrl: comp.sourceUrl,
        };
    }

    return { complements, extraApiEntries };
}

const packCache = new Map<string, LocaleContentPack>();

export function getContentPack(
    project: string,
    locale: Locale = defaultLocale,
): LocaleContentPack {
    const cacheKey = `${project}:${locale}`;
    if (process.env.NODE_ENV === "production") {
        const cached = packCache.get(cacheKey);
        if (cached) return cached;
    }

    const root = getProjectRoot(project);
    const localeDir = path.join(root, locale);
    const metadata = getProjectMetadata(project, locale);

    const guides: Record<string, LocalizedDocument> = {};
    for (const slug of orderedSlugs(
        Object.keys(metadata.guides),
        listGuides(project, locale),
    )) {
        guides[slug] = {
            eyebrow: metadata.guides[slug]?.eyebrow ?? "",
            description: metadata.guides[slug]?.description ?? "",
            markdown: readMd(path.join(localeDir, "guides", `${slug}.md`)),
        };
    }

    const systems: Record<string, LocalizedDocument> = {};
    for (const slug of orderedSlugs(
        Object.keys(metadata.systems),
        listSystems(project, locale),
    )) {
        systems[slug] = {
            eyebrow: metadata.systems[slug]?.eyebrow ?? "",
            description: metadata.systems[slug]?.description ?? "",
            markdown: readMd(path.join(localeDir, "systems", `${slug}.md`)),
        };
    }

    const { complements, extraApiEntries } = loadComplements(project, locale);

    const baseApiReference = readJson<ApiReferenceData>(
        path.join(localeDir, "api-reference.json"),
        {
            locale,
            count: 0,
            entries: [],
        } as unknown as ApiReferenceData,
    );

    const apiReference: ApiReferenceData =
        extraApiEntries.length > 0
            ? {
                  ...baseApiReference,
                  count: baseApiReference.count + extraApiEntries.length,
                  entries: [...baseApiReference.entries, ...extraApiEntries],
              }
            : baseApiReference;

    const result: LocaleContentPack = {
        locale,
        guides,
        systems,
        complements,
        apiReference,
        categoryDescriptions: metadata.categoryDescriptions ?? {},
    };

    if (process.env.NODE_ENV === "production") packCache.set(cacheKey, result);
    return result;
}
