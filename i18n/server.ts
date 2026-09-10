import { headers, cookies } from "next/headers";
import {
    defaultLocale,
    isLocale,
    localeCookieKey,
    localeCatalog,
    type Locale,
} from "./config";
import { translate, type MessageKey } from "./messages";

function getBrowserLocale(acceptLanguage: string | null): Locale {
    if (!acceptLanguage) return defaultLocale;

    const langs = acceptLanguage
        .split(",")
        .map((lang) => {
            const [code, q] = lang.split(";");
            return {
                code: code.trim(),
                q: q && q.includes("=") ? parseFloat(q.split("=")[1]) : 1.0,
            };
        })
        .sort((a, b) => b.q - a.q);

    for (const lang of langs) {
        const code = lang.code.toLowerCase();
        const exactMatch = localeCatalog.find(
            (l) => l.id.toLowerCase() === code,
        );
        if (exactMatch) return exactMatch.id;
        const prefixMatch = localeCatalog.find((l) =>
            l.id.toLowerCase().startsWith(code.split("-")[0]),
        );
        if (prefixMatch) return prefixMatch.id;
    }

    return defaultLocale;
}

export async function getServerLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    const savedLocale = cookieStore.get(localeCookieKey)?.value;
    if (isLocale(savedLocale)) return savedLocale;

    const reqHeaders = await headers();
    return getBrowserLocale(reqHeaders.get("accept-language"));
}

export async function getServerI18n() {
    const locale = await getServerLocale();
    const t = (key: MessageKey, values?: Record<string, string | number>) =>
        translate(locale, key, values);
    return { locale, t };
}
