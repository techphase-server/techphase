/* Consent Mode v2 defaults. Loaded synchronously before gtag.js so the defaults are queued before config. */
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

(function () {
  var EU_REGION = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","GB","CH"];

  // GitHub Pages does not send geo headers, so the banner (and the client-side
  // default below) use the IANA time zone to stay as close as possible to the
  // gtag region list above:
  //   Europe/* covers the EU, EEA, UK and Switzerland (Europe/London,
  //   Europe/Berlin, Europe/Zurich, Europe/Lisbon, and the rest of that set).
  //   Atlantic zones used by those countries but outside Europe/*:
  //     Atlantic/Reykjavik (Iceland), Atlantic/Canary (Spain),
//     Atlantic/Madeira and Atlantic/Azores (Portugal), Atlantic/Faroe
//     (Faroe Islands; browsers report the canonical name Atlantic/Faeroe).
//     Africa/Ceuta (Spain) and Arctic/Longyearbyen (Svalbard, Norway)
//     are included for the same reason.
  //   A missing zone, or an unspecific one (UTC, GMT, Etc/*), is treated as
  //   EU-style. That is the stricter default when the region is unsure.
  var EU_ZONES = {
    "Atlantic/Reykjavik": 1,
    "Atlantic/Canary": 1,
    "Atlantic/Madeira": 1,
    "Atlantic/Azores": 1,
    "Atlantic/Faroe": 1,
    "Atlantic/Faeroe": 1,
    "Africa/Ceuta": 1,
    "Arctic/Longyearbyen": 1
  };

  function isProdHost() {
    var host = location.hostname;
    return host === "techphase.net" || host === "www.techphase.net";
  }

  function euFromTimezone() {
    var tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { return true; }
    if (!tz) return true;
    if (tz.indexOf("Europe/") === 0) return true;
    if (EU_ZONES[tz]) return true;
    if (tz === "UTC" || tz === "GMT" || tz === "UCT" || tz.indexOf("Etc/") === 0) return true;
    return false;
  }

  var prod = isProdHost();
  var preview = "";
  // ?consent_region=EU|US is a preview hook. It is not read on the production hostname.
  if (!prod) {
    try {
      var param = new URLSearchParams(location.search).get("consent_region");
      if (param === "EU" || param === "US") preview = param;
    } catch (e) {}
  }

  var euStyle = euFromTimezone();
  if (preview === "EU") euStyle = true;
  if (preview === "US") euStyle = false;

  var gpc = false;
  try { gpc = navigator.globalPrivacyControl === true; } catch (e) { gpc = false; }

  // Rest-of-world default is analytics on. EU-style zones, the EU preview hook,
  // and Global Privacy Control keep analytics denied (GPC includes the US).
  var analytics = "granted";
  if (euStyle || gpc) analytics = "denied";

  // Region default FIRST, then the global default (no region).
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    region: EU_REGION
  });
  gtag("consent", "default", {
    analytics_storage: analytics,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  gtag("set", "ads_data_redaction", true);

  var stored = "";
  try { stored = localStorage.getItem("tp-cookie-consent") || ""; } catch (e) { stored = ""; }
  // A stored choice overrides the defaults, including a Global Privacy Control denial.
  if (stored === "accepted" || stored === "rejected") {
    gtag("consent", "update", {
      analytics_storage: stored === "accepted" ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }
  // A saved rejection must not leave analytics cookies in place for the hit.
  if (stored === "rejected") {
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

  window.TP_CONSENT = {
    euStyle: euStyle,
    gpc: gpc,
    analyticsDefault: analytics,
    prod: prod,
    debug: !prod,
    stored: stored === "accepted" || stored === "rejected" ? stored : ""
  };
})();
