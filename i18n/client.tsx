"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { LoadingModal } from "@/app/components/LoadingModal";

import {
    defaultLocale,
    getLocaleDescriptor,
    isLocale,
    localeCookieKey,
    localeStorageKey,
    enableLanguageSwitchLoadingModal,
    type Locale,
} from "./config";
import { translate, type MessageKey } from "./messages";

type I18nContextValue = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: MessageKey, values?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
    children,
    initialLocale = defaultLocale,
}: {
    children: React.ReactNode;
    initialLocale?: Locale;
}) {
    const router = useRouter();
    const [locale, setLocaleState] = useState<Locale>(initialLocale);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const stored = window.localStorage.getItem(localeStorageKey);
        const resolved = isLocale(stored) ? stored : initialLocale;
        const descriptor = getLocaleDescriptor(resolved);
        document.documentElement.lang = descriptor.htmlLang;
        document.documentElement.dir = descriptor.direction;
        document.documentElement.dataset.locale = resolved;
        const id = window.setTimeout(() => setLocaleState(resolved), 0);
        return () => window.clearTimeout(id);
    }, [initialLocale]);

    const setLocale = useCallback(
        (nextLocale: Locale) => {
            const descriptor = getLocaleDescriptor(nextLocale);
            window.localStorage.setItem(localeStorageKey, nextLocale);
            document.cookie = `${localeCookieKey}=${encodeURIComponent(nextLocale)}; path=/; max-age=31536000; samesite=lax`;
            document.documentElement.lang = descriptor.htmlLang;
            document.documentElement.dir = descriptor.direction;
            document.documentElement.dataset.locale = nextLocale;
            setLocaleState(nextLocale);
            startTransition(() => {
                router.refresh();
            });
        },
        [router],
    );

    const t = useCallback(
        (key: MessageKey, values?: Record<string, string | number>) =>
            translate(locale, key, values),
        [locale],
    );
    const value = useMemo(
        () => ({ locale, setLocale, t }),
        [locale, setLocale, t],
    );

    return (
        <I18nContext.Provider value={value}>
            {children}
            {isPending && enableLanguageSwitchLoadingModal && <LoadingModal />}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context)
        throw new Error("useI18n deve ser usado dentro de I18nProvider.");
    return context;
}
