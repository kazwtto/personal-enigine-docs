import { permanentRedirect } from "next/navigation";

import { getContent, slugify } from "@/lib/content";

type LegacyCategoryPageProps = { params: Promise<{ slug: string }> };

export default async function LegacyCategoryPage({
    params,
}: LegacyCategoryPageProps) {
    const { slug } = await params;
    const { referenceCategoryDetails } = getContent(
        "undertale-engine",
        "pt-BR",
    );
    const category = referenceCategoryDetails.find(
        (item) => slugify(item.sourceTitle) === slug || item.slug === slug,
    );
    permanentRedirect(
        `/undertale-engine/reference/categories/${category?.slug ?? slug}`,
    );
}
