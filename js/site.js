/* Dustbanners site r41: the three switches (AI art, Light/Dark, Motion), the phone menu, and notes and bills that settle in once.
   Same storage keys as the live site, so a visitor's earlier choices carry over. No outside scripts. */
(function () {
  var root = document.documentElement;
  function $(id) { return document.getElementById(id); }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // AI art switch (Kyle 2026-10-14): hides every AI-made placeholder picture and shows its art-free twin.
  var abtn = $("art-toggle");
  function showArt() { if (abtn) abtn.textContent = root.classList.contains("art-off") ? "AI art: Off" : "AI art: On"; }
  if (abtn) abtn.addEventListener("click", function () {
    root.classList.toggle("art-off");
    store("dustbanners-ai-art", root.classList.contains("art-off") ? "off" : "on");
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

  // Notes in the margin and posted bills arrive once as they come into view (only while motion is on; CSS decides).
  // Items that come into view together start one after another: 200 ms, then 150 ms apart (at most 800 ms).
  // The hero map's river draws once the map is a quarter in view, so a phone sees it (Kyle, 2026-11-16).
  var settle = [].slice.call(document.querySelectorAll(".scrap, .bill, .map"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      var n = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting || e.intersectionRatio < (e.target.classList.contains("map") ? 0.25 : 0.15)) return;
        e.target.style.setProperty("--d", Math.min(200 + 150 * n++, 800) + "ms");
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { threshold: [0.15, 0.25] });
    settle.forEach(function (n) { io.observe(n); });
  } else {
    settle.forEach(function (n) { n.classList.add("in"); });
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
