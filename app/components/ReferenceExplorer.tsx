"use client";

import { ArrowUpRight, Code2, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { ReferenceEntrySummary } from "@/lib/content";
import { useI18n } from "@/i18n/client";

function getReferenceCategoryTitle(category: string) {
    return category;
}

function normalize(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

export function ReferenceExplorer({
    entries,
    categories,
    basePath = "/reference",
}: {
    entries: ReferenceEntrySummary[];
    categories: string[];
    basePath?: string;
}) {
    const { t } = useI18n();
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("Todas");

    const filtered = useMemo(() => {
        const needle = normalize(query.trim());
        return entries.filter((entry) => {
            const inCategory =
                category === "Todas" || entry.category === category;
            const haystack = normalize(
                `${entry.name} ${entry.signature} ${entry.description} ${entry.category}`,
            );
            return inCategory && (!needle || haystack.includes(needle));
        });
    }, [category, entries, query]);

    return (
        <section className="reference-explorer">
            <div className="reference-controls">
                <label className="reference-search">
                    <Search size={19} />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={t("reference.explorer.search")}
                    />
                </label>
                {categories.length > 0 && (
                    <div
                        className="filter-chips"
                        aria-label={t("reference.explorer.filterLabel")}
                    >
                        {["Todas", ...categories].map((item) => (
                            <button
                                className={category === item ? "selected" : ""}
                                key={item}
                                onClick={() => setCategory(item)}
                            >
                                {item === "Todas"
                                    ? t("reference.explorer.all")
                                    : getReferenceCategoryTitle(item)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="reference-summary">
                <strong>{filtered.length}</strong>{" "}
                {t("reference.explorer.results")}{" "}
                <span>
                    {t("reference.explorer.of")} {entries.length}{" "}
                    {t("reference.explorer.topics")}
                </span>
            </div>
            <div className="reference-grid">
                {filtered.map((entry) => (
                    <Link
                        className="reference-row"
                        href={`${basePath}/${entry.slug}`}
                        key={entry.slug}
                    >
                        <span className="reference-row-icon">
                            <Code2 size={18} />
                        </span>
                        <span className="reference-row-copy">
                            <code>{entry.name}</code>
                            <small>{entry.description}</small>
                        </span>
                        <span className="reference-row-meta">
                            <span>
                                {categories.length > 0
                                    ? getReferenceCategoryTitle(entry.category)
                                    : entry.subcategory}
                            </span>
                            <ArrowUpRight size={17} />
                        </span>
                    </Link>
                ))}
            </div>
            {!filtered.length && (
                <div className="reference-empty">
                    <Search size={30} />
                    <strong>{t("reference.explorer.empty.title")}</strong>
                    <span>{t("reference.explorer.empty.desc")}</span>
                </div>
            )}
        </section>
    );
}
