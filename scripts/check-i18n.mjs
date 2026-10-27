// Fails when fa.json and en.json don't have the same keys (scenario L1).
import { readFileSync } from "node:fs";

const load = (l) => JSON.parse(readFileSync(new URL(`../src/i18n/messages/${l}.json`, import.meta.url)));
const keys = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

const fa = new Set(keys(load("fa")));
const en = new Set(keys(load("en")));
const missing = [
  ...[...fa].filter((k) => !en.has(k)).map((k) => `en.json is missing ${k}`),
  ...[...en].filter((k) => !fa.has(k)).map((k) => `fa.json is missing ${k}`),
];

if (missing.length) {
  console.error(missing.join("\n"));
  process.exit(1);
}
console.log(`i18n ok: ${fa.size} keys in both languages`);
