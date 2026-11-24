import { cpSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageDir = dirname(require.resolve("country-flag-icons/package.json"));
const source = join(packageDir, "3x2");
const target = join(root, "public", "flags");

if (!existsSync(source)) {
  throw new Error(`Flag directory not found at ${source}`);
}

mkdirSync(target, { recursive: true });
cpSync(source, target, {
  recursive: true,
  filter: (path) => !path.endsWith(".css") && !path.endsWith(".js"),
});
