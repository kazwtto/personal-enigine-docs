import { permanentRedirect } from "next/navigation";

type LegacyComplementPageProps = { params: Promise<{ slug: string }> };

export default async function LegacyComplementPage({
    params,
}: LegacyComplementPageProps) {
    const { slug } = await params;
    permanentRedirect(`/undertale-engine/complements/${slug}`);
}
