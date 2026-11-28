/* Dustbanners site r43: the two switches (Light/Dark, Motion), the card Banner switch, the phone menu, and notes and bills that settle in once.
   Same storage keys as the live site, so a visitor's earlier choices carry over. No outside scripts.
   r47: the saved choices are put back by js/prefs.js in <head>; the Banner switch also sits below the cards; whenSettled (window.DBN). */
(function () {
  var root = document.documentElement;
  function $(id) { return document.getElementById(id); }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // Card Banner switch (r43, Kyle 2026-11-22: a Raider switch): the cards section shows one Banner at a time, Wardens first. Without script both
  // lists show and the switch stays hidden. Nothing is stored.
  // r47 (UX review r46, M1): the same two buttons repeat below the card list (.f-pick-end), so nobody has to scroll back up to switch.
  // A press on the lower switch brings the top of the card section back into view when it is above the screen.
  var sets = [].slice.call(document.querySelectorAll(".card-set[data-banner]")), picks = [].slice.call(document.querySelectorAll(".f-pick, .f-pick-end"));
  function showBanner(f) {
    sets.forEach(function (s) {
      s.hidden = s.getAttribute("data-banner") !== f;
      var row = s.querySelector(".card-grid"); if (row) row.scrollLeft = 0;
    });
    picks.forEach(function (p) { p.setAttribute("aria-pressed", p.getAttribute("data-banner") === f ? "true" : "false"); });
  }
  if (sets.length && picks.length) {
    picks.forEach(function (p) { p.addEventListener("click", function () {
      showBanner(p.getAttribute("data-banner"));
      var top = document.querySelector(".f-switch");
      if (p.classList.contains("f-pick-end") && top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: "start" });
    }); });
    [].slice.call(document.querySelectorAll(".f-switch")).forEach(function (sw) { sw.hidden = false; });
    showBanner("wardens");
  }

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

  // r47: whenSettled (UX review r46, "When scroll-triggered motion starts"; Kyle: let people get the whole picture on the screen, THEN
  // animate). A scroll-started motion plays only when the WHOLE element is on screen (or, if it is taller than the screen, fills 90% of
  // it) and no scrolling at all (page or a sideways card row) has happened for 1 second. If it leaves the screen first, it waits for the
  // next time. It never starts while something else is arriving (quietAt). With motion off (switch or device setting) it calls
  // play(false): the caller shows the end state at once. Used by cards.js (cards blow in) and try-turn.js (the Frontier card).
  var waiting = [];
  function armSettle(t) { clearTimeout(t.timer); if (t.inView && !t.done) t.timer = setTimeout(function () { fireSettle(t); }, 1000); }
  function fireSettle(t) {
    if (!t.inView || t.done) return;
    if (Date.now() < quietAt) { t.timer = setTimeout(function () { fireSettle(t); }, 400); return; }
    t.done = true;
    if (sio) sio.unobserve(t.el);
    waiting.splice(waiting.indexOf(t), 1);
    t.play(root.classList.contains("anim"));
  }
  var sio = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var t = e.target._settle; if (!t) return;
      var h = window.innerHeight || root.clientHeight;
      t.inView = e.isIntersecting && (e.intersectionRatio >= 0.99 || (e.boundingClientRect.height > h && e.intersectionRect.height >= 0.9 * h));
      armSettle(t);
    });
  }, { threshold: [0, 0.5, 0.9, 0.99, 1] }) : null;
  window.addEventListener("scroll", function () { waiting.forEach(armSettle); }, { passive: true, capture: true });
  window.DBN = {
    whenSettled: function (el, play) {
      var t = { el: el, play: play, inView: false, done: false, timer: 0 };
      if (!sio) { t.done = true; play(false); return { cancel: function () {} }; }
      el._settle = t; waiting.push(t); sio.observe(el);
      return { cancel: function () {
        if (t.done) return;
        t.done = true; clearTimeout(t.timer); sio.unobserve(el);
        var i = waiting.indexOf(t); if (i >= 0) waiting.splice(i, 1);
      } };
    },
    hold: function (ms) { quietAt = Math.max(quietAt, Date.now() + ms); },  // a phone tag never swings while a card blows in
    anim: function () { return root.classList.contains("anim"); }
  };

  // Phone tags (r41l). Kyle: "what if the tiny posted note with the nail was small, but it wiggled so people can tap it".
  // r42 (Kyle, 2026-11-18: "I kind of wish the things on the small pin tags just kind of wiggled every few seconds rather than once"):
  // a tag in view swings every 4 to 6 seconds, with no cap, until it has been opened. Still only one thing moves at a time: only
  // while motion is on (the Motion switch and reduced-motion settings both turn it off), while nothing is arriving, while no
  // looping motion is in view (the map, a floating bill, the demo's next button), and only on narrow screens.
  // The tap itself needs no script (it is a details element).
  var tags = [].slice.call(document.querySelectorAll(".tag-note > details"));
  var loopers = [].slice.call(document.querySelectorAll(".map, .bill.float, #d-go"));
  if (tags.length && "IntersectionObserver" in window) {
    var seen = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target._v = e.isIntersecting && e.intersectionRatio >= 0.6; }); }, { threshold: [0, 0.6] });
    var near = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target._v = e.isIntersecting; }); });
    tags.forEach(function (t) { seen.observe(t); t.addEventListener("toggle", function () { if (t.open) t._read = true; }); });
    loopers.forEach(function (n) { near.observe(n); });
    var narrow = window.matchMedia("(max-width: 899px)"), running = false;
    var left = function (x) { return !x._read; };
    var swing = function () {
      if (!narrow.matches || !tags.some(left)) { running = false; return; }
      setTimeout(swing, 4000 + Math.random() * 2000);
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
