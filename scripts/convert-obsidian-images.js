// scripts/convert-obsidian-images.js

const fs = require("node:fs");
const path = require("node:path");

const markdownRoots = ["docs", "blog", "src/pages"];

const imageExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
]);

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (
        ["node_modules", ".git", "build", ".docusaurus"].includes(entry.name)
      ) {
        return [];
      }

      return walkFiles(fullPath);
    }

    return [fullPath];
  });
}

function encodeUrlPath(filePath) {
  return filePath
    .replaceAll("\\", "/")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function convertFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  let foundCount = 0;
  let replacedCount = 0;

  const updated = content.replace(
    /!\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/g,
    (match, rawTarget) => {
      foundCount++;

      const target = rawTarget.trim();
      const ext = path.extname(target).toLowerCase();

      if (!imageExtensions.has(ext)) {
        return match;
      }

      replacedCount++;

      // Use basename because all images will be manually placed into static/img/obsidian
      const filename = path.basename(target);

      return `![Image](/img/obsidian/${encodeUrlPath(filename)})`;
    },
  );

  if (updated !== content) {
    fs.writeFileSync(filePath, updated, "utf8");
  }

  if (foundCount > 0) {
    console.log(`${filePath}: found ${foundCount}, replaced ${replacedCount}`);
  }
}

const markdownFiles = markdownRoots
  .flatMap((root) => walkFiles(path.resolve(root)))
  .filter((file) => [".md", ".mdx"].includes(path.extname(file).toLowerCase()));

for (const file of markdownFiles) {
  convertFile(file);
}
