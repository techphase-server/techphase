# Tech Phase website

Marketing site for **Tech Phase** — tech agency & business consultant (web, apps, design, marketing, video editing & UGC ads, AI automation, consulting).

Static site: plain HTML, CSS and JavaScript. No build step, no dependencies.

## Structure

```
index.html          page markup
css/styles.css      all styles
css/chat.css        chat widget styles (loaded when the widget starts)
js/main.js          all behaviour (services, portfolio gallery, forms, routing). CHAT_WORKER_URL is set once here
js/chat.js          chat widget (uses window.CHAT_WORKER_URL from main.js)
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

The floating chat panel is `js/chat.js`. It calls the deployed Cloudflare Worker at https://techphase-chat.techphase-net.workers.dev. That address is `CHAT_WORKER_URL` in `js/main.js` (the only place it is set). The Worker in `chat-worker/` holds the xAI API key. Deploy steps and how to test are in [chat-worker/README.md](chat-worker/README.md).

## Contact

info@techphase.net · +92 333 2832914

Both forms (the contact section and the "Start a project" dialog) `POST` JSON to `${CHAT_WORKER_URL}/lead`. The Worker sends a Tech Phase notification to the team and a short auto-reply to the visitor through [Resend](https://resend.com). The Resend API key is the Worker secret `RESEND_API_KEY` and is not in this repo. `techphase.net` has to be verified in Resend before those messages deliver. A hidden honeypot field is the spam check. If sending fails, the form shows an error and a `mailto:` link to info@techphase.net.
