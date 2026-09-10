import {
    Boxes,
    Package,
    ShieldQuestion,
    UserRound,
    type LucideIcon,
} from "lucide-react";

export const projectIcons: Record<string, LucideIcon> = {
    package: Package,
    "user-round": UserRound,
    "shield-question": ShieldQuestion,
};

export function ProjectIcon({
    name,
    size = 18,
}: {
    name: string;
    size?: number;
}) {
    const Icon = projectIcons[name] ?? Boxes;
    return <Icon size={size} />;
}
