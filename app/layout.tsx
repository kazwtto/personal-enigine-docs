// import type { Metadata } from "next";
// import { headers } from "next/headers";

import Script from "next/script";
import { I18nProvider } from "@/i18n/client";
import { localeCatalog, localeStorageKey } from "@/i18n/config";

import "./globals.css";

// export async function generateMetadata(): Promise<Metadata> {
//   const { getServerI18n } = await import("@/i18n/server");
//   const { t } = await getServerI18n();
//   const title = `${t("portal.hubTitle")} ${t("brand.unofficialTag")}`;
//   const description = t("portal.hubDescription");
//   const requestHeaders = await headers();
//   const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
//   const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
//   const origin = `${protocol}://${host}`;
//
//   return {
//     metadataBase: new URL(origin),
//     title: { default: title, template: `%s | ${title}` },
//     description,
//     openGraph: {
//       type: "website",
//       locale: "pt_BR",
//       title,
//       description,
//       images: [{ url: `${origin}/og.png`, width: 1680, height: 945, alt: title }],
//     },
//     twitter: { card: "summary_large_image", title, description, images: [`${origin}/og.png`] },
//   };
// }

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const { getServerLocale } = await import("@/i18n/server");
    const locale = await getServerLocale();

    const supportedLocales = localeCatalog.map((locale) => locale.id);

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <Script
                    id="theme-script"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('ue-docs-theme');var c=localStorage.getItem('ue-docs-code-theme');var l=localStorage.getItem('${localeStorageKey}');var supported=${JSON.stringify(supportedLocales)};l=supported.indexOf(l)>-1?l:document.documentElement.lang;document.documentElement.dataset.theme=(t==='light'||t==='pixel'||t==='dark')?t:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.codeTheme=(c==='material'||c==='github'||c==='nord'||c==='dracula')?c:'dracula';document.documentElement.dataset.locale=l;document.documentElement.lang=l}catch(e){document.documentElement.dataset.theme='dark';document.documentElement.dataset.codeTheme='dracula';document.documentElement.dataset.locale=document.documentElement.lang;}})()`,
                    }}
                />
            </head>
            <body>
                <a className="skip-link" href="#conteudo">
                    Pular para o conteúdo
                </a>
                <I18nProvider initialLocale={locale}>{children}</I18nProvider>
            </body>
        </html>
    );
}
