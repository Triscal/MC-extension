// build.mjs
import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

const watch = process.argv.includes('--watch');


// Compile TS entry points
const ctx = await esbuild.context({
  entryPoints: ["src/popup.ts", "src/options.ts", "src/background.ts"],
  bundle: true,
  outdir: "dist",
  platform: 'browser',
  target: 'chrome140',
});

// Copy static files
const staticFiles = ["manifest.json", "options.html", "popup.html"];

fs.mkdirSync("dist", { recursive: true });

for (const file of staticFiles) {
  fs.copyFileSync(file, path.join("dist", path.basename(file)));
  console.log(`Copied ${file} → dist/`);
}

const icons = ["icons/icon.png","icons/icon128.png", "icons/icon16.png", "icons/icon32.png", "icons/icon48.png"]

fs.mkdirSync("dist/icons", { recursive: true });

for (const icon of icons) {
  fs.copyFileSync(icon, path.join("dist/icons", path.basename(icon)));
  console.log(`Copied ${icon} → dist/icons`);
}

console.log("Build complete.");

if (watch) {
  await ctx.watch();
  console.log('Watching...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
