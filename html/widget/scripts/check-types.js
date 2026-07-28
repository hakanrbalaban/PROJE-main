const fs = require("fs");
const c = require("../data/catalog.json");
const e = fs.readFileSync("js/widgets/engine.js", "utf8");
const types = new Set();
for (const m of e.matchAll(/^\s+["']?([a-z0-9-]+)["']?:\s*function/gm)) types.add(m[1]);
const missing = c.widgets.filter((w) => !types.has(w.type));
console.log("types in engine:", types.size);
console.log("missing:", missing.length);
missing.forEach((w) => console.log("-", w.type, w.title));
