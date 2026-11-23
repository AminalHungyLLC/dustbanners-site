/* Dustbanners site r47: the cards on the home page (Kyle 2026-11-23, "Yes, all of it", from website/qa/UX-UI-REVIEW-r46.md).
   - Tap (or click, Enter, Space) a card to exhaust it: it turns 90 degrees, like a card on the table, with a small "Exhausted" tag.
     Do it again to ready it. A real button with aria-pressed (S1).
   - A separate Flip button in the corner turns the card over. The back is a plain labeled stand-in panel, not card art: it explains the
     words on that card, copied from the page's own "Words on these cards" list (S3).
   - Phones (under 768 px): each card list is a sideways swipe row with a "Card 1 of 7" line and Previous / Next buttons (H2).
   - The first card of each Banner view blows in on a dusty wind the first time it is shown (r47b: not every card), only when the whole
     card is on screen and scrolling has stopped for about 1 second (window.DBN.whenSettled in site.js). Hidden Supplies, the Frontier
     card, blows in face down, then turns face up (S4, S2).
   Every motion runs only when the site allows motion (html.anim: the Motion switch is on and the device does not ask for less motion);
   otherwise the cards are simply there, and flip and exhaust switch at once (CSS). No outside requests. Nothing is stored. */
(function () {
  var root = document.documentElement;
  var lists = [].slice.call(document.querySelectorAll(".card-grid"));
  if (!lists.length || !("classList" in root)) return;
  var DBN = window.DBN || null;
  var anim = function () { return DBN ? DBN.anim() : root.classList.contains("anim"); };
  var words = [].slice.call(document.querySelectorAll(".gc-words li[data-word]"));
  var FIND = { fighter: /\bfighters?\b/i, fortify: /\bFortify\b/, momentum: /\bMomentum\b/, rethink: /\bRethink\b/ };
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }

  // One polite line for screen readers: "Warden Leader: exhausted." / "Warden Leader: ready."
  var wide = document.querySelector(".leaf-wide") || document.body;
  var say = el("p", "vh"); say.setAttribute("aria-live", "polite"); wide.appendChild(say);
  var how = document.querySelector(".gc-how"); if (how) how.hidden = false;

  var holds = [];
  lists.forEach(function (ul) {
    [].slice.call(ul.children).forEach(function (li) {
      var card = li.querySelector("article.gc"); if (!card) return;
      var name = (card.getAttribute("aria-label") || "").split(",")[0].trim() || "this card";
      var fac = card.classList.contains("fac-r") ? "fac-r" : card.classList.contains("fac-n") ? "fac-n" : "fac-w";
      // hold (never moves: it is what "the whole card is on screen" measures) > dust (blows in) > turn (exhausted) > flip (front, back)
      var hold = el("div", "gc-hold"), dust = el("div", "gc-dust"), turn = el("div", "gc-turn"), flip = el("div", "gc-flip"), back = el("div", "gc-back " + fac);
      li.insertBefore(hold, card);
      flip.appendChild(card); flip.appendChild(back); turn.appendChild(flip); dust.appendChild(turn); hold.appendChild(dust);

      // The back: plain paper, labeled. The words come from the page's own list, so they stay the approved lines.
      back.appendChild(el("p", "gb-name", name));
      var rules = (card.querySelector(".gc-rules") || card).textContent;
      var mine = words.filter(function (w) { var re = FIND[w.getAttribute("data-word")]; return re && re.test(rules); });
      if (mine.length) {
        back.appendChild(el("p", "gb-h", "Words on this card"));
        var ul2 = el("ul");
        mine.forEach(function (w) { var c = w.cloneNode(true); c.removeAttribute("data-word"); ul2.appendChild(c); });
        back.appendChild(ul2);
      } else {
        var kind = li.querySelector(":scope > p");
        if (kind) back.appendChild(el("p", "gb-kind", kind.textContent.replace(/\s+/g, " ").trim()));
      }
      back.appendChild(el("p", "gb-note", "Card back art coming from our artists."));
      back.setAttribute("aria-hidden", "true"); back.inert = true;

      var ex = el("button", "gc-ex"); ex.type = "button"; ex.setAttribute("aria-pressed", "false"); ex.setAttribute("aria-label", "Exhaust " + name);
      var tag = el("span", "gc-tag", "Exhausted"); tag.setAttribute("aria-hidden", "true");
      hold.appendChild(ex); hold.appendChild(tag);
      var fb = el("button", "gc-flipbtn", "Flip"); fb.type = "button"; fb.setAttribute("aria-pressed", "false");
      fb.appendChild(el("span", "vh", " " + name));
      var h3 = li.querySelector(":scope > h3");
      li.insertBefore(fb, h3 ? h3.nextSibling : hold);
      li.classList.add("has-hold");

      var h = { li: li, hold: hold, card: card, back: back, ex: ex, fb: fb, name: name, settle: null, reveal: /^Frontier card$/i.test(h3 ? h3.textContent.trim() : ""), userFlipped: false };
      ex.addEventListener("click", function () { done(h); setEx(h, !hold.classList.contains("ex")); });
      fb.addEventListener("click", function () { done(h); h.userFlipped = true; setFlip(h, !hold.classList.contains("flipped")); });
      holds.push(h);
    });
  });

  function setEx(h, on) {
    h.hold.classList.toggle("ex", on);
    h.ex.setAttribute("aria-pressed", on ? "true" : "false");
    say.textContent = h.name + (on ? ": exhausted." : ": ready.");
  }
  function setFlip(h, on) {
    h.hold.classList.toggle("flipped", on);
    h.fb.setAttribute("aria-pressed", on ? "true" : "false");
    h.back.inert = !on; h.card.inert = on;
    if (on) { h.back.removeAttribute("aria-hidden"); h.card.setAttribute("aria-hidden", "true"); }
    else { h.back.setAttribute("aria-hidden", "true"); h.card.removeAttribute("aria-hidden"); }
  }

  // Dust-in, once per card per page view. Cards that settle together go one after another.
  var nextAt = 0;
  function later(fn) { var now = Date.now(), at = Math.max(now, nextAt); nextAt = at + 260; setTimeout(fn, at - now); }
  function done(h) {  // a press always shows the card at once
    if (h.settle) { h.settle.cancel(); h.settle = null; }
    h.li.classList.remove("dust-wait", "dust-go");
  }
  function blow(h, moving) {
    h.settle = null;
    if (!h.li.classList.contains("dust-wait")) return;
    if (!moving) { h.li.classList.remove("dust-wait"); if (h.reveal && !h.userFlipped) setFlip(h, false); return; }
    later(function () {
      if (!h.li.classList.contains("dust-wait")) return;
      if (DBN) DBN.hold(1500);
      h.li.classList.remove("dust-wait"); h.li.classList.add("dust-go");
      setTimeout(function () { h.li.classList.remove("dust-go"); }, 1150);
      if (h.reveal) setTimeout(function () { if (!h.userFlipped) setFlip(h, false); }, 1350);  // the Frontier card turns face up
    });
  }
  // r47b (QA-AND-REVIEW-r47 finding 4; approved S4: "the first card of each Banner arrives on a gust", not every card): only the first
  // card of the Wardens view and of the Raiders view blows in, plus Hidden Supplies, which blows in face down and turns up (S2).
  // Every other card is simply there.
  if (DBN) holds.forEach(function (h) {
    var first = !!h.li.closest(".card-set[data-faction]") && h.li === h.li.parentNode.firstElementChild;
    if (!first && !h.reveal) return;
    h.li.classList.add("dust-wait");
    if (h.reveal && anim()) setFlip(h, true);  // face down until it has blown in (motion off: face up from the start)
    h.settle = DBN.whenSettled(h.hold, function (moving) { blow(h, moving); });
  });

  // Phones: the sideways swipe row (CSS scroll-snap). The row takes arrow keys when focused; Previous / Next do the same.
  var phone = window.matchMedia("(max-width: 767px)");
  var rows = lists.map(function (ul) {
    var set = ul.closest(".card-set"), n = ul.children.length;
    var nav = el("div", "gc-nav"), prev = el("button", "d-act gc-prev", "Previous"), count = el("p", "gc-count"), next = el("button", "d-act gc-next", "Next");
    prev.type = next.type = "button";
    prev.setAttribute("aria-label", "Previous card"); next.setAttribute("aria-label", "Next card");
    count.setAttribute("aria-live", "polite");
    nav.appendChild(prev); nav.appendChild(count); nav.appendChild(next);
    ul.parentNode.insertBefore(nav, ul.nextSibling);
    var r = { ul: ul, set: set, n: n, prev: prev, next: next, count: count, at: -1 };
    function step() { var a = ul.children[0], b = ul.children[1]; return a ? (b ? b.offsetLeft - a.offsetLeft : a.offsetWidth) : 0; }
    function go(d) { ul.scrollBy({ left: d * step(), behavior: anim() ? "smooth" : "auto" }); }
    prev.addEventListener("click", function () { go(-1); });
    next.addEventListener("click", function () { go(1); });
    r.update = function () {
      if (!phone.matches) return;
      var s = step(), i = s ? Math.round(ul.scrollLeft / s) : 0;
      i = Math.max(0, Math.min(n - 1, i));
      if (ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 2) i = n - 1;
      if (i === r.at) return;
      r.at = i;
      count.textContent = "Card " + (i + 1) + " of " + n + (i < n - 1 ? ". Swipe for more." : ".");
      prev.disabled = i === 0; next.disabled = i === n - 1;
    };
    var tick = 0;
    ul.addEventListener("scroll", function () { if (!tick) tick = requestAnimationFrame(function () { tick = 0; r.update(); }); }, { passive: true });
    return r;
  });
  function mode() {
    rows.forEach(function (r) {
      // r47b: each row carries data-carousel="x", tabindex="0" and a plain aria-label ("Wardens cards") in the markup (probe r3 marks a
      // designed sideways row that way). On wide screens the list does not scroll, so it leaves the Tab order there.
      if (phone.matches) { r.ul.tabIndex = 0; r.at = -1; r.update(); }
      else r.ul.tabIndex = -1;
    });
  }
  if (phone.addEventListener) phone.addEventListener("change", mode); else if (phone.addListener) phone.addListener(mode);
  mode();
  // A faction switch shows another list: count from its first card again.
  [].slice.call(document.querySelectorAll(".f-pick, .f-pick-end")).forEach(function (b) { b.addEventListener("click", function () { rows.forEach(function (r) { r.at = -1; r.update(); }); }); });
})();
