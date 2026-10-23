# Tech Phase chat worker

Cloudflare Worker that proxies the website chat widget to xAI's Grok API. The browser never sees the API key. The key lives only in the Worker secret `XAI_API_KEY`.

The widget is `js/chat.js` on the static site. It reads one config constant, `CHAT_WORKER_URL`, which is set to the deployed Worker:

https://techphase-chat.techphase-net.workers.dev

## What it does

- `POST /chat` accepts `{ "messages": [{ "role": "user"|"assistant", "content": "..." }] }`, adds a Tech Phase system prompt, and calls `https://api.x.ai/v1/chat/completions`.
- CORS allows `https://techphase.net`, `https://www.techphase.net`, and `http://localhost` / `http://127.0.0.1` (any port) for local testing. Any other `Origin` is rejected and does not get CORS headers.
- Abuse limits, all enforced on the worker: 1,500 characters per message, 12 messages of history, 8,000 characters total, a hard cap of 800 completion tokens (the configured budget is 400), and a best-effort per-IP limit of 12 requests per minute and 40 per hour. The rate limit is in-memory on each isolate, which is what the Workers free plan can do without KV or Durable Objects. It resets when that isolate goes away.
- The model defaults to **grok-4.7**, xAI's current chat model ([models](https://docs.x.ai/developers/models), checked October 2026). `grok-4.7` always reasons; `REASONING_EFFORT` is `low` so a short reply stays faster. Change `MODEL` in `wrangler.toml` if you want another text model from that page (`grok-4.6`, `grok-4.5`, `grok-4.3`, or `grok-4.20-0309-non-reasoning`). Set `REASONING_EFFORT` to an empty string to omit the field.
- The system prompt is built from the live site: services, the remote-first process, contact details, and the rule that scope and fees exist only in a written proposal. The assistant must not invent prices or promises, and it asks for a name, email, and project details.
- **TODO — lead email is off.** `LEAD_EMAIL` is empty, so a chat is not emailed anywhere. The contact forms are moving to FormSubmit.co at `https://formsubmit.co/ajax/info@techphase.net`. After that inbox has opened FormSubmit's one-time activation email, set `LEAD_EMAIL` to `info@techphase.net` (or paste that full URL) and redeploy. The worker then forwards a chat that contains a visitor email, at most twice per address per isolate. Until then, the assistant tells the visitor to use the contact form or email `info@techphase.net` directly. A failed lead email does not fail the chat reply.
- Requests and logs are scrubbed of `XAI_API_KEY`. Error responses are generic codes (`bad_request`, `rate_limited`, `unavailable`, `forbidden`) and never include the upstream body.

`GET /health` returns `{ "ok": true }`.

## Tests

No API key and no network:

```bash
cd chat-worker
npm test
```

## Deploy

From this folder, with a Cloudflare account. Nothing here is deployed by the site build.

```bash
cd chat-worker
npx wrangler login
npx wrangler secret put XAI_API_KEY
npx wrangler deploy
```

`wrangler secret put` prompts for the key. Do not pass the key on the command line, and do not write it into `wrangler.toml`, `.dev.vars` that you commit, or the website.

The deployed Worker is https://techphase-chat.techphase-net.workers.dev. `preview_urls` is off in `wrangler.toml`, so Wrangler does not publish a separate preview URL. `wrangler deploy` updates that same Worker.

To turn on lead email after FormSubmit is activated for `info@techphase.net`:

```bash
# wrangler.toml
LEAD_EMAIL = "info@techphase.net"
```

Then run `npx wrangler deploy` again. Vars are public config. The API key stays a secret.

### Local worker

```bash
cd chat-worker
printf 'XAI_API_KEY=%s\n' 'your-key-here' > .dev.vars
npx wrangler dev
```

`.dev.vars` is gitignored. `wrangler dev` serves `http://127.0.0.1:8787`.

## Worker URL

`js/chat.js` already points at the deployed origin, with no trailing slash:

```javascript
const CHAT_WORKER_URL = "https://techphase-chat.techphase-net.workers.dev";
```

That constant is the only place the address is set. The page still never contains the API key. If the constant is emptied, the widget opens and tells visitors to email `info@techphase.net`.

## How to test

1. Unit tests: `npm test` in `chat-worker`.
2. Worker, from another terminal while `wrangler dev` is running:

```bash
curl -i -X POST http://127.0.0.1:8787/chat \
  -H 'Origin: http://localhost:8000' \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"What services do you offer?"}]}'
```

A different origin must be rejected:

```bash
curl -i -X POST http://127.0.0.1:8787/chat \
  -H 'Origin: https://example.com' \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Hi"}]}'
```

That response is `403` and has no `Access-Control-Allow-Origin` header.

3. Deployed Worker, from any machine:

```bash
curl -i -X POST https://techphase-chat.techphase-net.workers.dev/chat \
  -H 'Origin: https://techphase.net' \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"What services do you offer?"}]}'
```

An `Origin` of `https://example.com` should come back `403` with no `Access-Control-Allow-Origin` header.

4. Widget: serve the site (`python3 -m http.server 8000`) and open `http://localhost:8000`. `CHAT_WORKER_URL` already points at https://techphase-chat.techphase-net.workers.dev. Use the chat button at the bottom right. Ask what Tech Phase does, then ask for a price. The price answer should refuse to invent a number and offer to collect your name, email, and project details. On a phone-width window, the panel fills the screen, Escape closes it, and a failed request shows `info@techphase.net`.
