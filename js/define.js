/* Tap-to-define (site r52b, Sitewalk QA for the Leader, 2026-11-27; Kyle's Tent choice B).
   The words and their meanings come ONLY from window.DB_WORDS (js/words.js, built from tools/words-r1.json, the same
   list as the "New here?" box). This file has no word list of its own.
   Each element with data-define="<section>" is part of a section. In each section, the first use of each word gets a
   dotted underline: a real <button> (Enter or Space opens it; Esc closes it and returns focus). One popup at a time;
   a tap or click outside closes it; it never runs off-screen. Sections whose text the walkthroughs redraw are marked
   again after each redraw (MutationObserver). Text inside buttons, links, headings and aria-hidden parts is never
   marked (bold keywords can be). No hover, no timers, no outside scripts; text is set with textContent, never as HTML. */
// r52d (walk r52b, 375 px: a popup ran past the right edge and once sat at top -1295): placement is now a pure function in
// viewport coordinates (the popup is position: fixed), measured after the popup is shown, and always clamped on screen.
// Tested with node: tools/test_place_r1.js.
function dwPopWidth(vw) { return Math.max(0, Math.min(320, vw - 16)); }
function dwPlaceCalc(r, pw, ph, vw, vh) {
  var left = Math.max(8, Math.min(r.left, vw - pw - 8));
  var top = r.bottom + 8;                                   // below the word if it fits,
  if (top + ph > vh - 8 && r.top - 8 - ph >= 8) top = r.top - 8 - ph;  // else above it,
  top = Math.max(8, Math.min(top, vh - ph - 8));            // and always on screen (a too-tall popup starts at the top)
  return { left: left, top: top };
}
if (typeof module === "object" && module.exports) module.exports = { placeCalc: dwPlaceCalc, popWidth: dwPopWidth };
(function () {
  if (typeof window === "undefined") return;
  var W = window.DB_WORDS;
  if (!W || !W.length || !document.querySelectorAll || !window.MutationObserver) return;
  var TERMS = W.map(function (e) { return { e: e, rx: new RegExp(e.forms.join("|")) }; });
  var BYID = {}; W.forEach(function (e) { BYID[e.id] = e; });
  // Bold words CAN be marked (a <button> may sit inside <strong>): some bold game keywords need their popup too.
  var SKIP = { BUTTON: 1, A: 1, H1: 1, H2: 1, H3: 1, SUMMARY: 1, SCRIPT: 1, STYLE: 1, svg: 1, SVG: 1 };

  // The one popup.
  var pop = document.createElement("div");
  pop.className = "dw-pop"; pop.id = "dw-pop"; pop.hidden = true; pop.tabIndex = -1;
  pop.setAttribute("role", "dialog"); pop.setAttribute("aria-modal", "false");
  pop.setAttribute("aria-labelledby", "dw-pop-t"); pop.setAttribute("aria-describedby", "dw-pop-x");
  var popT = document.createElement("p"); popT.className = "dw-pop-t"; popT.id = "dw-pop-t";
  var popX = document.createElement("p"); popX.className = "dw-pop-x"; popX.id = "dw-pop-x";
  var popC = document.createElement("button"); popC.type = "button"; popC.className = "dw-close"; popC.textContent = "Close";
  pop.appendChild(popT); pop.appendChild(popX); pop.appendChild(popC);
  document.body.appendChild(pop);
  var openBtn = null;

  function skipped(node, root) {
    for (var n = node.parentNode; n && n !== root.parentNode; n = n.parentNode) {
      if (n.nodeType !== 1) continue;
      if (SKIP[n.nodeName] || n.getAttribute("aria-hidden") === "true" || (n.classList && n.classList.contains("dw"))) return true;
      if (n === root) break;
    }
    return false;
  }
  function textNodes(root) {
    var out = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    for (var t = w.nextNode(); t; t = w.nextNode()) if (t.nodeValue && t.nodeValue.trim() && !skipped(t, root)) out.push(t);
    return out;
  }
  function makeBtn(e, word) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "dw"; b.textContent = word;
    b.setAttribute("data-word", e.id); b.setAttribute("aria-expanded", "false");
    b.setAttribute("aria-controls", "dw-pop"); b.setAttribute("aria-haspopup", "dialog");
    return b;
  }
  // Mark the first use of each word across the elements of one section, in page order.
  function markSection(els) {
    var done = {};
    els.forEach(function (root) {
      textNodes(root).forEach(function (t) {
        var node = t;
        while (node) {
          var best = null;
          TERMS.forEach(function (x) {
            if (done[x.e.id]) return;
            var m = x.rx.exec(node.nodeValue);
            if (m && (!best || m.index < best.m.index)) best = { x: x, m: m };
          });
          if (!best) break;
          done[best.x.e.id] = true;
          var rest = node.splitText(best.m.index);
          var after = rest.splitText(best.m[0].length);
          rest.parentNode.replaceChild(makeBtn(best.x.e, best.m[0]), rest);
          node = after;
        }
      });
    });
  }
  function unmark(els) {
    els.forEach(function (root) {
      [].slice.call(root.querySelectorAll("button.dw")).forEach(function (b) {
        if (b === openBtn) close(false);
        var p = b.parentNode; p.replaceChild(document.createTextNode(b.textContent), b); p.normalize();
      });
    });
  }

  // Sections, in page order.
  var groups = {}, order = [];
  [].slice.call(document.querySelectorAll("[data-define]")).forEach(function (el) {
    // r52d (walk r52b): never mark inside a live region (role=status or aria-live), so a screen reader hears each
    // walkthrough step once, from the walkthrough's own single update. index.html no longer marks those regions; this
    // guard keeps it so if the markup changes later.
    if (el.closest && el.closest("[aria-live],[role=status]")) return;
    var g = el.getAttribute("data-define");
    if (!groups[g]) { groups[g] = []; order.push(g); }
    groups[g].push(el);
  });
  var observers = [];
  function watch(on) {
    observers.forEach(function (o) { if (on) o.ob.observe(o.el, { childList: true, subtree: true, characterData: true }); else o.ob.disconnect(); });
  }
  // Sections the walkthroughs redraw (the goal lines) are marked again after each redraw. Live regions are never marked
  // (see the guard above), so a re-mark never changes what a screen reader announces.
  function remark(g) {
    if (openBtn && !document.body.contains(openBtn)) close(false);  // the redraw removed the open word: close its popup
    watch(false); unmark(groups[g]); markSection(groups[g]); watch(true);
  }
  order.forEach(function (g) {
    markSection(groups[g]);
    groups[g].forEach(function (el) {
      observers.push({ el: el, ob: new MutationObserver(function () { remark(g); }) });
    });
  });
  watch(true);
  [].slice.call(document.querySelectorAll("[data-define-hint]")).forEach(function (p) { p.hidden = false; });

  // Open, place, close.
  function view() {
    var vv = window.visualViewport, de = document.documentElement;
    return { w: Math.min(vv ? vv.width : Infinity, window.innerWidth || Infinity, de.clientWidth || Infinity),
             h: Math.min(vv ? vv.height : Infinity, window.innerHeight || Infinity) };
  }
  function place(btn) {  // called after the popup is shown, so its real size can be measured
    var v = view();
    pop.style.width = dwPopWidth(v.w) + "px";
    var pr = pop.getBoundingClientRect();
    var p = dwPlaceCalc(btn.getBoundingClientRect(), pr.width, pr.height, v.w, v.h);
    pop.style.left = p.left + "px";
    pop.style.top = p.top + "px";
  }
  function open(btn) {
    var e = BYID[btn.getAttribute("data-word")];
    if (!e) return;
    if (openBtn) close(false);
    popT.textContent = e.label; popX.textContent = e.text;
    pop.hidden = false; place(btn);
    btn.setAttribute("aria-expanded", "true"); openBtn = btn;
    try { pop.focus({ preventScroll: true }); } catch (err) { pop.focus(); }
  }
  function close(returnFocus) {
    if (!openBtn) return;
    var b = openBtn; openBtn = null;
    pop.hidden = true; b.setAttribute("aria-expanded", "false");
    if (returnFocus && document.body.contains(b)) { try { b.focus({ preventScroll: true }); } catch (err) { b.focus(); } }
  }
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest ? ev.target.closest("button.dw") : null;
    if (b) { if (b === openBtn) close(true); else open(b); return; }
    if (ev.target === popC) { close(true); }
  });
  // A tap or click outside closes it: pointerdown then pointerup on any element (also where iOS Safari sends no click),
  // but not when the finger moved more than 10 px (that was a scroll, so the popup stays).
  var downAt = null;
  document.addEventListener("pointerdown", function (ev) {
    downAt = (openBtn && !pop.contains(ev.target)) ? { x: ev.clientX, y: ev.clientY } : null;
  });
  document.addEventListener("pointerup", function (ev) {
    if (!downAt || !openBtn) return;
    var moved = Math.abs(ev.clientX - downAt.x) + Math.abs(ev.clientY - downAt.y) > 10;
    downAt = null;
    if (moved || pop.contains(ev.target)) return;
    var b = ev.target.closest ? ev.target.closest("button.dw") : null;
    if (b) return;  // the click handler opens or toggles it
    close(false);
  });
  document.addEventListener("keydown", function (ev) {
    if (openBtn && (ev.key === "Escape" || ev.key === "Esc")) { ev.preventDefault(); close(true); }
  });
  pop.addEventListener("focusout", function (ev) {
    var to = ev.relatedTarget;
    // Tab (or any focus move) to an element outside the popup closes it. A null target is ignored on purpose: Safari does
    // not focus a clicked button, so closing on null would break the Close button and the toggle there.
    if (openBtn && to && !pop.contains(to) && to !== openBtn) close(false);
  });
  // The popup is fixed to the screen, so it follows its word on scroll and resize (and on the phone's visual viewport).
  var rt = 0;
  function replace() { if (openBtn && !rt) rt = requestAnimationFrame(function () { rt = 0; if (openBtn) place(openBtn); }); }
  window.addEventListener("resize", replace);
  window.addEventListener("scroll", replace, { passive: true });
  if (window.visualViewport) { window.visualViewport.addEventListener("resize", replace); window.visualViewport.addEventListener("scroll", replace); }
})();
