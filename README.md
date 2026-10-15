# Tech Phase website

Marketing site for **Tech Phase** — tech agency & business consultant (web, apps, design, marketing, video editing & UGC ads, AI automation, consulting).

Static site: plain HTML, CSS and JavaScript. No build step, no dependencies.

## Structure

```
index.html          page markup
css/styles.css      all styles
js/main.js          all behaviour (services, portfolio gallery, forms, routing)
assets/img/         logos and portfolio gallery images (gallery/<project>/)
assets/video/       portfolio videos
robots.txt          crawler rules
.nojekyll           tells GitHub Pages to serve files as-is
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Deploy

**GitHub Pages:** Settings → Pages → Deploy from a branch → `main` / `/ (root)`.
Site URL: https://techphase-server.github.io/techphase/

**Netlify / Vercel / Cloudflare Pages:** import this repo, leave the build command empty, publish directory `/`.

## Contact

info@techphase.net · +92 333 2832914
