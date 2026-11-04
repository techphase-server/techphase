/* Loads gtag.js after js/consent-defaults.js has queued Consent Mode defaults.
   EU-style visitors (window.TP_CONSENT.euStyle: EU/UK/Swiss, unknown timezones,
   and ?consent_region=EU) use Consent Mode basic. This file does not request
   gtag.js, or any other Google host, until Accept or a stored "accepted" choice.
   Everyone else loads immediately. The IP region default in consent-defaults.js
   still applies on that path, before config. */
(function () {
  var ID = "G-7TH4N1HYDP";
  var SRC = "https://www.googletagmanager.com/gtag/js?id=" + ID;
  var started = false;

  function start() {
    if (started || typeof gtag !== "function") return false;
    started = true;
    var script = document.createElement("script");
    script.async = true;
    script.src = SRC;
    (document.head || document.documentElement).appendChild(script);
    gtag("js", new Date());
    if (window.TP_CONSENT && window.TP_CONSENT.debug) gtag("config", ID, { debug_mode: true });
    else gtag("config", ID);
    return true;
  }

  // True only on the call that inserts the tag and sends the config page_view.
  window.TP_LOAD_GA = start;

  var consent = window.TP_CONSENT;
  var eu = !!(consent && consent.euStyle);
  var accepted = !!(consent && consent.stored === "accepted");
  if (!eu || accepted) start();
})();
