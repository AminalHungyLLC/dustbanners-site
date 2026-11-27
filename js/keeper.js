/* The Keeper's board on phones (site r52d; Kyle approved the Leader's plan: "Ok that all sounds good to me").
   A small pinned tab at the top of the Game section opens a bottom sheet with the board's notes as a sideways stack. The
   notes are CLONED from the desktop board (#game .margin), so there is one source of truth. The sheet is a modal dialog:
   focus moves to Close and is trapped inside (a word popup from define.js may take focus too); it closes on Close, Esc,
   a tap outside, or a swipe down from the top of the sheet; focus then returns to the tab. Motion (the rise, the one-time
   flutter, the pin wiggle) is CSS, gated by the Motion switch and reduced-motion. No scroll triggers: nothing here
   watches the page scroll. No timers. */
(function () {
  if (!document.querySelector) return;
  var tab = document.querySelector(".kb-tab"), sheet = document.getElementById("kb-sheet"), back = document.querySelector(".kb-back");
  if (!tab || !sheet || !back) return;
  var stack = sheet.querySelector(".kb-stack"), closeBtn = sheet.querySelector(".kb-close");
  var prev = sheet.querySelector(".kb-prev"), next = sheet.querySelector(".kb-next");
  var count = sheet.querySelector(".kb-count"), dots = sheet.querySelector(".kb-dots");
  var built = false, fluttered = false, last = null, at = 0;

  function build() {
    if (built) return;
    built = true;
    [].slice.call(document.querySelectorAll("#game .margin > .scrap")).forEach(function (n) {
      var c = n.cloneNode(true), li = document.createElement("li");
      // Walk BLOCKER (r52d): site.css hides any .scrap without "in" while motion is on (html.anim .scrap:not(.in)), and
      // site.js only gives "in" to the notes present at load. The sheet's copies are made later, so they get it here.
      c.classList.add("in");
      [].slice.call(c.querySelectorAll("[data-define]")).forEach(function (el) { el.removeAttribute("data-define"); });
      [].slice.call(c.querySelectorAll("[aria-expanded]")).forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
      [].slice.call(c.querySelectorAll("details[open]")).forEach(function (d) { d.open = false; });
      li.appendChild(c);
      stack.appendChild(li);
    });
    if (dots) for (var i = 0; i < stack.children.length; i++) dots.appendChild(document.createElement("span"));
    update(true);
  }
  // Navigation (the Leader: a first-timer won't know to swipe, and keyboard users can't reach note 2): Previous and Next
  // move one note; "1 of 4" and the dots follow the stack, whether moved by the buttons or by a swipe.
  function items() { return [].slice.call(stack.children); }
  function update(force) {
    var li = items(), n = li.length;
    if (!n) return;
    var step = n > 1 ? li[1].offsetLeft - li[0].offsetLeft : 1;
    var i = Math.max(0, Math.min(n - 1, Math.round(stack.scrollLeft / (step || 1))));
    if (i === at && !force) return;
    at = i;
    if (count) count.textContent = (i + 1) + " of " + n;
    if (dots) [].slice.call(dots.children).forEach(function (d, k) { d.className = k === i ? "on" : ""; });
    if (prev) prev.disabled = i === 0;
    if (next) next.disabled = i === n - 1;
  }
  function go(d) {
    var li = items(), i = Math.max(0, Math.min(li.length - 1, at + d));
    if (!li.length) return;
    var smooth = document.documentElement.classList.contains("anim") && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    stack.scrollTo({ left: li[i].offsetLeft - li[0].offsetLeft, behavior: smooth ? "smooth" : "auto" });
    at = i; update(true);
  }
  if (prev) prev.addEventListener("click", function () { go(-1); });
  if (next) next.addEventListener("click", function () { go(1); });
  var tick = 0;
  stack.addEventListener("scroll", function () { if (!tick) tick = requestAnimationFrame(function () { tick = 0; update(false); }); }, { passive: true });
  function focusables() {
    return [].slice.call(sheet.querySelectorAll('button, [href], summary, [tabindex]:not([tabindex="-1"])'))
      .filter(function (el) { return el.offsetParent !== null && !el.disabled && !el.closest("[hidden]"); });
  }
  function focus(el) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
  function open() {
    build();
    last = document.activeElement;
    back.hidden = false;
    sheet.hidden = false;
    tab.setAttribute("aria-expanded", "true");
    if (!fluttered) { sheet.classList.add("kb-in"); fluttered = true; }  // A: once, on the first open only
    document.documentElement.classList.add("kb-open");
    sheet.scrollTop = 0;
    focus(closeBtn);
  }
  function close() {
    if (sheet.hidden) return;
    sheet.hidden = true;
    back.hidden = true;
    tab.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("kb-open");
    focus(last && document.body.contains(last) && last !== document.body ? last : tab);
  }
  tab.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  back.addEventListener("click", close);
  document.addEventListener("keydown", function (ev) {
    if (sheet.hidden || ev.defaultPrevented) return;  // define.js handles Esc first when a word popup is open
    if (ev.key === "Escape" || ev.key === "Esc") { ev.preventDefault(); close(); return; }
    if (ev.key !== "Tab") return;
    var pop = document.getElementById("dw-pop"), a = document.activeElement;
    if (pop && !pop.hidden && pop.contains(a)) return;  // inside a word popup: let it handle its own focus
    var f = focusables();
    if (!f.length) return;
    if (ev.shiftKey && (a === f[0] || !sheet.contains(a))) { ev.preventDefault(); focus(f[f.length - 1]); }
    else if (!ev.shiftKey && (a === f[f.length - 1] || !sheet.contains(a))) { ev.preventDefault(); focus(f[0]); }
  });
  // Swipe down from the top of the sheet closes it (a sideways swipe moves the stack; a scroll inside the sheet is left alone).
  var sx = 0, sy = 0, from = false;
  sheet.addEventListener("touchstart", function (ev) {
    var t = ev.touches[0];
    from = sheet.scrollTop <= 0 && !ev.target.closest(".kb-stack");
    sx = t.clientX; sy = t.clientY;
  }, { passive: true });
  sheet.addEventListener("touchend", function (ev) {
    if (!from) return;
    var t = ev.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    from = false;
    if (dy > 70 && Math.abs(dy) > Math.abs(dx) * 1.5) close();
  }, { passive: true });
})();
