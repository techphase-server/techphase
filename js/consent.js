/* Cookie banner and Consent Mode updates. The default denied state is set in index.html before gtag.js. */
(function () {
  var KEY = "tp-cookie-consent";
  var banner = null;
  var opener = null;

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

  function applyChoice(choice) {
    writeChoice(choice);
    if (typeof gtag === "function") {
      gtag("consent", "update", consentState(choice));
      if (choice === "accepted") gtag("event", "page_view");
    }
    if (choice !== "accepted") {
      clearGaCookies();
      setTimeout(clearGaCookies, 800);
    }
    var status = document.getElementById("ck-status");
    if (status) status.textContent = choice === "accepted" ? "Analytics cookies accepted." : "Analytics cookies rejected.";
  }

  function openBanner(fromUser) {
    if (!banner) return;
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

    var title = document.createElement("p");
    title.id = "ck-title";
    title.className = "ck-kicker";
    title.textContent = "Cookies";

    var desc = document.createElement("p");
    desc.id = "ck-desc";
    desc.append("We use Google Analytics to understand how this site is used. Analytics cookies are set only if you accept. We do not use advertising cookies. Read the ");
    var notice = document.createElement("a");
    notice.href = "cookie-notice/";
    notice.textContent = "Cookie Notice";
    var policy = document.createElement("a");
    policy.href = "privacy-policy/";
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

    var status = document.createElement("p");
    status.id = "ck-status";
    status.className = "sr";
    status.setAttribute("role", "status");

    actions.append(reject, accept);
    card.append(title, desc, actions);
    banner.append(card, status);
    document.body.appendChild(banner);

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || banner.hidden || !readChoice()) return;
      closeBanner();
    });
  }

  function onSettingsClick(e) {
    var link = e.target.closest ? e.target.closest("a[href='#cookie-settings']") : null;
    if (!link) return;
    e.preventDefault();
    openBanner(true);
  }

  build();
  document.addEventListener("click", onSettingsClick);
  if (location.hash === "#cookie-settings" || !readChoice()) openBanner(location.hash === "#cookie-settings");
})();
