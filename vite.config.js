import { defineConfig } from "vite";
import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const isCloudflarePages = process.env.CF_PAGES === "1";

function copySongSheets() {
  let config;

  return {
    name: "copy-song-sheets",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    closeBundle() {
      const sourceDirectory = resolve(config.root, "src");
      const outputDirectory = resolve(config.root, config.build.outDir, "src");
      const songFiles = readdirSync(sourceDirectory).filter(
        (fileName) =>
          fileName.endsWith(".html") || fileName === "song-transposer.js",
      );

      mkdirSync(outputDirectory, { recursive: true });

      for (const fileName of songFiles) {
        copyFileSync(
          resolve(sourceDirectory, fileName),
          resolve(outputDirectory, fileName),
        );
      }

      // Cloudflare Pages serves SPA routes from index.html when no 404.html exists.
      // GitHub Pages still needs its 404.html redirect for direct route visits.
      if (isCloudflarePages) {
        rmSync(resolve(config.root, config.build.outDir, "404.html"), {
          force: true,
        });
      }
    },
  };
}

export default defineConfig({
  base: isCloudflarePages ? "/" : "/dictados-react/",
  plugins: [copySongSheets()],
});
