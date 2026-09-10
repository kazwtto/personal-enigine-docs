import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";
import { getServerI18n } from "@/i18n/server";

export default async function NotFound() {
    const { t } = await getServerI18n();
    return (
        <div className="not-found">
            <SearchX size={42} />
            <span className="eyebrow">{t("notfound.eyebrow")}</span>
            <h1>{t("notfound.title")}</h1>
            <p>{t("notfound.description")}</p>
            <Link className="button filled" href="/">
                <ArrowLeft size={18} /> {t("notfound.back")}
            </Link>
        </div>
    );
}
