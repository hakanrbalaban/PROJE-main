/**
 * Generate 1000 templates to D:\BalabanNote\templates
 * Run: npx tsx scripts/generate-templates.ts
 */
import { writeTemplateLibrary } from "../src/lib/templates/store";
import { TEMPLATE_TARGET_COUNT } from "../src/lib/templates/generate";

const count = Number(process.argv[2]) || TEMPLATE_TARGET_COUNT;
console.log(`Generating ${count} templates…`);
const t0 = Date.now();
const index = writeTemplateLibrary(count);
console.log(
  `Done: ${index.count} templates → ${index.root} (${Date.now() - t0}ms)`,
);
