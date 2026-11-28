/* The Play It word panel (site r53a; Kyle, relayed by the Leader: "all of this should be on the sideboard for the desktop
   site", "that needs to be right next to the thing it's trying to help", "you can use the corkboard", "boards can be strung
   together with chain too", "i guess a link could have a repair in it").
   Loaded in the head: it marks html.kb-words at once, so on desktop the CSS shows the panel and hides the inline "New here?"
   box from the first paint (no doubled text). Without this script nothing changes (the page is as r52g).
   After load it keeps the panel level with "Try one turn" (its top on the heading's top), and redraws the two chains that
   hang it from the Keeper's-note board, to the real gap, whenever the layout moves (fonts, resize, the walkthrough growing).
   One link on one chain is broken and closed by a wire wrap; which one changes from load to load. The chains are decorative
   (aria-hidden) and sit behind the notes. A "#try-words" link lands on the panel when the inline box is hidden. */
var kbChain = {
  // Links from y0 to y1 at pitch p: each link spans 1.4 pitches, so neighbours overlap like a real chain. Alternate links
  // face the viewer (a ring) or are seen edge-on (a bar).
  links: function (y0, y1, p) {
    var out = [], n = Math.max(2, Math.round((y1 - y0) / p)), step = (y1 - y0) / n;
    for (var i = 0; i < n; i++) out.push({ y: y0 + i * step - step * 0.2, h: step * 1.4, face: i % 2 === 0 });
    return out;
  },
  // The broken link: a face-on link away from both ends.
  brokenIndex: function (count, r) {
    var faces = [];
    for (var i = 2; i < count - 2; i++) if (i % 2 === 0) faces.push(i);
    return faces.length ? faces[Math.floor(r * faces.length) % faces.length] : -1;
  },
  // The level: the panel's margin-top that puts its top on the heading's top, but never closer than minGap to the board above.
  marginFor: function (panelTopAtZero, headingTop, boardBottom, minGap) {
    return Math.max(headingTop - panelTopAtZero, boardBottom + minGap - panelTopAtZero);
  }
};
if (typeof module === "object" && module.exports) module.exports = kbChain;

(function () {
  if (typeof document === "undefined" || !document.documentElement || !document.querySelector) return;
  var root = document.documentElement;
  root.classList.add("kb-words");
  var NS = "http://www.w3.org/2000/svg", PITCH = 11, MIN_GAP = 24;
  var whichChain = Math.random() < 0.5 ? 0 : 1, whereBroken = Math.random();

  function node(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function f(v) { return v.toFixed(1); }

  function ring(svg, x, l, broken) {
    var rx = 4.2, ry = l.h / 2, cy = l.y + ry, pts = [];
    for (var a = 0; a <= 360; a += 12) {
      if (broken && (a < 28 || a > 332)) continue;   // the break: a gap in the ring on its right side
      var t = a * Math.PI / 180;
      pts.push(f(x + rx * Math.cos(t)) + "," + f(cy + ry * Math.sin(t)));
    }
    if (broken) pts.push(pts.shift());               // start at the gap's lower end, so the polyline does not cross it
    var d = { points: pts.join(" ") };
    svg.appendChild(node("polyline", Object.assign({ "class": "link-under" }, d)));
    svg.appendChild(node("polyline", Object.assign({ "class": "link" }, d)));
    if (broken) {                                    // the repair: wire wrapped across the gap and twisted shut
      var gx = x + rx, w = [];
      for (var k = 0; k < 4; k++) { var yy = cy - 3.5 + k * 2.3; w.push(f(gx - 2.2) + "," + f(yy), f(gx + 2.2) + "," + f(yy + 1.2)); }
      w.push(f(gx + 4.5) + "," + f(cy + 4.5), f(gx + 6) + "," + f(cy + 3));
      svg.appendChild(node("polyline", { points: w.join(" "), "class": "wire-under", fill: "none", stroke: "#2a1a0c", "stroke-width": 3 }));
      svg.appendChild(node("polyline", { points: w.join(" "), "class": "wire", fill: "none", stroke: "#a3a49e", "stroke-width": 1.4 }));
    }
  }
  function bar(svg, x, l) {
    var a = { x1: f(x), y1: f(l.y + 1), x2: f(x), y2: f(l.y + l.h - 1) };
    svg.appendChild(node("line", Object.assign({ "class": "link-under" }, a)));
    svg.appendChild(node("line", Object.assign({ "class": "link" }, a)));
  }

  function draw(svg, width, gap) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.style.height = gap + "px";
    svg.setAttribute("viewBox", "0 0 " + f(width) + " " + f(gap));
    var xs = [18, width - 18];
    xs.forEach(function (x, ci) {
      var ls = kbChain.links(3, gap - 3, PITCH), bi = ci === whichChain ? kbChain.brokenIndex(ls.length, whereBroken) : -1;
      ls.forEach(function (l, i) { if (l.face) ring(svg, x, l, i === bi); else bar(svg, x, l); });
      svg.appendChild(node("circle", { cx: f(x), cy: "2", r: "2.6", "class": "eye" }));          // a screw eye on each board
      svg.appendChild(node("circle", { cx: f(x), cy: f(gap - 2), r: "2.6", "class": "eye" }));
    });
  }

  function init() {
    var play = document.getElementById("play"), panel = document.getElementById("kb-words"), head = document.getElementById("try");
    var board = play && play.querySelector(":scope > .margin:not(.kb-words-panel)"), svg = panel && panel.querySelector(".kb-chains");
    var inline = document.getElementById("try-words"), note = document.getElementById("try-words-board");
    if (!play || !panel || !head || !board || !svg) return;
    var tick = 0;
    function level() {
      tick = 0;
      if (getComputedStyle(panel).display === "none") return;     // phones and print: nothing to place
      panel.style.marginTop = "0px";
      var top0 = panel.getBoundingClientRect().top, bb = board.getBoundingClientRect().bottom;
      var m = Math.round(kbChain.marginFor(top0, head.getBoundingClientRect().top, bb, MIN_GAP));
      panel.style.marginTop = m + "px";
      var pr = panel.getBoundingClientRect();
      draw(svg, pr.width, Math.max(MIN_GAP, Math.round(pr.top - bb)));
      root.classList.add("kb-level");
    }
    function soon() { if (!tick) tick = requestAnimationFrame(level); }
    level();
    window.addEventListener("resize", soon);
    window.addEventListener("load", soon);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(soon);
      [play.querySelector(":scope > .body"), board, panel].forEach(function (el) { if (el) ro.observe(el); });
    }
    function toBoard(ev) {
      if (!inline || !note || getComputedStyle(inline).display !== "none") return false;
      if (ev) ev.preventDefault();
      note.scrollIntoView({ block: "start" });
      note.focus({ preventScroll: true });
      return true;
    }
    document.addEventListener("click", function (ev) {
      var a = ev.target.closest ? ev.target.closest('a[href="#try-words"]') : null;
      if (a) toBoard(ev);
    });
    if (location.hash === "#try-words") toBoard(null);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
