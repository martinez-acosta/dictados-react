# Entrenador de dictados melódicos (React + MUI)

Proyecto Vite con React, Material UI y VexFlow para practicar dictados en clave de sol, compás 4/4, notas naturales E4–F5.

## Comandos

```
cd ejercicios/dictados-react
npm install
npm run dev
```

Abre el enlace local que imprime Vite.

## Tecnologías

- React 18
- Material UI 5
- VexFlow 4 (Factory / EasyScore / Formatter)
- Web Audio API (síntesis simple tipo piano)

## Publicación

Cada push a `main` publica el sitio existente en GitHub Pages mediante
`.github/workflows/deploy-pages.yml`. Cloudflare Pages también construye desde
`main` con la integración de GitHub: comando `npm run build`, salida `dist` y
raíz del repositorio. La variable `CF_PAGES=1`, que Cloudflare inyecta durante
el build, adapta las rutas a la raíz del dominio y omite el `404.html` de
GitHub Pages para que funcionen las rutas directas de React.

Para comprobar localmente la variante de Cloudflare, ejecuta
`CF_PAGES=1 npm run build`. El build normal conserva la ruta
`/dictados-react/` usada por GitHub Pages.

## Estadísticas de visitas

GitHub Pages usa Cloudflare Web Analytics con el mismo token del hostname
`martinez-acosta.github.io`. El workflow toma el token del secreto
`CLOUDFLARE_WEB_ANALYTICS_TOKEN` y añade el beacon a la app y a las hojas HTML
independientes. En el panel de Web Analytics, filtra por la ruta
`/dictados-react/` para distinguir estas visitas de las de Prédicas.

El proyecto `dictados-react` de Cloudflare Pages tiene Web Analytics habilitado
en **Metrics**. Cloudflare añade su beacon en el siguiente despliegue; el build
para Pages no incluye el token de GitHub y evita contar una visita dos veces.
