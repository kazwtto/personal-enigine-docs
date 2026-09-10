import { permanentRedirect } from "next/navigation";

import { getProjectAliases } from "@/lib/projects";

type LegacySystemPageProps = { params: Promise<{ slug: string }> };

export default async function LegacySystemPage({
    params,
}: LegacySystemPageProps) {
    const { slug } = await params;
    const aliases = getProjectAliases("undertale-engine");
    permanentRedirect(
        `/undertale-engine/systems/${aliases.systems[slug] ?? slug}`,
    );
}
