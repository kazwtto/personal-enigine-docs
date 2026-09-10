import { permanentRedirect } from "next/navigation";

import { getProjectAliases } from "@/lib/projects";

type LegacyGuidePageProps = { params: Promise<{ slug: string }> };

export default async function LegacyGuidePage({
    params,
}: LegacyGuidePageProps) {
    const { slug } = await params;
    const aliases = getProjectAliases("undertale-engine");
    permanentRedirect(
        `/undertale-engine/guides/${aliases.guides[slug] ?? slug}`,
    );
}
