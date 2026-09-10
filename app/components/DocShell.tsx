"use client";

import {
    BookOpen as LucBookOpen,
    Boxes as LucBoxes,
    Check as LucCheck,
    ChevronRight as LucChevronRight,
    Code2 as LucCode2,
    Crosshair as LucCrosshair,
    ExternalLink as LucExternalLink,
    Languages as LucLanguages,
    Menu as LucMenu,
    Palette as LucPalette,
    HeartPulse as LucHeartPulse,
    Search as LucSearch,
    ShieldQuestion as LucShieldQuestion,
    Heart as LucHeart,
    Blocks as LucBlocks,
    X as LucX,
} from "lucide-react";
import {
    BookOpen as PxBookOpen,
    Check as PxCheck,
    ChevronRight as PxChevronRight,
    Code as PxCode,
    Close as PxClose,
    ColorsSwatch as PxColorsSwatch,
    ExternalLink as PxExternalLink,
    Heart as PxHeart,
    Languages as PxLanguages,
    Menu as PxMenu,
    Search as PxSearch,
    Shapes as PxShapes,
    Shield as PxShield,
    Target as PxTarget,
    Blocks as PxBlocks,
} from "pixelarticons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Guide, SearchItem, Complement } from "@/lib/content";
import type { ProjectMeta } from "@/lib/projects";
import { useI18n } from "@/i18n/client";
import { localeCatalog } from "@/i18n/config";
import type { MessageKey } from "@/i18n/locales/pt-BR/ui";
import { ArticleEnhancer } from "./ArticleEnhancer";
import { ProjectIcon } from "./projectIcons";
import { ReferenceLinkPreview } from "./ReferenceLinkPreview";

type ShellGuide = Pick<Guide, "slug" | "title" | "eyebrow">;

type DocShellProps = {
    children: React.ReactNode;
    project: string;
    meta: ProjectMeta;
    copy: Record<string, string>;
    guides: ShellGuide[];
    systemGuides: ShellGuide[];
    complements: Complement[];
    searchItems: SearchItem[];
    referenceCount: number;
};

type SiteTheme = "dark" | "light" | "pixel";
type CodeTheme = "dracula" | "material" | "github" | "nord";

const siteThemes: Array<{
    value: SiteTheme;
    labelKey: MessageKey;
    descriptionKey: MessageKey;
}> = [
    {
        value: "dark",
        labelKey: "theme.dark",
        descriptionKey: "theme.darkDescription",
    },
    {
        value: "light",
        labelKey: "theme.light",
        descriptionKey: "theme.lightDescription",
    },
    {
        value: "pixel",
        labelKey: "theme.pixel",
        descriptionKey: "theme.pixelDescription",
    },
];

const codeThemes: Array<{
    value: CodeTheme;
    label: string;
    descriptionKey: MessageKey;
}> = [
    {
        value: "dracula",
        label: "Dracula",
        descriptionKey: "codeTheme.draculaDescription",
    },
    {
        value: "material",
        label: "Material Dark",
        descriptionKey: "codeTheme.materialDescription",
    },
    {
        value: "github",
        label: "GitHub Light",
        descriptionKey: "codeTheme.githubDescription",
    },
    {
        value: "nord",
        label: "Nord",
        descriptionKey: "codeTheme.nordDescription",
    },
];

function normalize(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function NavLink({
    href,
    children,
    onClick,
    exact,
}: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    exact?: boolean;
}) {
    const pathname = usePathname();
    const active = exact
        ? pathname === href
        : href === "/"
          ? pathname === href
          : pathname.startsWith(href);

    return (
        <Link
            className={`nav-link${active ? " active" : ""}`}
            href={href}
            onClick={onClick}
        >
            {children}
        </Link>
    );
}

function Sidebar({
    project,
    meta,
    copy,
    guides,
    systemGuides,
    complements,
    referenceCount,
    close,
    theme,
}: {
    project: string;
    meta: ProjectMeta;
    copy: Record<string, string>;
    guides: ShellGuide[];
    systemGuides: ShellGuide[];
    complements: Complement[];
    referenceCount: number;
    close?: () => void;
    theme: SiteTheme;
}) {
    const { t } = useI18n();
    const tr = (key: string) => copy[key] ?? t(key as MessageKey) ?? key;
    const routePrefix = `/${project}`;
    const quickTopics = meta.quickTopics ?? [];
    const objectsGuide = guides.some(
        (guide) => guide.slug === "objects-events-enums-and-macros",
    );
    const P = theme === "pixel";
    const systemIcons = P
        ? [PxShield, PxTarget, PxHeart]
        : [LucShieldQuestion, LucCrosshair, LucHeartPulse];
    const BookOpenIc = P ? PxBookOpen : LucBookOpen;
    const BlocksIc = P ? PxBlocks : LucBlocks;
    const CodeIc = P ? PxCode : LucCode2;
    const BoxesIc = P ? PxShapes : LucBoxes;
    const ExternalLinkIc = P ? PxExternalLink : LucExternalLink;
    const HeartIc = P ? PxHeart : LucHeart;

    return (
        <div className="sidebar-inner">
            <Link
                className="brand"
                href={routePrefix}
                onClick={close}
                aria-label={t("brand.homeLabel")}
            >
                <span className="brand-mark" aria-hidden="true">
                    <HeartIc size={19} strokeWidth={2.4} />
                </span>
                <span>
                    <strong>{meta.title}</strong>
                    <small>
                        {meta.subtitle || tr("brand.subtitle")} ·{" "}
                        {tr("brand.unofficialNote")}
                    </small>
                </span>
            </Link>

            <nav className="sidebar-nav" aria-label={t("nav.label")}>
                {quickTopics.length > 0 && (
                    <div className="nav-section">
                        <span className="nav-label">{t("nav.essentials")}</span>
                        {quickTopics.map(({ icon, labelKey, href }) => (
                            <NavLink
                                href={`${routePrefix}${href}`}
                                key={href}
                                onClick={close}
                            >
                                <ProjectIcon name={icon} size={18} />{" "}
                                <span>{tr(labelKey)}</span>
                            </NavLink>
                        ))}
                    </div>
                )}

                {systemGuides.length > 0 && (
                    <div className="nav-section">
                        <span className="nav-label">
                            {t("nav.systemManuals")}
                        </span>
                        {systemGuides.map((guide, index) => {
                            const Icon = systemIcons[index] ?? Boxes;
                            return (
                                <NavLink
                                    href={`${routePrefix}/systems/${guide.slug}`}
                                    key={guide.slug}
                                    onClick={close}
                                >
                                    <Icon size={18} />
                                    <span>{guide.title}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                )}

                <div className="nav-section">
                    <span className="nav-label">{t("nav.guides")}</span>
                    {guides.map((guide) => (
                        <NavLink
                            href={`${routePrefix}/guides/${guide.slug}`}
                            key={guide.slug}
                            onClick={close}
                        >
                            <BookOpenIc size={17} /> <span>{guide.title}</span>
                        </NavLink>
                    ))}
                </div>

                {complements.length > 0 && (
                    <div className="nav-section">
                        <span className="nav-label">
                            {t("nav.complements" as MessageKey)}
                        </span>
                        {complements.map((comp) => (
                            <div key={comp.slug} className="nav-group">
                                <span
                                    className="nav-group-label"
                                    style={{
                                        padding: "0 0.75rem",
                                        fontSize: "0.85em",
                                        fontWeight: 600,
                                        color: "var(--text-muted)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        marginTop: "0.5rem",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    <BlocksIc size={14} /> {comp.title}
                                </span>
                                <div style={{ marginLeft: "0.5rem" }}>
                                    {comp.guides.map((g) => (
                                        <NavLink
                                            key={g.id}
                                            href={`${routePrefix}/complements/${comp.slug}/${g.id}`}
                                            exact
                                            onClick={close}
                                        >
                                            <BookOpenIc size={16} />{" "}
                                            <span>{g.title}</span>
                                        </NavLink>
                                    ))}
                                    {comp.hasApi && (
                                        <NavLink
                                            href={`${routePrefix}/complements/${comp.slug}/api`}
                                            exact
                                            onClick={close}
                                        >
                                            <CodeIc size={16} />{" "}
                                            <span>
                                                {t(
                                                    "complements.api" as MessageKey,
                                                )}
                                            </span>
                                        </NavLink>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="nav-section">
                    <span className="nav-label">{t("nav.reference")}</span>
                    <NavLink href={`${routePrefix}/reference`} onClick={close}>
                        <CodeIc size={18} /> <span>{t("nav.functions")}</span>
                        <span className="nav-count">{referenceCount}</span>
                    </NavLink>
                    {objectsGuide && (
                        <NavLink
                            href={`${routePrefix}/guides/objects-events-enums-and-macros`}
                            onClick={close}
                        >
                            <BoxesIc size={18} />{" "}
                            <span>{t("nav.objects")}</span>
                        </NavLink>
                    )}
                </div>
            </nav>

            {meta.source && (
                <a
                    className="sidebar-source"
                    href={meta.source.url}
                    target="_blank"
                    rel="noreferrer"
                >
                    <span>
                        {t("nav.original")}
                        <small>{meta.source.name}</small>
                    </span>
                    <ExternalLinkIc size={16} />
                </a>
            )}
        </div>
    );
}

function SearchDialog({
    items,
    open,
    onClose,
    theme,
}: {
    items: SearchItem[];
    open: boolean;
    onClose: () => void;
    theme: SiteTheme;
}) {
    const router = useRouter();
    const { locale, t } = useI18n();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(0);
    const P = theme === "pixel";
    const SearchIc = P ? PxSearch : LucSearch;
    const CloseIc = P ? PxClose : LucX;
    const CodeIc = P ? PxCode : LucCode2;
    const ChevronRightIc = P ? PxChevronRight : LucChevronRight;
    const BookOpenIc = P ? PxBookOpen : LucBookOpen;

    const results = useMemo(() => {
        const needle = normalize(query.trim());
        if (!needle)
            return items.filter((item) => item.type !== "Seção").slice(0, 8);

        return items
            .map((item) => {
                const title = normalize(item.title);
                const haystack = `${title} ${normalize(item.subtitle)} ${normalize(item.keywords)}`;
                let score = haystack.includes(needle) ? 1 : 0;
                if (title === needle) score += 8;
                else if (title.startsWith(needle)) score += 5;
                else if (title.includes(needle)) score += 3;
                for (const token of needle.split(/\s+/))
                    if (haystack.includes(token)) score += 0.25;
                return { item, score };
            })
            .filter((result) => result.score > 0)
            .sort(
                (a, b) =>
                    b.score - a.score ||
                    a.item.title.localeCompare(b.item.title, locale),
            )
            .slice(0, 12)
            .map((result) => result.item);
    }, [items, locale, query]);

    useEffect(() => {
        if (!open) return;
        const timeout = window.setTimeout(() => {
            setSelected(0);
            inputRef.current?.focus();
        }, 40);
        return () => window.clearTimeout(timeout);
    }, [open]);

    if (!open) return null;

    const navigate = (href: string) => {
        router.push(href);
        onClose();
        setQuery("");
    };

    return (
        <div
            className="search-scrim"
            role="presentation"
            onMouseDown={(event) =>
                event.target === event.currentTarget && onClose()
            }
        >
            <section
                className="search-dialog"
                role="dialog"
                aria-modal="true"
                aria-label={t("search.dialogLabel")}
            >
                <div className="search-input-row">
                    <SearchIc size={21} aria-hidden="true" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setSelected(0);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Escape") onClose();
                            if (event.key === "ArrowDown") {
                                event.preventDefault();
                                setSelected((value) =>
                                    Math.min(results.length - 1, value + 1),
                                );
                            }
                            if (event.key === "ArrowUp") {
                                event.preventDefault();
                                setSelected((value) => Math.max(0, value - 1));
                            }
                            if (event.key === "Enter" && results[selected])
                                navigate(results[selected].href);
                        }}
                        placeholder={t("search.placeholder")}
                        aria-label={t("search.inputLabel")}
                    />
                    <button
                        className="icon-button compact"
                        onClick={onClose}
                        aria-label={t("search.close")}
                    >
                        <CloseIc size={19} />
                    </button>
                </div>

                <div className="search-results" role="listbox">
                    {results.map((item, index) => (
                        <button
                            key={`${item.href}-${item.title}`}
                            className={`search-result${selected === index ? " selected" : ""}`}
                            onMouseEnter={() => setSelected(index)}
                            onClick={() => navigate(item.href)}
                            role="option"
                            aria-selected={selected === index}
                        >
                            <span
                                className={`result-icon type-${item.type.toLowerCase()}`}
                            >
                                {item.type === "API" ? (
                                    <CodeIc size={18} />
                                ) : item.type === "Seção" ? (
                                    <ChevronRightIc size={18} />
                                ) : (
                                    <BookOpenIc size={18} />
                                )}
                            </span>
                            <span className="result-copy">
                                <strong>{item.title}</strong>
                                <small>{item.subtitle}</small>
                            </span>
                            <span className="result-type">{item.type}</span>
                        </button>
                    ))}
                    {!results.length && (
                        <div className="empty-search">
                            <SearchIc size={28} />
                            <strong>{t("search.emptyTitle")}</strong>
                            <span>{t("search.emptyDescription")}</span>
                        </div>
                    )}
                </div>
                <footer className="search-footer">
                    <span>
                        <kbd>↑</kbd>
                        <kbd>↓</kbd> {t("search.navigate")}
                    </span>
                    <span>
                        <kbd>Enter</kbd> {t("search.open")}
                    </span>
                    <span>
                        <kbd>Esc</kbd> {t("search.closeShortcut")}
                    </span>
                </footer>
            </section>
        </div>
    );
}

export function DocShell({
    children,
    project,
    meta,
    copy,
    guides,
    systemGuides,
    complements,
    searchItems,
    referenceCount,
}: DocShellProps) {
    const pathname = usePathname();
    const { locale, setLocale, t } = useI18n();
    const tr = (key: string) => copy[key] ?? t(key as MessageKey) ?? key;
    const referenceLinks = useMemo(
        () =>
            new Map(
                searchItems
                    .filter((item) => item.type === "API")
                    .map((item) => [item.title, item.href]),
            ),
        [searchItems],
    );
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [appearanceOpen, setAppearanceOpen] = useState(false);
    const [languageOpen, setLanguageOpen] = useState(false);
    const [theme, setTheme] = useState<SiteTheme>("dark");
    const [codeTheme, setCodeTheme] = useState<CodeTheme>("dracula");
    const [mounted, setMounted] = useState(false);
    const appearanceRef = useRef<HTMLDivElement>(null);
    const languageRef = useRef<HTMLDivElement>(null);

    // The theme and code theme are set by the inline <head> script before React
    // hydrates; this effect syncs them into state once after mount (the dataset
    // is not available during SSR). Disabling the rule: this is a one-time
    // mount sync, not a cascading render pattern.
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        const current = document.documentElement.dataset.theme;
        if (current === "light" || current === "pixel") setTheme(current);
        const currentCode = document.documentElement.dataset.codeTheme;
        if (
            currentCode === "material" ||
            currentCode === "github" ||
            currentCode === "nord"
        )
            setCodeTheme(currentCode);
        setMounted(true);
    }, []);
    /* eslint-enable react-hooks/set-state-in-effect */

    useEffect(() => {
        if (!mounted) return;
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem("ue-docs-theme", theme);
    }, [theme, mounted]);

    useEffect(() => {
        if (!mounted) return;
        document.documentElement.dataset.codeTheme = codeTheme;
        window.localStorage.setItem("ue-docs-code-theme", codeTheme);
    }, [codeTheme, mounted]);

    useEffect(() => {
        const id = window.setTimeout(() => {
            setDrawerOpen(false);
            setSearchOpen(false);
            setAppearanceOpen(false);
            setLanguageOpen(false);
        }, 0);
        return () => window.clearTimeout(id);
    }, [pathname]);

    useEffect(() => {
        if (!appearanceOpen && !languageOpen) return;
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (
                appearanceOpen &&
                !appearanceRef.current?.contains(event.target as Node)
            )
                setAppearanceOpen(false);
            if (
                languageOpen &&
                !languageRef.current?.contains(event.target as Node)
            )
                setLanguageOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setAppearanceOpen(false);
                setLanguageOpen(false);
            }
        };
        document.addEventListener("mousedown", closeOnOutsideClick);
        window.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("mousedown", closeOnOutsideClick);
            window.removeEventListener("keydown", closeOnEscape);
        };
    }, [appearanceOpen, languageOpen]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const typing =
                target?.tagName === "INPUT" ||
                target?.tagName === "TEXTAREA" ||
                target?.isContentEditable;
            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {
                event.preventDefault();
                setSearchOpen(true);
            } else if (event.key === "/" && !typing) {
                event.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const selectSiteTheme = (next: SiteTheme) => {
        setTheme(next);
    };

    const selectCodeTheme = (next: CodeTheme) => {
        setCodeTheme(next);
    };

    const sidebarProps = {
        project,
        meta,
        copy,
        guides,
        systemGuides,
        complements,
        referenceCount,
        theme,
    };
    const P = theme === "pixel";
    const XIcon = P ? PxClose : LucX;
    const MenuIcon = P ? PxMenu : LucMenu;
    const SearchIcon = P ? PxSearch : LucSearch;
    const CodeIcon = P ? PxCode : LucCode2;
    const LanguagesIcon = P ? PxLanguages : LucLanguages;
    const PaletteIcon = P ? PxColorsSwatch : LucPalette;
    const CheckIcon = P ? PxCheck : LucCheck;

    return (
        <div className="app-shell">
            <aside className="desktop-sidebar">
                <Sidebar {...sidebarProps} />
            </aside>

            {drawerOpen && (
                <div
                    className="drawer-scrim"
                    onMouseDown={(event) =>
                        event.target === event.currentTarget &&
                        setDrawerOpen(false)
                    }
                >
                    <aside className="mobile-drawer">
                        <button
                            className="icon-button drawer-close"
                            onClick={() => setDrawerOpen(false)}
                            aria-label={t("top.closeMenu")}
                        >
                            <XIcon size={20} />
                        </button>
                        <Sidebar
                            {...sidebarProps}
                            close={() => setDrawerOpen(false)}
                        />
                    </aside>
                </div>
            )}

            <div className="shell-content">
                <header className="top-app-bar">
                    <button
                        className="icon-button mobile-menu"
                        onClick={() => setDrawerOpen(true)}
                        aria-label={t("top.openMenu")}
                    >
                        <MenuIcon size={21} />
                    </button>
                    <button
                        className="search-trigger"
                        onClick={() => setSearchOpen(true)}
                    >
                        <SearchIcon size={19} />
                        <span>{t("top.search")}</span>
                        <kbd>Ctrl K</kbd>
                    </button>
                    <div className="top-actions">
                        {meta.githubUrl && (
                            <a
                                className="icon-button"
                                href={meta.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={tr("top.github")}
                            >
                                <CodeIcon size={20} />
                            </a>
                        )}
                        <div
                            className="appearance-control language-control"
                            ref={languageRef}
                        >
                            <button
                                className={`icon-button${languageOpen ? " active" : ""}`}
                                onClick={() => {
                                    setLanguageOpen((open) => !open);
                                    setAppearanceOpen(false);
                                }}
                                aria-label={t("appearance.language")}
                                aria-expanded={languageOpen}
                                aria-haspopup="dialog"
                            >
                                <LanguagesIcon size={20} />
                            </button>
                            {languageOpen && (
                                <section
                                    className="appearance-popover language-popover"
                                    role="dialog"
                                    aria-label={t("appearance.language")}
                                >
                                    <div className="appearance-heading">
                                        <span>{t("appearance.language")}</span>
                                        <small>
                                            {t("appearance.languageHelp")}
                                        </small>
                                    </div>
                                    <div className="theme-options">
                                        {localeCatalog
                                            .filter((option) =>
                                                meta.locales.includes(
                                                    option.id,
                                                ),
                                            )
                                            .map((option) => (
                                                <button
                                                    type="button"
                                                    className={`theme-option${locale === option.id ? " selected" : ""}`}
                                                    onClick={() => {
                                                        setLocale(option.id);
                                                        setLanguageOpen(false);
                                                    }}
                                                    key={option.id}
                                                >
                                                    <span
                                                        className="language-selector-icon"
                                                        aria-hidden="true"
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: "50%",
                                                            backgroundColor:
                                                                "var(--bg-modifier-hover)",
                                                            color: "var(--text-muted)",
                                                        }}
                                                    >
                                                        <LanguagesIcon
                                                            size={18}
                                                        />
                                                    </span>
                                                    <span>
                                                        <strong>
                                                            {option.label}
                                                        </strong>
                                                        <small>
                                                            {option.id ===
                                                            "pt-BR"
                                                                ? "Português"
                                                                : "English"}
                                                        </small>
                                                    </span>
                                                    {locale === option.id && (
                                                        <CheckIcon size={16} />
                                                    )}
                                                </button>
                                            ))}
                                    </div>
                                </section>
                            )}
                        </div>
                        <div className="appearance-control" ref={appearanceRef}>
                            <button
                                className={`icon-button${appearanceOpen ? " active" : ""}`}
                                onClick={() => {
                                    setAppearanceOpen((open) => !open);
                                    setLanguageOpen(false);
                                }}
                                aria-label={t("appearance.open")}
                                aria-expanded={appearanceOpen}
                                aria-haspopup="dialog"
                            >
                                <PaletteIcon size={20} />
                            </button>
                            {appearanceOpen && (
                                <section
                                    className="appearance-popover"
                                    role="dialog"
                                    aria-label={t("appearance.dialogLabel")}
                                >
                                    <div className="appearance-heading">
                                        <span>{t("appearance.title")}</span>
                                        <small>
                                            {t("appearance.subtitle")}
                                        </small>
                                    </div>
                                    <div className="theme-group">
                                        <span className="theme-group-label">
                                            {t("appearance.siteTheme")}
                                        </span>
                                        <div className="theme-options">
                                            {siteThemes.map((option) => (
                                                <button
                                                    type="button"
                                                    className={`theme-option${theme === option.value ? " selected" : ""}`}
                                                    onClick={() =>
                                                        selectSiteTheme(
                                                            option.value,
                                                        )
                                                    }
                                                    key={option.value}
                                                >
                                                    <span
                                                        className={`site-theme-preview preview-${option.value}`}
                                                        aria-hidden="true"
                                                    >
                                                        <i />
                                                        <i />
                                                        <i />
                                                    </span>
                                                    <span>
                                                        <strong>
                                                            {t(option.labelKey)}
                                                        </strong>
                                                        <small>
                                                            {t(
                                                                option.descriptionKey,
                                                            )}
                                                        </small>
                                                    </span>
                                                    {theme === option.value && (
                                                        <CheckIcon size={16} />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="theme-group">
                                        <span className="theme-group-label">
                                            {t("appearance.codeTheme")}
                                        </span>
                                        <div className="theme-options">
                                            {codeThemes.map((option) => (
                                                <button
                                                    type="button"
                                                    className={`theme-option${codeTheme === option.value ? " selected" : ""}`}
                                                    onClick={() =>
                                                        selectCodeTheme(
                                                            option.value,
                                                        )
                                                    }
                                                    key={option.value}
                                                >
                                                    <span
                                                        className={`code-theme-preview preview-${option.value}`}
                                                        aria-hidden="true"
                                                    >
                                                        <i />
                                                        <i />
                                                        <i />
                                                    </span>
                                                    <span>
                                                        <strong>
                                                            {option.label}
                                                        </strong>
                                                        <small>
                                                            {t(
                                                                option.descriptionKey,
                                                            )}
                                                        </small>
                                                    </span>
                                                    {codeTheme ===
                                                        option.value && (
                                                        <CheckIcon size={16} />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </header>
                <main id="conteudo" className="main-content">
                    {children}
                </main>
                <ArticleEnhancer references={referenceLinks} />
                <ReferenceLinkPreview items={searchItems} project={project} />
                <footer className="site-footer">
                    <span>{tr("footer.community")}</span>
                    <span>
                        <CheckIcon size={14} /> {t("footer.verified")}{" "}
                        <code>{meta.branch ?? "master"}</code>
                    </span>
                </footer>
            </div>

            <SearchDialog
                items={searchItems}
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                theme={theme}
            />
        </div>
    );
}
