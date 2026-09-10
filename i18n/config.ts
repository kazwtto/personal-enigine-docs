export const localeCatalog = [
    {
        id: "pt-BR",
        label: "Português (Brasil)",
        htmlLang: "pt-BR",
        direction: "ltr",
    },
    {
        id: "en-US",
        label: "English (United States)",
        htmlLang: "en-US",
        direction: "ltr",
    },
    {
        id: "es-ES",
        label: "Español (España)",
        htmlLang: "es-ES",
        direction: "ltr",
    },
] as const;

export type Locale = (typeof localeCatalog)[number]["id"];

export const defaultLocale: Locale = "en-US";
export const localeStorageKey = "ue-docs-locale";
export const localeCookieKey = "ue_docs_locale";
export const enableLanguageSwitchLoadingModal = true;

export function isLocale(value: string | null | undefined): value is Locale {
    return localeCatalog.some((locale) => locale.id === value);
}

export function getLocaleDescriptor(locale: Locale) {
    return localeCatalog.find((item) => item.id === locale) ?? localeCatalog[0];
}
