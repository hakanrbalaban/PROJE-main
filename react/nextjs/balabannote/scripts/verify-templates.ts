import { generateOneTemplate } from "../src/lib/templates/generate";

const samples = [0, 1, 2, 20, 40].map((i) => generateOneTemplate(i));
for (const t of samples) {
  const sig = (t.page.shapes ?? [])
    .map((s) => `${s.kind}@${Math.round(s.x)},${Math.round(s.y)}:${s.text ?? ""}`)
    .join("|");
  console.log(t.meta.id, t.meta.category, t.meta.accent, t.meta.title);
  console.log("  shapes:", sig.slice(0, 180));
}
const s0 = JSON.stringify(samples[0]!.page.shapes);
const s20 = JSON.stringify(samples[3]!.page.shapes);
console.log("same category-offset shapes?", s0 === s20);
console.log(
  "accents unique?",
  new Set(samples.map((s) => s.meta.accent)).size === samples.length,
);

// Spot-check 200 accents uniqueness rate
const accents = Array.from({ length: 200 }, (_, i) => generateOneTemplate(i).meta.accent);
console.log("unique accents in first 200:", new Set(accents).size);
