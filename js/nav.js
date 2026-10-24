/* Services dropdown (desktop) and Services accordion (mobile menu).
   The same header markup is on the home page, service pages and legal pages. */
(function () {
  var drop = document.querySelector("header .nav-drop");
  if (drop) {
    var btn = drop.querySelector(".nav-drop-btn");
    var panel = drop.querySelector(".nav-sub");
    var links = function () { return Array.prototype.slice.call(panel.querySelectorAll("a")); };
    var setExpanded = function (on) {
      btn.setAttribute("aria-expanded", on ? "true" : "false");
      drop.classList.toggle("is-open", on);
    };
    var blockOpen = false;
    var open = function () {
      if (blockOpen) return;
      drop.classList.remove("is-closed");
      setExpanded(true);
    };
    var close = function (suppress) {
      setExpanded(false);
      drop.classList.toggle("is-closed", !!suppress);
    };
    var focusButtonClosed = function () {
      blockOpen = true;
      close(true);
      btn.focus();
      blockOpen = false;
    };
    var pointerOpenedAt = 0;
    drop.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "touch") return;
      pointerOpenedAt = Date.now();
      open();
    });
    drop.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "touch") return;
      if (panel.contains(document.activeElement)) return;
      close(document.activeElement === btn);
    });
    drop.addEventListener("focusin", open);
    drop.addEventListener("focusout", function (e) {
      if (drop.contains(e.relatedTarget)) return;
      close(false);
    });
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (btn.getAttribute("aria-expanded") === "true") {
        if (Date.now() - pointerOpenedAt < 400) return;
        close(true);
      } else open();
    });
    btn.addEventListener("keydown", function (e) {
      var list = links();
      if (e.key === "ArrowDown" && list.length) { e.preventDefault(); open(); list[0].focus(); }
      else if (e.key === "ArrowUp" && list.length) { e.preventDefault(); open(); list[list.length - 1].focus(); }
      else if (e.key === "Escape") { e.preventDefault(); close(true); }
    });
    panel.addEventListener("keydown", function (e) {
      var list = links();
      if (!list.length) return;
      var i = list.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); list[(i + 1) % list.length].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
      else if (e.key === "Home") { e.preventDefault(); list[0].focus(); }
      else if (e.key === "End") { e.preventDefault(); list[list.length - 1].focus(); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); focusButtonClosed(); }
    });
    panel.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) close(true);
    });
    document.addEventListener("click", function (e) {
      if (!drop.contains(e.target)) close(true);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || btn.getAttribute("aria-expanded") !== "true") return;
      if (panel.contains(document.activeElement)) return;
      focusButtonClosed();
    });
  }

  var acc = document.querySelector("#mn .mn-acc-btn");
  var sub = document.getElementById("mn-services");
  if (acc && sub) {
    acc.addEventListener("click", function () {
      var on = acc.getAttribute("aria-expanded") === "true";
      acc.setAttribute("aria-expanded", on ? "false" : "true");
      sub.hidden = on;
    });
  }
})();
