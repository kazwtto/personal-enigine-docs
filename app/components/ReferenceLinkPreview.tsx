"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useI18n } from "@/i18n/client";
import type { SearchItem } from "@/lib/content";

const previewId = "reference-link-preview";

type ActivePreview = {
    anchor: HTMLAnchorElement;
    item: SearchItem;
    label: string;
};

type PreviewPosition = {
    left: number;
    top: number;
    placement: "above" | "below";
    width: number;
};

export function ReferenceLinkPreview({
    items,
    project,
}: {
    items: SearchItem[];
    project: string;
}) {
    const pathname = usePathname();
    const { t } = useI18n();
    const cardRef = useRef<HTMLElement>(null);
    const openTimer = useRef<number | null>(null);
    const closeTimer = useRef<number | null>(null);
    const [active, setActive] = useState<ActivePreview | null>(null);
    const [position, setPosition] = useState<PreviewPosition | null>(null);

    const referencesByPath = useMemo(
        () =>
            new Map(
                items
                    .filter(
                        (item) =>
                            item.type === "API" &&
                            item.href.startsWith(`/${project}/reference/`),
                    )
                    .map((item) => [item.href.split("#")[0], item]),
            ),
        [items, project],
    );

    const clearOpenTimer = useCallback(() => {
        if (openTimer.current !== null) window.clearTimeout(openTimer.current);
        openTimer.current = null;
    }, []);

    const clearCloseTimer = useCallback(() => {
        if (closeTimer.current !== null)
            window.clearTimeout(closeTimer.current);
        closeTimer.current = null;
    }, []);

    const closePreview = useCallback(
        (delay = 110) => {
            clearOpenTimer();
            clearCloseTimer();
            closeTimer.current = window.setTimeout(() => {
                setActive(null);
                setPosition(null);
            }, delay);
        },
        [clearCloseTimer, clearOpenTimer],
    );

    const openPreview = useCallback(
        (anchor: HTMLAnchorElement, item: SearchItem, delay: number) => {
            clearOpenTimer();
            clearCloseTimer();
            openTimer.current = window.setTimeout(() => {
                setPosition(null);
                setActive({
                    anchor,
                    item,
                    label: anchor.textContent?.trim() || item.title,
                });
            }, delay);
        },
        [clearCloseTimer, clearOpenTimer],
    );

    useEffect(() => {
        const getReference = (target: EventTarget | null) => {
            const element = target instanceof Element ? target : null;
            const anchor = element?.closest<HTMLAnchorElement>("a[href]");
            if (!anchor || anchor.closest("[data-reference-preview-ignore]"))
                return null;
            const path = new URL(anchor.href, window.location.origin).pathname;
            const item = referencesByPath.get(path);
            return item ? { anchor, item } : null;
        };

        const onPointerOver = (event: PointerEvent) => {
            if (event.pointerType === "touch") return;
            const reference = getReference(event.target);
            if (
                !reference ||
                reference.anchor.contains(event.relatedTarget as Node | null)
            )
                return;
            openPreview(reference.anchor, reference.item, 180);
        };

        const onPointerOut = (event: PointerEvent) => {
            const reference = getReference(event.target);
            if (
                !reference ||
                reference.anchor.contains(event.relatedTarget as Node | null)
            )
                return;
            closePreview();
        };

        const onFocusIn = (event: FocusEvent) => {
            const reference = getReference(event.target);
            if (reference) openPreview(reference.anchor, reference.item, 0);
        };

        const onFocusOut = (event: FocusEvent) => {
            const reference = getReference(event.target);
            if (
                reference &&
                !reference.anchor.contains(event.relatedTarget as Node | null)
            )
                closePreview(140);
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closePreview(0);
        };

        document.addEventListener("pointerover", onPointerOver);
        document.addEventListener("pointerout", onPointerOut);
        document.addEventListener("focusin", onFocusIn);
        document.addEventListener("focusout", onFocusOut);
        window.addEventListener("keydown", onKeyDown);

        return () => {
            clearOpenTimer();
            clearCloseTimer();
            document.removeEventListener("pointerover", onPointerOver);
            document.removeEventListener("pointerout", onPointerOut);
            document.removeEventListener("focusin", onFocusIn);
            document.removeEventListener("focusout", onFocusOut);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [
        clearCloseTimer,
        clearOpenTimer,
        closePreview,
        openPreview,
        referencesByPath,
    ]);

    useEffect(() => {
        const id = window.setTimeout(() => {
            setActive(null);
            setPosition(null);
        }, 0);
        return () => window.clearTimeout(id);
    }, [pathname]);

    useEffect(() => {
        if (!active) return;
        const previous = active.anchor.getAttribute("aria-describedby");
        const describedBy = [previous, previewId].filter(Boolean).join(" ");
        active.anchor.setAttribute("aria-describedby", describedBy);
        return () => {
            if (previous)
                active.anchor.setAttribute("aria-describedby", previous);
            else active.anchor.removeAttribute("aria-describedby");
        };
    }, [active]);

    useLayoutEffect(() => {
        if (!active) return;

        const updatePosition = () => {
            const anchorRect = active.anchor.getBoundingClientRect();
            const cardHeight = cardRef.current?.offsetHeight ?? 190;
            const width = Math.min(370, window.innerWidth - 24);
            const left = Math.max(
                12,
                Math.min(
                    window.innerWidth - width - 12,
                    anchorRect.left + anchorRect.width / 2 - width / 2,
                ),
            );
            const fitsBelow =
                anchorRect.bottom + 12 + cardHeight <= window.innerHeight - 12;
            const top = fitsBelow
                ? anchorRect.bottom + 10
                : Math.max(12, anchorRect.top - cardHeight - 10);
            setPosition({
                left,
                top,
                width,
                placement: fitsBelow ? "below" : "above",
            });
        };

        const frame = window.requestAnimationFrame(updatePosition);
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [active]);

    if (!active) return null;

    const previewParameters = active.item.parameters?.slice(0, 5) ?? [];
    const hasMoreParameters = (active.item.parameters?.length ?? 0) > 5;

    return (
        <aside
            id={previewId}
            ref={cardRef}
            className={`reference-link-preview placement-${position?.placement ?? "below"}`}
            role="dialog"
            aria-modal="false"
            aria-label={t("referencePreview.dialogLabel")}
            data-reference-preview-ignore
            style={
                position
                    ? {
                          left: position.left,
                          top: position.top,
                          width: position.width,
                      }
                    : { visibility: "hidden" }
            }
            onPointerEnter={clearCloseTimer}
            onPointerLeave={() => closePreview(80)}
            onFocus={clearCloseTimer}
            onBlur={(event) => {
                if (
                    !event.currentTarget.contains(
                        event.relatedTarget as Node | null,
                    )
                )
                    closePreview(80);
            }}
        >
            <code className="reference-preview-name">{active.label}</code>
            <p>{active.item.subtitle}</p>
            {previewParameters.length > 0 && (
                <div className="reference-preview-arguments">
                    <span>{t("referencePreview.arguments")}</span>
                    <code>
                        {previewParameters.join(", ")}
                        {hasMoreParameters ? ", .." : ""}
                    </code>
                </div>
            )}
            <Link className="reference-preview-link" href={active.item.href}>
                {t("referencePreview.open")} <ArrowRight size={15} />
            </Link>
        </aside>
    );
}
