/* Dustbanners site r41: the three switches (AI art, Light/Dark, Motion), the phone menu, and notes and bills that settle in once.
   Same storage keys as the live site, so a visitor's earlier choices carry over. No outside scripts. */
(function () {
  var root = document.documentElement;
  function $(id) { return document.getElementById(id); }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // AI art switch (Kyle 2026-10-14): hides every AI-made placeholder picture and shows its twin. Since r41l it starts Off:
  // the twin cards show unless this visitor chose "on" before (Kyle, Tent site-human-made-line-01). Same storage key as before.
  // Since r41m the twins carry Kyle's own adjusted photos, not an empty art box (Kyle, 2026-11-17: "For AI Art Off, can you replace it with my photos?").
  var abtn = $("art-toggle");
  try { if (localStorage.getItem("dustbanners-ai-art") === "on") root.classList.add("art-on"); } catch (e) {}
  function showArt() { if (abtn) abtn.textContent = root.classList.contains("art-on") ? "AI art: On" : "AI art: Off"; }
  if (abtn) abtn.addEventListener("click", function () {
    root.classList.toggle("art-on");
    root.classList.remove("art-off");
    store("dustbanners-ai-art", root.classList.contains("art-on") ? "on" : "off");
    showArt();
  });
  showArt();

  // Light/Dark switch: starts from the device setting; a click picks the other look and remembers it on this device.
  var tbtn = $("theme-toggle"), dark = window.matchMedia("(prefers-color-scheme: dark)");
  function isDark() {
    if (root.classList.contains("theme-dark")) return true;
    if (root.classList.contains("theme-light")) return false;
    return dark.matches;
  }
  function showTheme() { if (tbtn) tbtn.textContent = isDark() ? "Light mode" : "Dark mode"; }
  if (tbtn) tbtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add("theme-" + next);
    store("dustbanners-theme", next);
    showTheme();
  });
  if (dark.addEventListener) dark.addEventListener("change", showTheme);
  showTheme();

  // Motion switch (Kyle's rule: every automatic behavior gets a setting). Phones get motion too (Kyle, 2026-11-16);
  // only a device or browser that asks for reduced motion, or the switch set to Off, stays still.
  var mbtn = $("motion-toggle"), mnote = $("motion-note");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  function forcedStill() { return reduce.matches; }
  function showMotion() {
    var off = root.classList.contains("motion-off") || forcedStill();
    root.classList.toggle("anim", !off);
    if (mbtn) mbtn.textContent = "Motion: " + (off ? "Off" : "On");
  }
  if (mbtn) mbtn.addEventListener("click", function () {
    if (forcedStill()) {
      if (mnote) mnote.textContent = "Motion stays off because your device asks for less motion.";
      return;
    }
    root.classList.toggle("motion-off");
    store("dustbanners-motion", root.classList.contains("motion-off") ? "off" : "on");
    if (mnote) mnote.textContent = "";
    showMotion();
  });
  if (reduce.addEventListener) reduce.addEventListener("change", showMotion);
  showMotion();

  // Keeper's notes and posted bills arrive once as they come into view (only while motion is on; CSS decides).
  // Items that come into view together start one after another: 200 ms, then 150 ms apart (at most 800 ms).
  // The hero map's river draws once the map is a quarter in view, so a phone sees it (Kyle, 2026-11-16).
  var settle = [].slice.call(document.querySelectorAll(".scrap, .bill, .map")), quietAt = 0;
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      var n = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting || e.intersectionRatio < (e.target.classList.contains("map") ? 0.25 : 0.15)) return;
        var wait = Math.min(200 + 150 * n++, 800);
        e.target.style.setProperty("--d", wait + "ms");
        quietAt = Math.max(quietAt, Date.now() + wait + 900);  // a phone tag never swings while something is arriving
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { threshold: [0.15, 0.25] });
    settle.forEach(function (n) { io.observe(n); });
  } else {
    settle.forEach(function (n) { n.classList.add("in"); });
  }

  // Phone tags (r41l). Kyle: "what if the tiny posted note with the nail was small, but it wiggled so people can tap it".
  // Only one thing moves at a time: a tag in view swings once, only while motion is on, while nothing is arriving, and while
  // no looping motion is in view (the map, a floating bill, the demo's next button). At most one swing every 6 to 10 seconds,
  // two per tag, never again once it has been opened, and only on narrow screens; the loop stops when no tag can swing.
  // The tap itself needs no script (it is a details element).
  var tags = [].slice.call(document.querySelectorAll(".tag-note > details"));
  var loopers = [].slice.call(document.querySelectorAll(".map, .bill.float, #d-go"));
  if (tags.length && "IntersectionObserver" in window) {
    var seen = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target._v = e.isIntersecting && e.intersectionRatio >= 0.6; }); }, { threshold: [0, 0.6] });
    var near = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target._v = e.isIntersecting; }); });
    tags.forEach(function (t) { seen.observe(t); t.addEventListener("toggle", function () { if (t.open) t._read = true; }); });
    loopers.forEach(function (n) { near.observe(n); });
    var narrow = window.matchMedia("(max-width: 899px)"), running = false;
    var left = function (x) { return !x._read && (x._n || 0) < 2; };
    var swing = function () {
      if (!narrow.matches || !tags.some(left)) { running = false; return; }
      setTimeout(swing, 6000 + Math.random() * 4000);
      if (!root.classList.contains("anim") || Date.now() < quietAt || loopers.some(function (n) { return n._v; })) return;
      var t = tags.filter(function (x) { return x._v && !x.open && left(x); })[0];
      if (!t) return;
      t._n = (t._n || 0) + 1;
      t.classList.add("swing");
      setTimeout(function () { t.classList.remove("swing"); }, 2300);
    };
    var start = function () { if (narrow.matches && !running) { running = true; setTimeout(swing, 4000); } };
    if (narrow.addEventListener) narrow.addEventListener("change", start);
    start();
  }

  // Phone menu: the 3-line button opens and closes the drop-down; a link tap or Escape closes it.
  var bar = document.querySelector(".bar"), menuBtn = $("menu-btn");
  function setMenu(open) { if (!bar || !menuBtn) return; bar.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", open ? "true" : "false"); }
  if (menuBtn) menuBtn.addEventListener("click", function () { setMenu(!bar.classList.contains("open")); });
  [].slice.call(document.querySelectorAll("#site-menu nav a")).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && bar && bar.classList.contains("open")) { setMenu(false); menuBtn.focus(); } });

  // "Get email news" buttons jump to the sign-up and put the cursor in the email box (the page does not scroll again).
  var em = $("email");
  if (em) [].slice.call(document.querySelectorAll('a[href="#signup"]')).forEach(function (go) {
    go.addEventListener("click", function () { setTimeout(function () { try { em.focus({ preventScroll: true }); } catch (e) { em.focus(); } }, 0); });
  });
})();
