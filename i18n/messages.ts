import { defaultLocale, type Locale } from "./config";
import { ptBRMessages } from "./locales/pt-BR/ui";
import { enUSMessages } from "./locales/en-US/ui";
import { esESMessages } from "./locales/es-ES/ui";
import { ptBRReference } from "./locales/pt-BR/reference";
import { enUSReference } from "./locales/en-US/reference";
import { esESReference } from "./locales/es-ES/reference";

const ptBRMerged = { ...ptBRMessages, ...ptBRReference };
const enUSMerged = { ...enUSMessages, ...enUSReference };
const esESMerged = { ...esESMessages, ...esESReference };

export type MessageKey = keyof typeof ptBRMerged;
export type Messages = Record<MessageKey, string>;

const messagesByLocale: Record<Locale, Messages> = {
    "pt-BR": ptBRMerged,
    "en-US": enUSMerged,
    "es-ES": esESMerged,
};

export function getMessages(locale: Locale = defaultLocale): Messages {
    return messagesByLocale[locale] ?? messagesByLocale[defaultLocale];
}

export function translate(
    locale: Locale,
    key: MessageKey,
    values?: Record<string, string | number>,
) {
    const template =
        getMessages(locale)[key] ?? getMessages(defaultLocale)[key] ?? key;
    if (!values) return template;
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        String(values[name] ?? match),
    );
}
