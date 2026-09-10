import { redirect } from "next/navigation";
import { getContent } from "@/lib/content";
import { getProjectCanonicalLocale } from "@/lib/projects";

type ComplementRootPageProps = {
    params: Promise<{ project: string; complementId: string }>;
};

export default async function ComplementRootPage({
    params,
}: ComplementRootPageProps) {
    const { project, complementId } = await params;
    const { complementBySlug } = getContent(
        project,
        getProjectCanonicalLocale(project),
    );

    const comp = complementBySlug.get(complementId);
    if (comp && comp.guides.length > 0) {
        redirect(`/${project}/complements/${comp.slug}/${comp.guides[0].id}`);
    }

    // Fallback
    redirect(`/${project}`);
}
