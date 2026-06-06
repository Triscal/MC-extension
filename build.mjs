// build.mjs
import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

// Compile TS entry points
await esbuild.build({
  entryPoints: ["src/popup.ts", "src/options.ts", "src/background.ts"],
  bundle: true,
  outdir: "dist",
  target: "ES2022",
});

// Copy static files
const staticFiles = [
  "icon.png",
  "manifest.json",
  "options.html",
  "popup.html",
];

fs.mkdirSync("dist", { recursive: true });

for (const file of staticFiles) {
  fs.copyFileSync(file, path.join("dist", path.basename(file)));
  console.log(`Copied ${file} → dist/`);
}

console.log("Build complete.");