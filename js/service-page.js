/* Tech Phase service pages (/ai-automation/, /web-design/).
 * The homepage js/main.js is homepage-only (it expects #sv, #hc, #cv and so on),
 * so service pages load this small file instead. The lead flow below mirrors
 * postLead()/bindLead() in js/main.js: same worker /lead route, same JSON body,
 * same honeypot, same 20s timeout and the same GA4 events.
 * Analytics events carry form id, service and link type only. Never name, email, phone or message.
 */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var CHAT_WORKER_URL = "https://techphase-chat.techphase-net.workers.dev";
  window.CHAT_WORKER_URL = CHAT_WORKER_URL;
  var MAIL = "info@techphase.net";
  var LEAD_URL = CHAT_WORKER_URL.replace(/\/$/, "") + "/lead";

  // Must match SERVICES in js/main.js and chat-worker/src/index.js (the worker rejects anything else).
  var S = ["Business Consulting", "Web Development", "E-commerce", "Mobile App Development", "UI/UX Design", "Digital Marketing & SEO",
    "Branding & Graphic Design", "Video Editing & UGC Ads", "2D/3D Animation", "AI Automation"];
  // form_id values used by service pages (homepage uses cf and mq).
  var FORM_IDS = ["wl", "ai", "wd"];

  var CC = [["Afghanistan",93],["Australia",61],["Bahrain",973],["Bangladesh",880],["Belgium",32],["Brazil",55],["Canada",1],["China",86],["Denmark",45],["Egypt",20],["France",33],["Germany",49],["Hong Kong",852],["India",91],["Indonesia",62],["Iran",98],["Iraq",964],["Ireland",353],["Italy",39],["Japan",81],["Jordan",962],["Kenya",254],["Kuwait",965],["Lebanon",961],["Malaysia",60],["Morocco",212],["Netherlands",31],["New Zealand",64],["Nigeria",234],["Norway",47],["Oman",968],["Pakistan",92],["Philippines",63],["Poland",48],["Qatar",974],["Russia",7],["Saudi Arabia",966],["Singapore",65],["South Africa",27],["South Korea",82],["Spain",34],["Sri Lanka",94],["Sweden",46],["Switzerland",41],["Thailand",66],["Turkey",90],["UAE",971],["United Kingdom",44],["United States",1]];

  // Service select: same list as the homepage, with the page's default pre-selected (data-default).
  $$("select.sel").forEach(function (x) {
    var def = x.getAttribute("data-default") || "";
    x.innerHTML = '<option value="" disabled' + (def ? "" : " selected") + '>Select a service</option>' +
      S.concat(["Other"]).map(function (v) { return "<option" + (v === def ? " selected" : "") + ">" + v.replace(/&/g, "&amp;") + "</option>"; }).join("");
  });
  // Country code select: same behaviour as the homepage (short code shown when closed).
  $$(".ccs").forEach(function (s) {
    s.innerHTML = CC.map(function (c) { return '<option value="+' + c[1] + '" data-f="+' + c[1] + " " + c[0] + '"' + (c[0] === "United States" ? " selected" : "") + ">+" + c[1] + " " + c[0] + "</option>"; }).join("");
    var full = function () { Array.prototype.forEach.call(s.options, function (o) { o.textContent = o.getAttribute("data-f"); }); };
    var sh = function () { full(); s.selectedOptions[0].textContent = s.value; };
    s.addEventListener("mousedown", full); s.addEventListener("focus", full);
    s.addEventListener("change", sh); s.addEventListener("blur", sh); sh();
  });

  // Mobile menu
  var lock = function (b) { document.documentElement.style.overflow = b ? "hidden" : ""; };
  var mn = $("#mn"), mb = $("#mb");
  if (mn && mb) {
    var open = function () { mn.classList.add("open"); mb.setAttribute("aria-expanded", "true"); lock(1); };
    var close = function () { mn.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); lock(0); };
    mb.addEventListener("click", open);
    var mx = $("#mx"); if (mx) mx.addEventListener("click", close);
    $$("a", mn).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && mn.classList.contains("open")) close(); });
  }

  // GA4
  function gaEvent(name, params) {
    try {
      if (typeof gtag !== "function") return;
      var c = window.TP_CONSENT;
      // Basic mode: don't queue hits that would flush once the visitor accepts.
      if (c && c.euStyle && c.stored !== "accepted") return;
      gtag("event", name, params);
    } catch (e) {}
  }
  var val = function (f, n) { var el = f.elements[n]; return el ? String(el.value).trim() : ""; };
  function leadEvent(f) {
    var form_id = f && FORM_IDS.indexOf(f.id) !== -1 ? f.id : "";
    if (!form_id) return;
    var service = val(f, "service"), params = { form_id: form_id };
    if (S.indexOf(service) !== -1 || service === "Other") params.service = service;
    gaEvent("generate_lead", params);
  }
  function contactLinkType(href) {
    var raw = String(href || "").trim();
    if (/^mailto:/i.test(raw)) return "email";
    if (/^tel:/i.test(raw)) return "phone";
    if (/^whatsapp:/i.test(raw)) return "whatsapp";
    var host = "";
    try { host = new URL(raw).hostname.toLowerCase().replace(/^www\./, ""); } catch (e) { return ""; }
    if (host === "wa.me" || host.slice(-6) === ".wa.me" || host === "whatsapp.com" || host.slice(-13) === ".whatsapp.com") return "whatsapp";
    return "";
  }
  document.addEventListener("click", function (e) {
    var n = e.target && e.target.closest ? e.target : e.target && e.target.parentElement;
    var a = n && n.closest ? n.closest("a[href]") : null;
    if (!a) return;
    var link_type = contactLinkType(a.href);
    if (link_type) gaEvent("contact_click", { link_type: link_type });
  });

  // Lead form (same flow as postLead/bindLead in js/main.js)
  var setSending = function (f, on) {
    var b = f.querySelector('button[type="submit"]'); if (!b) return;
    if (on) { b.dataset.label = b.innerHTML; b.disabled = true; b.setAttribute("aria-busy", "true"); b.textContent = "Sending…"; }
    else { b.disabled = false; b.removeAttribute("aria-busy"); if (b.dataset.label) b.innerHTML = b.dataset.label; }
  };
  var clearErr = function (f) { var el = f.querySelector("[data-error]"); if (!el) return; el.hidden = true; el.replaceChildren(); };
  var showErr = function (f) {
    var el = f.querySelector("[data-error]"); if (!el) return;
    el.hidden = true; el.replaceChildren();
    var a = document.createElement("a"); a.href = "mailto:" + MAIL; a.textContent = MAIL;
    el.append("Something went wrong and your request wasn't sent. Please email ", a, "."); el.hidden = false;
  };
  var focusStatus = function (root) { var h = root.querySelector("h2"); if (!h) return; h.tabIndex = -1; h.focus(); };

  async function postLead(f, source, signal) {
    if (val(f, "_honey")) return true;
    var res = await fetch(LEAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      signal: signal,
      body: JSON.stringify({ name: val(f, "name"), email: val(f, "email"), phone: (val(f, "country_code") + " " + val(f, "phone")).trim(), service: val(f, "service"), project: val(f, "project"), source: source, _honey: "" })
    });
    var data = null; try { data = await res.json(); } catch (e) { data = null; }
    var ok = !!(res.ok && data && data.ok === true);
    if (ok) leadEvent(f);
    return ok;
  }
  function bindLead(f, source, onOk) {
    f.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (f.dataset.sending === "1") return;
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var token = {}; f._req = token; f.dataset.sending = "1"; clearErr(f); setSending(f, true);
      var ac = new AbortController(); f._abort = ac;
      var timer = setTimeout(function () { ac.abort(); }, 20000);
      var ok = false;
      try { ok = await postLead(f, source, ac.signal); } catch (err) { ok = false; }
      clearTimeout(timer);
      if (f._req !== token) return;
      f.dataset.sending = ""; setSending(f, false);
      if (ok) { f.reset(); var c = f.querySelector(".ccs"); if (c) c.dispatchEvent(new Event("blur")); onOk(f); }
      else showErr(f);
    });
  }
  $$("form[data-lead]").forEach(function (f) {
    // The worker only accepts sources "Contact form" and "Start a project" today.
    // Keep data-source="Contact form" until the optional worker patch (worker-sources.patch) is deployed.
    bindLead(f, f.getAttribute("data-source") || "Contact form", function (form) {
      form.querySelector("[data-fields]").style.display = "none";
      var done = form.querySelector("[data-success]"); done.style.display = "block"; focusStatus(done);
    });
    var again = f.querySelector("[data-again]");
    if (again) again.addEventListener("click", function () {
      f.querySelector("[data-success]").style.display = "none";
      f.querySelector("[data-fields]").style.display = "flex"; clearErr(f);
    });
  });
})();
