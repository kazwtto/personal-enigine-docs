// Removes Next.js cache directories that would otherwise be uploaded as part
// of the deploy publish directory (.next). Both are regenerated automatically:
// `.next/dev` by `next dev` and `.next/cache` by `next build`.
import { rmSync } from "node:fs";

const targets = [".next/dev", ".next/cache"];

for (const dir of targets) {
    rmSync(dir, { recursive: true, force: true });
}

console.log(`Removed ${targets.join(", ")} from publish directory`);
