/* Tech Phase chat widget.
 * The worker origin is window.CHAT_WORKER_URL, set once in js/main.js.
 * This file never contains an API key.
 */
(function () {
  const CHAT_WORKER_URL = window.CHAT_WORKER_URL || "";
  const EMAIL = "info@techphase.net";
  const SUGGESTIONS = ["What services do you offer?", "How do we start?", "I'd like a quote"];
  const CHAT_CSS_HREF = new URL("../css/chat.css", (document.currentScript && document.currentScript.src) || location.href).href;

  function privacyPolicyHref() {
    const path = location.pathname.replace(/index\.html$/, "");
    if (/\/(privacy-policy|terms|refund-policy|cookie-notice|white-label|ai-automation|web-design)\/?$/.test(path)) return "../privacy-policy/";
    return "privacy-policy/";
  }

  function endpoint() {
    const raw = String(CHAT_WORKER_URL || "").trim();
    if (!raw || /YOUR-WORKER/i.test(raw)) return "";
    try {
      const url = new URL(raw);
      const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
      if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) return "";
      return url.origin + url.pathname.replace(/\/$/, "");
    } catch {
      return "";
    }
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function icon(path) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    const shape = document.createElementNS(ns, "path");
    shape.setAttribute("d", path);
    svg.append(shape);
    return svg;
  }

  const chatIcon = () => icon("M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v6A3.5 3.5 0 0 1 15.5 16H10l-4 3.5V16.2A3.5 3.5 0 0 1 5 12.5z");
  const closeIcon = () => icon("M6 6l12 12M18 6 6 18");
  const sendIcon = () => icon("M12 19V5M6 11l6-6 6 6");

  function loadCss() {
    return new Promise((resolve) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CHAT_CSS_HREF;
      link.onload = () => resolve();
      link.onerror = () => resolve();
      document.head.appendChild(link);
    });
  }

  function mailLink() {
    const link = document.createElement("a");
    link.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Project enquiry");
    link.textContent = EMAIL;
    return link;
  }

  let started = false;

  async function init() {
    if (started || document.getElementById("tp-chat")) return;
    started = true;
    await loadCss();
    if (document.getElementById("tp-chat")) return;

    const history = [];
    let open = false;
    let busy = false;
    let pageOverflow = "";

    const root = el("div", "tp-chat");
    root.id = "tp-chat";

    const panel = el("section", "tp-chat-panel");
    panel.id = "tp-chat-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "tp-chat-title");

    const head = el("div", "tp-chat-head");
    const titles = el("div", "tp-chat-titles");
    titles.append(el("p", "tp-chat-kicker", "Tech Phase"));
    const title = el("h2", "", "Ask about a project");
    title.id = "tp-chat-title";
    const aiNote = el("p", "tp-chat-ai");
    const privacyLink = document.createElement("a");
    privacyLink.href = privacyPolicyHref();
    privacyLink.textContent = "Privacy Policy";
    aiNote.append("AI assistant. Please don't share sensitive information. ", privacyLink);
    titles.append(title, aiNote);
    const closeBtn = el("button", "tp-chat-close");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close chat");
    closeBtn.append(closeIcon());
    head.append(titles, closeBtn);

    const log = el("div", "tp-chat-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");
    log.setAttribute("aria-relevant", "additions");

    const suggestions = el("div", "tp-chat-suggestions");
    const note = el("p", "tp-chat-note");
    note.append("Share your email only if you want a follow-up. Or write to ", mailLink(), ".");

    const form = el("form", "tp-chat-form");
    form.setAttribute("aria-label", "Send a message");
    const input = document.createElement("textarea");
    input.id = "tp-chat-input";
    input.rows = 1;
    input.maxLength = 1500;
    input.placeholder = "Ask about a website, app, or quote";
    input.setAttribute("aria-label", "Message");
    input.autocomplete = "off";
    input.enterKeyHint = "send";
    const sendBtn = el("button", "tp-chat-send");
    sendBtn.type = "submit";
    sendBtn.setAttribute("aria-label", "Send message");
    sendBtn.append(sendIcon());
    form.append(input, sendBtn);

    const launcher = el("button", "tp-chat-launcher");
    launcher.type = "button";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "tp-chat-panel");
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.setAttribute("aria-label", "Open chat with Tech Phase");
    launcher.append(chatIcon());

    panel.append(head, log, suggestions, note, form);
    root.append(panel, launcher);
    document.body.append(root);

    function scrollLog() {
      log.scrollTop = log.scrollHeight;
    }

    function autosize() {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 112) + "px";
    }

    function addBubble(className, text) {
      const bubble = el("p", "tp-chat-msg " + className, text);
      log.append(bubble);
      scrollLog();
      return bubble;
    }

    function showFallback(kind) {
      const bubble = el("p", "tp-chat-msg is-error");
      if (kind === "rate") bubble.append("You're sending messages a little quickly. Wait a minute, or email ");
      else if (kind === "offline") bubble.append("The chat assistant isn't connected yet. Email ");
      else bubble.append("I couldn't reply just now. Email ");
      bubble.append(mailLink(), " and the team will reply within one business day.");
      log.append(bubble);
      scrollLog();
    }

    function setTyping(on) {
      const current = log.querySelector(".tp-chat-typing");
      if (current) current.remove();
      if (!on) return;
      const row = el("div", "tp-chat-typing");
      row.setAttribute("role", "status");
      row.append(el("span", "tp-sr", "Tech Phase is typing."));
      row.append(el("i"), el("i"), el("i"));
      log.append(row);
      scrollLog();
    }

    function welcome() {
      addBubble("is-bot", "Hi, I'm Tech Phase's assistant. I can explain our services, how a project starts, and what we need for a quote. What are you looking to build?");
      SUGGESTIONS.forEach((label) => {
        const button = el("button", "", label);
        button.type = "button";
        button.addEventListener("click", () => send(label));
        suggestions.append(button);
      });
    }

    function higherDialogOpen() {
      return ["gl", "md", "mn"].some((id) => {
        const node = document.getElementById(id);
        return node && node.classList.contains("open");
      });
    }

    function lockPage(on) {
      const mobile = window.matchMedia("(max-width: 640px)").matches;
      if (on && mobile) {
        pageOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";
      } else if (!on) {
        document.documentElement.style.overflow = pageOverflow || "";
        pageOverflow = "";
      }
    }

    function focusables() {
      return [...panel.querySelectorAll("button, textarea, a[href]")].filter((node) => {
        if (node.disabled || node.hidden) return false;
        return node.getClientRects().length > 0;
      });
    }

    let greeted = false;
    function openPanel() {
      if (open) return;
      open = true;
      panel.hidden = false;
      root.classList.add("is-open");
      launcher.setAttribute("aria-expanded", "true");
      launcher.setAttribute("aria-label", "Close chat");
      launcher.replaceChildren(closeIcon());
      lockPage(true);
      if (!greeted) {
        greeted = true;
        welcome();
      }
      input.focus({ preventScroll: true });
    }

    function closePanel() {
      if (!open) return;
      open = false;
      panel.hidden = true;
      root.classList.remove("is-open");
      launcher.setAttribute("aria-expanded", "false");
      launcher.setAttribute("aria-label", "Open chat with Tech Phase");
      launcher.replaceChildren(chatIcon());
      lockPage(false);
      launcher.focus({ preventScroll: true });
    }

    async function send(text) {
      const content = String(text || "").trim();
      if (!content || busy) return;
      if (content.length > 1500) {
        addBubble("is-user", content.slice(0, 1500));
        showFallback("error");
        return;
      }
      suggestions.hidden = true;
      addBubble("is-user", content);
      input.value = "";
      autosize();
      const base = endpoint();
      if (!base) {
        showFallback("offline");
        return;
      }
      history.push({ role: "user", content });
      while (history.length > 12) history.shift();
      busy = true;
      sendBtn.disabled = true;
      setTyping(true);
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(base + "/chat", {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({ messages: history.slice(-12) }),
          signal: controller.signal,
        });
        let data = null;
        try { data = await response.json(); } catch { data = null; }
        if (response.status === 429) {
          history.pop();
          showFallback("rate");
        } else if (!response.ok || !data || typeof data.reply !== "string" || !data.reply.trim()) {
          history.pop();
          showFallback("error");
        } else {
          const reply = data.reply.trim().slice(0, 4000);
          history.push({ role: "assistant", content: reply });
          while (history.length > 12) history.shift();
          addBubble("is-bot", reply);
        }
      } catch {
        history.pop();
        showFallback("error");
      } finally {
        window.clearTimeout(timer);
        busy = false;
        sendBtn.disabled = false;
        setTyping(false);
      }
    }

    launcher.addEventListener("click", () => { if (open) closePanel(); else openPanel(); });
    closeBtn.addEventListener("click", closePanel);
    input.addEventListener("input", autosize);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      send(input.value);
    });
    document.addEventListener("keydown", (event) => {
      if (!open) return;
      if (event.key === "Escape") {
        if (higherDialogOpen()) return;
        event.preventDefault();
        closePanel();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = focusables();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

  }

  function boot() {
    const start = () => {
      if (window.requestIdleCallback) window.requestIdleCallback(() => { init(); }, { timeout: 1500 });
      else window.setTimeout(init, 300);
    };
    if (!document.getElementById("ld")) {
      start();
      return;
    }
    const observer = new MutationObserver(() => {
      if (!document.getElementById("ld")) {
        observer.disconnect();
        start();
      }
    });
    observer.observe(document.body, { childList: true });
    window.setTimeout(() => {
      observer.disconnect();
      start();
    }, 4000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
