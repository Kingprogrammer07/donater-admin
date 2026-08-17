/**
 * Conventions that kept regressing, now enforced mechanically.
 *
 * Both rules below were fixed by hand three times and came back each time,
 * including inside shared components where every future screen inherits them.
 * A rule nobody can forget is worth more than a rule everybody agrees with.
 *
 *   node scripts/check-conventions.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SRC = join(ROOT, "src");
const MIN_FONT_PX = 12;

const RULES = [
  {
    name: `text below ${MIN_FONT_PX}px`,
    // Tailwind arbitrary font sizes: text-[11px]
    pattern: /text-\[(\d+)px\]/g,
    violates: (match) => Number(match[1]) < MIN_FONT_PX,
    hint: `docs/FRONTEND.md §1.1: the smallest step is ${MIN_FONT_PX}px (text-xs).`,
  },
  {
    name: "`any`",
    pattern: /(:\s*any\b|\bas any\b)/g,
    violates: () => true,
    hint: "docs/FRONTEND.md §0.4: no `any`. Name the type, or use `unknown` and narrow it.",
  },
  {
    name: "permission decided by role name",
    pattern: /\brole\s*===\s*["'`]\w+["'`]/g,
    violates: () => true,
    hint:
      "Use hasPermission('manage_x'). Roles are nested, so `role === 'viewer'` also shows the " +
      "control to support, who then gets a 403 from the server.",
  },
];

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* walk(full);
    } else if (/\.tsx?$/.test(full)) {
      yield full;
    }
  }
}

let failures = 0;
for (const file of walk(SRC)) {
  const source = readFileSync(file, "utf8");
  const lines = source.split(/\r?\n/);

  for (const rule of RULES) {
    for (const [index, line] of lines.entries()) {
      rule.pattern.lastIndex = 0;
      for (const match of line.matchAll(rule.pattern)) {
        if (!rule.violates(match)) continue;
        failures += 1;
        console.error(
          `${relative(ROOT, file)}:${index + 1}  ${rule.name}: ${match[0].trim()}\n    ${rule.hint}`
        );
      }
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} convention violation(s).`);
  process.exit(1);
}
console.log("conventions ok");
