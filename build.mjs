// build.mjs
import * as esbuild from "esbuild";
import { ZipArchive } from "archiver";
import * as fs from "fs";
import * as path from "path";

const watch = process.argv.includes("--watch");

// Compile TS entry points
const ctx = await esbuild.context({
  entryPoints: ["src/popup.ts", "src/options.ts", "src/background.ts"],
  bundle: true,
  outdir: "dist/output",
  platform: "browser",
  target: "chrome140",
});

// Copy static files
const staticFiles = ["manifest.json", "options.html", "popup.html"];

fs.mkdirSync("dist/output", { recursive: true });

for (const file of staticFiles) {
  fs.copyFileSync(file, path.join("dist/output", path.basename(file)));
  console.log(`Copied ${file} → dist/`);
}

const icons = [
  "icons/icon.png",
  "icons/icon128.png",
  "icons/icon16.png",
  "icons/icon32.png",
  "icons/icon48.png",
];

fs.mkdirSync("dist/output/icons", { recursive: true });

for (const icon of icons) {
  fs.copyFileSync(icon, path.join("dist/output/icons", path.basename(icon)));
  console.log(`Copied ${icon} → dist/output/icons`);
}

console.log("Build complete.");
if (watch) {
  await ctx.watch();
  console.log("Watching...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
}


const output = fs.createWriteStream('dist/archive.zip')
const archive = new ZipArchive({
  zlib: { level: 9 }, // Sets the compression level.
});

archive.pipe(output)
archive.directory('dist/output', false)
await archive.finalize()




