/* Cookie banner. Defaults are set in js/consent-defaults.js before gtag.js loads.
   window.TP_CONSENT.euStyle chooses the banner: EU/UK (unchanged Accept / Reject)
   or the US / rest-of-world opt-out banner. The time-zone mapping lives next to
   the gtag region list in consent-defaults.js. */
(function () {
  var KEY = "tp-cookie-consent";
  var banner = null;
  var opener = null;
  var usPanel = null;
  var euPanel = null;
  var usDesc = null;
  var view = "eu";

  function state() {
    return window.TP_CONSENT || { euStyle: true, gpc: false, analyticsDefault: "denied", stored: "" };
  }

  // Root-absolute. 404.html is served at the missing URL, so a relative prefix breaks there.
  function pagePrefix() {
    return "/";
  }

  function readChoice() {
    try {
      var value = localStorage.getItem(KEY);
      return value === "accepted" || value === "rejected" ? value : "";
    } catch (e) {
      return "";
    }
  }

  function writeChoice(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (e) {}
    if (window.TP_CONSENT) window.TP_CONSENT.stored = value;
  }

  function consentState(choice) {
    return {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: choice === "accepted" ? "granted" : "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "denied"
    };
  }

  function clearGaCookies() {
    var host = location.hostname;
    var domains = ["", host];
    if (host.indexOf(".") !== -1) domains.push("." + host);
    var parts = host.split(".");
    if (parts.length > 2) domains.push("." + parts.slice(-2).join("."));
    document.cookie.split(";").forEach(function (part) {
      var name = part.split("=")[0].replace(/^\s+/, "");
      if (name !== "_ga" && name.indexOf("_ga_") !== 0) return;
      domains.forEach(function (domain) {
        document.cookie = name + "=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + (domain ? "; domain=" + domain : "");
      });
    });
  }

  function analyticsAlreadyOn(prev) {
    if (prev === "accepted") return true;
    if (prev === "rejected") return false;
    return state().analyticsDefault === "granted";
  }

  function applyChoice(choice) {
    var prev = readChoice();
    var wasOn = analyticsAlreadyOn(prev);
    writeChoice(choice);
    if (typeof gtag === "function") {
      gtag("consent", "update", consentState(choice));
      if (choice === "accepted" && !wasOn) gtag("event", "page_view");
    }
    if (choice !== "accepted") {
      clearGaCookies();
      setTimeout(clearGaCookies, 800);
    }
    var status = document.getElementById("ck-status");
    if (status) status.textContent = choice === "accepted" ? "Analytics cookies accepted." : "Analytics cookies rejected.";
  }

  function usCopy() {
    var gpcOff = state().gpc === true && readChoice() !== "accepted";
    if (gpcOff) {
      return "Your browser's Global Privacy Control signal is on, so analytics stays off. We don't sell your personal information or use it for ads.";
    }
    return "We use analytics cookies to understand how people use our site. We don't sell your personal information or use it for ads.";
  }

  function showView(next) {
    view = next;
    if (usPanel) usPanel.hidden = next !== "us";
    if (euPanel) euPanel.hidden = next !== "eu";
    if (!banner) return;
    banner.setAttribute("aria-labelledby", next === "us" ? "ck-us-title" : "ck-title");
    banner.setAttribute("aria-describedby", next === "us" ? "ck-us-desc" : "ck-desc");
    if (next === "us" && usDesc) usDesc.textContent = usCopy();
    var card = banner.querySelector(".ck-card");
    if (card) card.classList.toggle("ck-card-us", next === "us");
  }

  function openBanner(fromUser) {
    if (!banner) return;
    showView(state().euStyle ? "eu" : "us");
    banner.hidden = false;
    if (fromUser) {
      opener = document.activeElement;
      banner.focus();
    }
  }

  function closeBanner() {
    if (!banner) return;
    banner.hidden = true;
    if (opener && typeof opener.focus === "function") opener.focus();
    opener = null;
  }

  function buildEu() {
    euPanel = document.createElement("div");
    euPanel.className = "ck-panel";
    euPanel.hidden = true;

    var title = document.createElement("p");
    title.id = "ck-title";
    title.className = "ck-kicker";
    title.textContent = "Cookies";

    var desc = document.createElement("p");
    desc.id = "ck-desc";
    desc.append("We use Google Analytics to understand how this site is used. Analytics cookies are set only if you accept. We do not use advertising cookies. Read the ");
    var notice = document.createElement("a");
    var prefix = pagePrefix();
    notice.href = prefix + "cookie-notice/";
    notice.textContent = "Cookie Notice";
    var policy = document.createElement("a");
    policy.href = prefix + "privacy-policy/";
    policy.textContent = "Privacy Policy";
    desc.append(notice, " and ", policy, ".");

    var actions = document.createElement("div");
    actions.className = "ck-actions";

    var reject = document.createElement("button");
    reject.type = "button";
    reject.className = "ck-btn";
    reject.id = "ck-reject";
    reject.textContent = "Reject";

    var accept = document.createElement("button");
    accept.type = "button";
    accept.className = "ck-btn";
    accept.id = "ck-accept";
    accept.textContent = "Accept";

    reject.addEventListener("click", function () {
      applyChoice("rejected");
      closeBanner();
    });
    accept.addEventListener("click", function () {
      applyChoice("accepted");
      closeBanner();
    });

    actions.append(reject, accept);
    euPanel.append(title, desc, actions);
    return euPanel;
  }

  function buildUs() {
    usPanel = document.createElement("div");
    usPanel.className = "ck-panel";
    usPanel.hidden = true;

    var title = document.createElement("p");
    title.id = "ck-us-title";
    title.className = "ck-kicker";
    title.textContent = "Cookies";

    usDesc = document.createElement("p");
    usDesc.id = "ck-us-desc";
    usDesc.textContent = usCopy();

    var actions = document.createElement("div");
    actions.className = "ck-actions ck-actions-us";

    var ok = document.createElement("button");
    ok.type = "button";
    ok.className = "ck-btn";
    ok.id = "ck-ok";
    ok.textContent = "OK";

    var off = document.createElement("button");
    off.type = "button";
    off.className = "ck-btn";
    off.id = "ck-off";
    off.textContent = "Turn off analytics";

    var settings = document.createElement("button");
    settings.type = "button";
    settings.className = "ck-btn";
    settings.id = "ck-settings";
    settings.textContent = "Cookie settings";

    ok.addEventListener("click", function () {
      // OK keeps analytics on. With Global Privacy Control and no prior accept,
      // analytics is already off, so OK leaves it off.
      if (state().gpc === true && readChoice() !== "accepted") applyChoice("rejected");
      else applyChoice("accepted");
      closeBanner();
    });
    off.addEventListener("click", function () {
      applyChoice("rejected");
      closeBanner();
    });
    settings.addEventListener("click", function () {
      showView("eu");
      var reject = document.getElementById("ck-reject");
      if (reject) reject.focus();
    });

    actions.append(ok, off, settings);
    usPanel.append(title, usDesc, actions);
    return usPanel;
  }

  function build() {
    banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.className = "ck";
    banner.hidden = true;
    banner.tabIndex = -1;
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "false");
    banner.setAttribute("aria-labelledby", "ck-title");
    banner.setAttribute("aria-describedby", "ck-desc");

    var card = document.createElement("div");
    card.className = "ck-card";
    card.append(buildUs(), buildEu());

    var status = document.createElement("p");
    status.id = "ck-status";
    status.className = "sr";
    status.setAttribute("role", "status");
    if (state().gpc === true && readChoice() !== "accepted") status.textContent = "Analytics is off.";

    banner.append(card, status);
    document.body.appendChild(banner);

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || banner.hidden) return;
      if (readChoice()) {
        closeBanner();
        return;
      }
      if (!state().euStyle && view === "eu") showView("us");
    });
  }

  function onSettingsClick(e) {
    var link = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!link) return;
    var href = link.getAttribute("href") || "";
    var hashAt = href.indexOf("#cookie-settings");
    if (hashAt === -1) return;
    var path = href.slice(0, hashAt);
    if (path && path !== location.pathname) return;
    e.preventDefault();
    openBanner(true);
  }

  build();
  document.addEventListener("click", onSettingsClick);
  if (readChoice() === "rejected") {
    clearGaCookies();
    setTimeout(clearGaCookies, 800);
  }
  if (location.hash === "#cookie-settings" || !readChoice()) openBanner(location.hash === "#cookie-settings");
})();
