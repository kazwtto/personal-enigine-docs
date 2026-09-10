import { permanentRedirect } from "next/navigation";

type LegacyReferencePageProps = { params: Promise<{ slug: string }> };

export default async function LegacyReferencePage({
    params,
}: LegacyReferencePageProps) {
    const { slug } = await params;
    permanentRedirect(`/undertale-engine/reference/${slug}`);
}
