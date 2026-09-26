import { defineConfig } from "vite";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const isCloudflarePages = process.env.CF_PAGES === "1";
const analyticsToken = process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN?.trim();

function addGithubAnalytics(filePath) {
  const html = readFileSync(filePath, "utf8");
  if (!/<\/body>/i.test(html)) {
    throw new Error(`No se encontró </body> en ${filePath}`);
  }
  const beacon = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token: analyticsToken, spa: true })}'></script>`;
  writeFileSync(filePath, html.replace(/<\/body>/i, `${beacon}\n</body>`));
}

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

      // GitHub Pages comparte hostname con Prédicas. El mismo token permite
      // distinguir Dictados por la ruta /dictados-react/ en Web Analytics.
      // Incluir también las hojas HTML independientes, no sólo la app React.
      if (!isCloudflarePages && analyticsToken) {
        if (!/^[a-f0-9]{32}$/i.test(analyticsToken)) {
          throw new Error("Token de Cloudflare Web Analytics inválido");
        }
        addGithubAnalytics(resolve(config.root, config.build.outDir, "index.html"));
        for (const fileName of songFiles.filter((name) => name.endsWith(".html"))) {
          addGithubAnalytics(resolve(outputDirectory, fileName));
        }
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
