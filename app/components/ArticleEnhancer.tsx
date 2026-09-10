"use client";

import { Check, Copy } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";

import { useI18n } from "@/i18n/client";

const keywordPattern =
    /^(?:function|constructor|var|globalvar|static|if|else|for|while|do|until|repeat|switch|case|default|break|continue|return|exit|with|new|enum|try|catch|finally|throw|delete|begin|end)$/;
const builtInPattern =
    /^(?:true|false|undefined|noone|self|other|all|global|local|argument|argument_count|pi|infinity|NaN)$/;
const tokenPattern =
    /\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:function|constructor|var|globalvar|static|if|else|for|while|do|until|repeat|switch|case|default|break|continue|return|exit|with|new|enum|try|catch|finally|throw|delete|begin|end)\b|\b(?:true|false|undefined|noone|self|other|all|global|local|argument|argument_count|pi|infinity|NaN)\b|\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b|\b[A-Z][A-Z\d_]{2,}\b|\b[a-zA-Z_]\w*(?=\s*\()|(?:\?\?|\?\.|===|!==|==|!=|<=|>=|\+\+|--|&&|\|\||<<|>>|\+=|-=|\*=|\/=|%=|=>|[+\-*\/%=<>!&|^~?:])/g;

function escapeHtml(value: string) {
    return value.replace(
        /[&<>"']/g,
        (character) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;",
            })[character] ?? character,
    );
}

function tokenClass(token: string) {
    if (token.startsWith("//") || token.startsWith("/*")) return "tok-comment";
    if (token.startsWith('"') || token.startsWith("'")) return "tok-string";
    if (/^(?:0x[\da-fA-F]+|\d)/.test(token)) return "tok-number";
    if (keywordPattern.test(token)) return "tok-keyword";
    if (builtInPattern.test(token)) return "tok-builtin";
    if (/^[A-Z][A-Z\d_]{2,}$/.test(token)) return "tok-constant";
    if (/^[a-zA-Z_]\w*$/.test(token)) return "tok-function";
    return "tok-operator";
}

function highlightGml(source: string, references?: Map<string, string>) {
    let output = "";
    let cursor = 0;

    for (const match of source.matchAll(tokenPattern)) {
        const index = match.index ?? cursor;
        output += escapeHtml(source.slice(cursor, index));
        const token = match[0];
        let rendered = `<span class="${tokenClass(token)}">${escapeHtml(token)}</span>`;
        const href = references?.get(token);
        if (href)
            rendered = `<a class="ref-link" href="${href}">${rendered}</a>`;
        output += rendered;
        cursor = index + token.length;
    }

    return output + escapeHtml(source.slice(cursor));
}

function CopyButton({
    code,
    copyLabel,
    copiedLabel,
}: {
    code: string;
    copyLabel: string;
    copiedLabel: string;
}) {
    const copy = async (button: HTMLButtonElement) => {
        await navigator.clipboard.writeText(code);
        button.dataset.copied = "true";
        window.setTimeout(() => delete button.dataset.copied, 1600);
    };

    return (
        <button
            className="copy-code"
            onClick={(event) => copy(event.currentTarget)}
            aria-label={copyLabel}
            data-copied-label={copiedLabel}
        >
            <Copy className="copy-icon" size={15} />
            <Check className="check-icon" size={15} />
            <span data-copied-label={copiedLabel}>{copyLabel}</span>
        </button>
    );
}

export function ArticleEnhancer({
    references,
}: {
    references?: Map<string, string>;
}) {
    const pathname = usePathname();
    const { t } = useI18n();

    useEffect(() => {
        const roots: Root[] = [];
        const enhanced: Array<{
            pre: HTMLElement;
            code: HTMLElement;
            source: string;
        }> = [];
        let frame: number;

        const enhance = () => {
            document
                .querySelectorAll<HTMLElement>(".main-content pre")
                .forEach((pre) => {
                    const code = pre.querySelector<HTMLElement>("code");
                    if (!code || pre.dataset.codeEnhanced === "true") return;

                    const source = code.textContent ?? "";
                    pre.dataset.codeEnhanced = "true";
                    code.innerHTML = highlightGml(source, references);

                    const language = document.createElement("span");
                    language.className = "code-language";
                    language.textContent = pre.classList.contains(
                        "signature-block",
                    )
                        ? t("code.signature")
                        : t("code.language");
                    pre.appendChild(language);

                    const host = document.createElement("span");
                    host.className = "copy-code-host";
                    pre.appendChild(host);
                    const root = createRoot(host);
                    root.render(
                        <CopyButton
                            code={source}
                            copyLabel={t("code.copy")}
                            copiedLabel={t("code.copied")}
                        />,
                    );

                    roots.push(root);
                    enhanced.push({ pre, code, source });
                });
        };

        frame = window.requestAnimationFrame(enhance);

        const observer = new MutationObserver(() => {
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(enhance);
        });

        const content = document.querySelector(".main-content");
        if (content) {
            observer.observe(content, { childList: true, subtree: true });
        }

        return () => {
            observer.disconnect();
            window.cancelAnimationFrame(frame);
            roots.forEach((root) => setTimeout(() => root.unmount(), 0));
            enhanced.forEach(({ pre, code, source }) => {
                if (code) code.textContent = source;
                pre.querySelector(".code-language")?.remove();
                pre.querySelector(".copy-code-host")?.remove();
                delete pre.dataset.codeEnhanced;
            });
        };
    }, [pathname, t, references]);

    return null;
}
