import { defineConfig } from "vite";
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

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
    },
  };
}

export default defineConfig({
  base: "/dictados-react/",
  plugins: [copySongSheets()],
});
