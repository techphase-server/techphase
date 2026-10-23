# Tech Phase website

Marketing site for **Tech Phase** — tech agency & business consultant (web, apps, design, marketing, video editing & UGC ads, AI automation, consulting).

Static site: plain HTML, CSS and JavaScript. No build step, no dependencies.

## Structure

```
index.html          page markup
css/styles.css      all styles
css/chat.css        chat widget styles (loaded when the widget starts)
js/main.js          all behaviour (services, portfolio gallery, forms, routing)
js/chat.js          chat widget (CHAT_WORKER_URL is the deployed Worker)
chat-worker/        Cloudflare Worker proxy for the Grok API
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

## Chat assistant

The floating chat panel is `js/chat.js`. It calls the deployed Cloudflare Worker at https://techphase-chat.techphase-net.workers.dev (`CHAT_WORKER_URL`). The Worker in `chat-worker/` holds the xAI API key. Deploy steps and how to test are in [chat-worker/README.md](chat-worker/README.md).

## Contact

info@techphase.net · +92 333 2832914
