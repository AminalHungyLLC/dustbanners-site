/* Cork boards (site r52c, Sitewalk QA for the Leader, 2026-11-27; Kyle's screenshots: the staples on the left torn edge
   slid down when "Sage advice" opened).
   Cause: each board's cracks and staples are one SVG (viewBox 0 0 100 100, preserveAspectRatio none) stretched to the
   board's full height (site.css: inset 0, height 100%), so every staple sits at a share of the height and moves when the
   board grows. Fix: lock each SVG's height in px to the board's CLOSED height, so the staples, the tears and the tack stay
   at fixed distances from the top and only the board's bottom grows. The board itself still grows with its note.
   Locked on load, after the fonts load, on resize, and when a note closes; never while a note on that board is open.
   A hidden board (phones: the margin is not shown) has height 0 and is skipped. Without script, the old stretch stays.

   r52d REPAIRS ON THE REAL BREAKS. Kyle: "Those stitches need to actually stitch something and go all the way across or it
   just looks silly"; then "You can only repair what's broken, not just repair for no reason". So no break is added: each
   board keeps its own r41l crack (one main crack per board), and each break has ONE repair. On the Game, Play and Join
   boards the new repair replaces that crack's staples; the People board keeps its staples (4 breaks, 4 repairs). A
   repaired crack is re-drawn as a real break (a dark split with a lit edge) along its OWN line, read from its path, and the
   repair follows it from end to end, each stitch or wire going from one side of the crack to the other:
     stitch: crossing stitches the whole length of the crack, needle holes on both sides;
     wire:   wire through a hole on each side, looped over the crack and twisted shut, every so often along it;
     bolt:   steel plates across the crack, bolted (with a washer) on both sides.
   Lore: REPAIRS-LORE-r52d-r5.md. Drawn at the board's real px size from the CLOSED board, so it stays put. Decorative. */
(function () {
  if (!document.querySelectorAll) return;
  var boards = [].slice.call(document.querySelectorAll(".leaf > .margin"));
  if (!boards.length) return;
  var NS = "http://www.w3.org/2000/svg";

  function lock() {
    boards.forEach(function (b, bi) {
      var svg = b.querySelector(".cracks");
      if (!svg || b.querySelector("details[open]")) return;
      var h = b.clientHeight;
      if (h > 0) svg.style.height = h + "px";
      var rep = b.querySelector(".repairs[data-seam]");
      if (!rep || !(h > 0)) return;
      var w = b.clientWidth;
      var pts = mainCrack(svg.querySelector("path.c")).map(function (p) { return [p[0] * w / 100, p[1] * h / 100]; });
      rep.textContent = "";
      if (pts.length < 2) { rep.hidden = true; return; }
      rep.appendChild(drawRepair(rep.getAttribute("data-seam"), pts, w, h, bi + 1));
      svg.classList.add("repaired");  // the hairline and its staples give way to the drawn break and its one repair
      rep.hidden = false;
    });
  }

  // The crack's main line: the first "M ... L ..." run of its path (the others are its short side branches), in 0-100 units.
  function mainCrack(path) {
    if (!path) return [];
    var first = (path.getAttribute("d") || "").split("M")[1] || "", n = first.match(/-?[\d.]+/g) || [], pts = [];
    for (var i = 0; i + 1 < n.length; i += 2) pts.push([parseFloat(n[i]), parseFloat(n[i + 1])]);
    return pts;
  }
  // A small fixed-seed random, so each repair is a little uneven but looks the same on every visit.
  function rnd(seed) { var v = seed * 7919 % 233280; return function () { v = (v * 9301 + 49297) % 233280; return v / 233280; }; }
  function node(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function f(v) { return v.toFixed(1); }
  function line(p, q, cls) { return node("line", { x1: f(p[0]), y1: f(p[1]), x2: f(q[0]), y2: f(q[1]), "class": cls }); }
  function hole(p, r) { return node("circle", { cx: f(p[0]), cy: f(p[1]), r: r, "class": "hole" }); }

  function drawRepair(kind, pts, w, h, seed) {
    var R = rnd(seed), y0 = pts[0][1], y1 = pts[pts.length - 1][1];
    function xAt(y) {
      for (var i = 0; i + 1 < pts.length; i++) {
        var a = pts[i], c = pts[i + 1], lo = Math.min(a[1], c[1]), hi = Math.max(a[1], c[1]);
        if (y >= lo && y <= hi && hi > lo) return a[0] + (c[0] - a[0]) * (y - a[1]) / (c[1] - a[1]);
      }
      return pts[pts.length - 1][0];
    }
    var svg = node("svg", { viewBox: "0 0 " + w + " " + h, width: w, height: h, "aria-hidden": "true", focusable: "false", "class": "fix fix-" + kind });
    // the break itself: the crack's own line, opened into a dark split with a lit edge
    var left = pts.map(function (p) { return [p[0] - 1.7, p[1]]; }), right = pts.slice().reverse().map(function (p) { return [p[0] + 1.7, p[1]]; });
    svg.appendChild(node("polygon", { points: left.concat(right).map(function (p) { return f(p[0]) + "," + f(p[1]); }).join(" "), "class": "gap" }));
    svg.appendChild(node("polyline", { points: left.map(function (p) { return f(p[0] - 0.8) + "," + f(p[1]); }).join(" "), "class": "lip" }));
    if (kind === "stitch") {
      // crossing stitches the whole length of the crack; each goes from one side of it to the other
      for (var y = y0 + 6 + R() * 3; y < y1 - 5; y += 13 + R() * 3) {
        var x = xAt(y), d = 3.6 + R() * 1.4;
        var a1 = [x - 7, y - d], b1 = [x + 7, y + d], a2 = [x + 7, y - d], b2 = [x - 7, y + d];
        [a1, b1, a2, b2].forEach(function (p) { svg.appendChild(hole(p, 1.3)); });
        [[a1, b1], [a2, b2]].forEach(function (s) { svg.appendChild(line(s[0], s[1], "thread-under")); svg.appendChild(line(s[0], s[1], "thread")); });
      }
    } else if (kind === "wire") {
      // wire through a hole on each side of the crack, looped over it and twisted shut, every so often along it
      var n = Math.max(2, Math.round((y1 - y0) / 70));
      for (var k = 0; k < n; k++) {
        var wy = y0 + (k + 0.5) * (y1 - y0) / n + (R() - 0.5) * 8, cx = xAt(wy);
        svg.appendChild(hole([cx - 7, wy], 1.7));
        svg.appendChild(hole([cx + 7, wy], 1.7));
        var dd = "M" + f(cx - 7) + " " + f(wy) + "C" + f(cx - 3) + " " + f(wy - 8) + " " + f(cx + 3) + " " + f(wy - 8) + " " + f(cx + 7) + " " + f(wy)
          + "C" + f(cx + 3) + " " + f(wy + 8) + " " + f(cx - 3) + " " + f(wy + 8) + " " + f(cx - 7) + " " + f(wy)
          + "l-3 3l-1.5 -4l-1.5 4";  // the twisted end
        svg.appendChild(node("path", { d: dd, "class": "wire-under" }));
        svg.appendChild(node("path", { d: dd, "class": "wire" }));
      }
    } else if (kind === "bolt") {
      // steel plates across the crack, each bolted with a washer on both sides; on a crack by the board's right edge the
      // plate sits toward the frame, still across the crack, so it stays clear of the notes
      var right = pts[0][0] > w / 2;
      [1 / 3, 2 / 3].forEach(function (t) {
        var py = y0 + t * (y1 - y0) + (R() - 0.5) * 8, x0 = xAt(py), c = right ? Math.max(x0, w - 13) : Math.min(x0, 13);
        var g = node("g", { transform: "rotate(" + f((R() - 0.5) * 10) + " " + f(c) + " " + f(py) + ")" });
        g.appendChild(node("rect", { x: f(c - 11), y: f(py - 8), width: 22, height: 16, rx: 2, "class": "plate" }));
        g.appendChild(node("circle", { cx: f(c + 2), cy: f(py + 5), r: 1.8, "class": "rust" }));
        [c - 6, c + 6].forEach(function (bx) {
          g.appendChild(node("circle", { cx: f(bx), cy: f(py), r: 3.8, "class": "washer" }));
          g.appendChild(node("polygon", { points: [0, 1, 2, 3, 4, 5].map(function (q) { var a = Math.PI / 3 * q + 0.3; return f(bx + 2.2 * Math.cos(a)) + "," + f(py + 2.2 * Math.sin(a)); }).join(" "), "class": "hex" }));
        });
        svg.appendChild(g);
      });
    }
    return svg;
  }

  lock();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(lock);
  var tick = 0;
  function soon() { if (!tick) tick = requestAnimationFrame(function () { tick = 0; lock(); }); }
  window.addEventListener("resize", soon);
  // Review r52c LOW: a closed board can change height without a window resize (theme switch, text zoom). lock() still
  // skips a board with an open note, so opening a note never moves its staples or its repair.
  if (window.ResizeObserver) { var ro = new ResizeObserver(soon); boards.forEach(function (b) { ro.observe(b); }); }
  // "toggle" does not bubble, so listen in the capture phase. When a note closes, the board is back to its closed height.
  document.addEventListener("toggle", function (ev) {
    var d = ev.target;
    if (d && d.nodeName === "DETAILS" && !d.open && d.closest && d.closest(".leaf > .margin")) lock();
  }, true);
  // Walk (r52d, flaky): on the first desktop load the 4th board note was still faded. A board note that is already on
  // the screen at load is shown at once (site.js's arrival waits for 15% of it to be seen, plus a delay), so no note on
  // screen ever waits for a scroll. Notes below the screen still arrive as before.
  var vh = window.innerHeight || document.documentElement.clientHeight;
  boards.forEach(function (b) {
    [].slice.call(b.querySelectorAll(":scope > .scrap")).forEach(function (n) {
      var r = n.getBoundingClientRect();
      if (r.height && r.top < vh && r.bottom > 0) n.classList.add("in");
    });
  });
  // Motion A (Kyle approved): each desktop board flutters once when it first comes into view. Desktop only (phones never
  // depend on a scroll trigger: rulings/kyle-site-map-populate-on-load-mobile-2026-11-16.md), and only when the Motion
  // switch is on (html.anim) and the device does not ask for reduced motion. The CSS does the motion (kb-in).
  var desk = window.matchMedia && window.matchMedia("(min-width: 900px)");
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var moving = document.documentElement.classList.contains("anim") && !(calm && calm.matches);
  if (desk && desk.matches && moving && window.IntersectionObserver) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("kb-in"); io.unobserve(e.target); } });
    }, { threshold: 0.25 });
    boards.forEach(function (b) { io.observe(b); });
  }
})();
