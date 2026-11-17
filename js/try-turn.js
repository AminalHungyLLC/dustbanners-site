/* Try one turn (site r41i; r41l: each turn starts with a Frontier card): six short guided examples of a turn, a new one on each visit. A simplified example, not the full
   rules; a step that leaves the rule book says "Simplified". Keyboard: Tab and Enter. No timers.
   The last example seen is kept in this browser only (dustbanners-try-example); if storage fails, a random one is shown. */
(function () {
  function $(id) { return document.getElementById(id); }
  var st = $("d-status"), demo = $("demo"), go = $("d-go");
  if (!st || !demo || !go) return;
  var P = [$("d-p0"), $("d-p1"), $("d-p2")], say = demo.querySelector(".d-say");
  var L = { step: st.querySelector(".d-step"), what: st.querySelector(".d-what"), why: st.querySelector(".d-why") };
  var KEY = "dustbanners-try-example", Y = "Yours", O = "Open", T = "Theirs";
  var NAMES = ["Your depot", "Rusted Track", "The Lower Junction"];
  // r41k: a small card beside every step: its type, a simple icon, and a keyword where one matters. No names, no art.
  var ICON = {"bolt": "M13.5 2.5L5.5 13h6l-1 8.5l8-10.5h-6z", "cart": "M3 15h18M5 15V9h10l4 6M5.5 18.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0M14.5 18.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0", "flag": "M6 21V3.5M6 4h11l-2.5 4l2.5 4H6", "person": "M12 3.5a3 3 0 1 1 0 6a3 3 0 1 1 0-6M5.5 20.5c0-4 2.9-6.5 6.5-6.5s6.5 2.5 6.5 6.5", "shield": "M12 3l7 2.8v5.2c0 4.6-3 7.9-7 10c-4-2.1-7-5.4-7-10V5.8z", "wind": "M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8"};
  var KIND = { unit: ["Unit", "person", ""], guard: ["Unit", "shield", "Guard"], overrun: ["Unit", "person", "Overrun"], tactic: ["Tactic", "bolt", ""], location: ["Location", "flag", ""], vehicle: ["Vehicle", "cart", ""], frontier: ["Frontier", "wind", ""], eguard: ["Unit", "shield", "Enemy Guard"] };
  // Colors: your cards Warden indigo, enemy cards Raider wine red (with the word Enemy), places plain, Frontier sand.
  // One row per example: the card for each screen before the end, then the end screen. The screen after step 1 shows the Frontier card.
  var CARDS = [["unit", "frontier", "unit", "unit", "tactic", "unit"], ["unit", "frontier", "location", "location", "location"],
    ["guard", "frontier", "frontier", "guard", "guard", "guard"], ["unit", "frontier", "tactic", "unit", "unit", "unit"],
    ["overrun", "frontier", "location", "eguard", "location", "location"], ["vehicle", "frontier", "vehicle", "location", "location"]];
  var mini = $("d-mini"), miniKind = "";
  function showMini(kind) {
    var key = kind === "frontier" ? kind + x : kind;  // r41l: each example's Frontier card has its own picture
    mini.hidden = !kind;
    if (!kind || key === miniKind) { miniKind = key || miniKind; return; }
    var c = KIND[kind], fr = kind === "frontier", path = mini.querySelector("path");
    miniKind = key;
    mini.className = "d-mini k-" + kind;
    mini.querySelector(".d-mk").textContent = c[0];
    mini.querySelector("svg").setAttribute("viewBox", fr ? "0 0 48 48" : "0 0 24 24");
    path.setAttribute("stroke-width", fr ? "3.6" : "2");
    path.setAttribute("d", fr ? FICON[X[x].front.icon] : ICON[c[1]]);  // Kyle: "The icons aren't the same for hailstorm"
    mini.querySelector(".d-mw").textContent = c[2];
    void mini.offsetWidth;
    mini.style.setProperty("--d", "150ms");
    mini.classList.add("d-in");
  }
  function B(own, toks, at) { return { own: own, toks: toks, at: at }; }
  // r41l: every example starts the way a real turn does (rule book r10: Recovery, then Frontier, then Draw, Operations, Conflict,
  // End). The top Frontier card shows face down, step 1 reveals it, and it changes what happens. Kyle (2026-11-16): "the turn on the
  // board never starts with a frontier card and then affects the outcome". Wall of Wind and Hidden Supplies are public names; the
  // others are plain words, and every made-up effect says "Simplified".
  var DOWN = { name: "Top card", icon: "back", text: "Every turn starts here. The top Frontier card is revealed first." };
  var FICON = {
    back: "M24 9v30M9 24h30M14 14l20 20M34 14L14 34",
    wind: "M6 16h22a5 5 0 1 0-5-5M6 24h30a5 5 0 1 1-5 5M6 32h16",
    fog: "M6 16c6-4 12 4 18 0s12-4 18 0M6 24c6-4 12 4 18 0s12-4 18 0M6 32c6-4 12 4 18 0s12-4 18 0",
    hail: "M12 27h24a7 7 0 0 0-2-13.5A10 10 0 0 0 15 16a6 6 0 0 0-3 11zM17 34v.5M25 36v.5M33 34v.5M21 41v.5M29 41v.5",
    crate: "M8 16l16-8l16 8v16l-16 8l-16-8zM8 16l16 8l16-8M24 24v16",
    rocks: "M5 39h38M8 39l6-11l8 4l5-10l7 8l6 9M20 13l4-5l4 5z",
    dust: "M6 14h20M10 20h28M4 26h22M12 32h24M8 38h14M32 14v.5M38 27v.5M40 37v.5"
  };
  var X = [
    { goal: "Your goal: get your Unit to Rusted Track and keep it there through a storm.",
      front: { name: "Wall of Wind", icon: "wind", text: "Simplified: at the end of this turn, the storm hits Rusted Track. A Unit there goes home unless it dug in." },
      b: B([Y, O, T], [[], [], ["Enemy Unit"]]),
      what: "Your turn starts with 3 Supply to spend. Supply pays for cards.", why: "First, the top Frontier card is revealed. It can change your plan.",
      steps: [
        { btn: "Reveal the Frontier card", b: B([Y, O, T], [[], [], ["Enemy Unit"]]),
          what: "A storm, Wall of Wind. It will hit Rusted Track at the end of your turn.", why: "Frontier cards happen to both players. You plan around them." },
        { btn: "Play your Unit", b: B([Y, O, T], [["Your Unit"], [], ["Enemy Unit"]], 0),
          what: "You paid 2 Supply. Your Unit is at your depot.", why: "Units are how you take and hold places." },
        { btn: "Move to Rusted Track", b: B([Y, O, T], [[], ["Your Unit"], ["Enemy Unit"]], 1),
          what: "Your Unit moves one road to Rusted Track.", why: "The storm will hit it there. You have 1 Supply left." },
        { btn: "Play your Tactic", b: B([Y, O, T], [[], ["Your Unit", "Dug in"], ["Enemy Unit"]], 1),
          what: "You paid your last Supply. A Tactic is a one-time card. Your Unit digs in.", why: "Simplified: digging in is made up for this example." },
        { btn: "End your turn", b: B([Y, O, T], [[], ["Your Unit", "Dug in"], ["Enemy Unit"]], 1),
          what: "The storm hits Rusted Track. Your Unit dug in, so it stays." }],
      head: "Your Unit held on!", end: "Without the Tactic, the storm would have sent it home. Next turn, it can Capture Rusted Track, which means take it." },
    { goal: "Your goal: take Mountain Road. Nobody holds it yet.", names: ["The West Yard", "Mountain Road", "The Upper Junction"],
      front: { name: "Fog", icon: "fog", text: "Simplified: lost in the fog, every Unit that came to Mountain Road last turn goes back to its depot." },
      b: B([Y, O, T], [[], ["Your Unit", "Enemy Unit"], []]),
      what: "Your Unit has stood at Mountain Road for two turns. An enemy Unit came last turn.", why: "No one can Capture a place while an enemy Unit is there. First, reveal the Frontier card.",
      steps: [
        { btn: "Reveal the Frontier card", b: B([Y, O, T], [[], ["Your Unit"], []], 1),
          what: "Fog. Their Unit came last turn, so it gets lost and goes back to its depot.", why: "Now no enemy Unit is here. A Unit that did not move this turn can Capture: take an open place." },
        { btn: "Capture Mountain Road", b: B([Y, Y, T], [[], ["Your Unit"], []], 1),
          what: "Your Unit is now exhausted: used until your next turn. Mountain Road is yours.", why: "Only a Unit that did not move this turn can Capture." },
        { btn: "Take the reward", b: B([Y, Y, T], [[], ["Your Unit"], []], 1),
          what: "Mountain Road’s Capture Reward: you draw 1 card, then discard 1 card from your hand.", why: "A place can have a Capture Reward. A discarded card goes to your Ditch, your discard pile." },
        { btn: "End your turn", b: B([Y, Y, T], [[], ["Your Unit"], []]),
          what: "Your turn ends. You now hold 2 of these 3 places." }],
      head: "Mountain Road is yours!", end: "Without the fog, their Unit would have blocked you. To win, hold all 9 places at the end of a turn, or break the enemy Leader." },
    { goal: "Your goal: keep Rusted Track safe on the enemy’s turn.",
      front: { name: "Hailstorm", icon: "hail", text: "Simplified: each Unit that attacks this turn takes 1 damage first." },
      b: B([Y, Y, T], [[], ["Your Guard", "Enemy Unit"], []]),
      what: "The enemy’s turn starts. Their Unit came to Rusted Track last turn. It has 3 Health.", why: "Their turn starts with a Frontier card too. Your Guard stands at Rusted Track, which is yours.",
      steps: [
        { btn: "Reveal the Frontier card", b: B([Y, Y, T], [[], ["Your Guard", "Enemy Unit"], []], 1),
          what: "A hailstorm. Any Unit that attacks this turn takes 1 damage first.", why: "Health is the damage a Unit can take. Theirs still wants to attack." },
        { btn: "See the attack", b: B([Y, Y, T], [[], ["Your Guard", "Enemy Unit"], []], 1),
          what: "Their Unit attacks Rusted Track. The hail hits it for 1, so it has 2 Health left.", why: "Your Guard can protect the place." },
        { btn: "Guard Rusted Track", b: B([Y, Y, T], [[], ["Your Guard", "Enemy Unit"], []], 1),
          what: "Your Guard defends the place. Guarding uses it until your next turn.", why: "A Guard protects your things where it stands, and the place if you hold it." },
        { btn: "Deal the damage", b: B([Y, Y, T], [[], ["Your Guard"], []], 1),
          what: "Your Guard takes 3 damage. It has 4 Health, so it stays.", why: "At the same time it hits back for 2, its Retaliation. After the hail, that defeats the enemy Unit." },
        { btn: "End the turn", b: B([Y, Y, T], [[], ["Your Guard"], []]),
          what: "The turn ends. Damage on Units is removed at the end of every turn." }],
      head: "Rusted Track is safe!", end: "Without the hail, their Unit would have lived. Your Guard gets ready again at the start of your turn." },
    { goal: "Your goal: clear the enemy Unit off Rusted Track.",
      front: { name: "Hidden Supplies", icon: "crate", text: "Each player Generates 1 Supply this turn. The reveal controller Generates 1 additional Supply." },
      b: B([Y, O, T], [[], ["Your Unit", "Enemy Unit"], []]),
      what: "Your turn starts. Your Supply refills to 4. Your Unit deals 2 damage. The enemy Unit here has 4 Health.", why: "Your Tactic would help, but it costs 5 Supply. First, the top Frontier card is revealed.",
      steps: [
        { btn: "Reveal the Frontier card", b: B([Y, O, T], [[], ["Your Unit", "Enemy Unit"], []], 1),
          what: "A find, Hidden Supplies. You Generate 1 Supply, so you have 5.", why: "The enemy gets 1 too. Generated Supply is lost at the end of the turn." },
        { btn: "Play your Tactic", b: B([Y, O, T], [[], ["Your Unit", "Enemy Unit"], []], 1),
          what: "You paid all 5 Supply. Your Unit deals 2 more damage this turn.", why: "Simplified: this Tactic is made up for this example." },
        { btn: "Attack the enemy Unit", b: B([Y, O, T], [[], ["Your Unit", "Enemy Unit"], []], 1),
          what: "Your Unit attacks. Attacking uses it until your next turn.", why: "They have no Guard here, so their Unit defends itself." },
        { btn: "Deal the damage", b: B([Y, O, T], [[], ["Your Unit"], []], 1),
          what: "Your Unit deals 4 damage. The enemy Unit had 4 Health, so it is defeated.", why: "At the same time it hits back for 1. That is its Retaliation." },
        { btn: "End your turn", b: B([Y, O, T], [[], ["Your Unit"], []]),
          what: "Your Unit took 1 damage. Damage on Units is removed at the end of every turn." }],
      head: "Rusted Track is clear!", end: "Without the find, you could not pay for the Tactic. Next turn, your Unit can Capture Rusted Track, which means take it." },
    { goal: "Your goal: hurt The Lower Junction, which the enemy holds.",
      front: { name: "Rockslide", icon: "rocks", text: "Simplified: rocks crash down on The Lower Junction. It takes 1 damage." },
      b: B([Y, O, T], [[], [], ["Your Unit", "Enemy Guard"]]),
      what: "Your turn starts. Your Unit came here last turn. It has 5 Attack and Overrun.", why: "Overrun means extra damage goes on to the place the defender protects.",
      steps: [
        { btn: "Reveal the Frontier card", b: B([Y, O, T], [[], [], ["Your Unit", "Enemy Guard"]], 2),
          what: "A rockslide. The Lower Junction takes 1 damage.", why: "Damage on a place stays. Each place has Durability, the damage it can take." },
        { btn: "Attack The Lower Junction", b: B([Y, O, T], [[], [], ["Your Unit", "Enemy Guard"]], 2),
          what: "Your Unit attacks the place itself.", why: "You can attack a place you do not hold." },
        { btn: "See their Guard", b: B([Y, O, T], [[], [], ["Your Unit", "Enemy Guard"]], 2),
          what: "Their Guard defends the place. It has 2 Health, the damage it can take.", why: "Now your attack hits the Guard first." },
        { btn: "Deal the damage", b: B([Y, O, T], [[], [], ["Your Unit", "4 damage"]], 2),
          what: "Your 5 damage defeats the Guard. The other 3 go to the place.", why: "That is Overrun. With the rockslide, the place now has 4 damage." },
        { btn: "End your turn", b: B([Y, O, T], [[], [], ["Your Unit", "4 damage"]]),
          what: "Your turn ends. Damage on Units is removed, but damage on a place stays." }],
      head: "The Lower Junction is hurt!", end: "The rockslide added 1. Keep hitting it. When it runs out of Durability, nobody holds it." },
    { goal: "Your goal: take The Lower Junction in one turn.",
      front: { name: "Dust storm", icon: "dust", text: "Simplified: the storm drives every Unit at The Lower Junction back to its depot." },
      b: B([Y, O, T], [["Vehicle", "2 Units"], [], ["Enemy Unit"]]),
      what: "Your turn starts. Your Vehicle waits at your depot. One Unit drives it and one rides along.", why: "A Vehicle can go two roads. But an enemy Unit stands at The Lower Junction.",
      steps: [
        { btn: "Reveal the Frontier card", b: B([Y, O, T], [["Vehicle", "2 Units"], [], []]),
          what: "A dust storm. The enemy Unit at their place goes back to its depot.", why: "Now their place has no Units. That is your chance." },
        { btn: "Drive two roads", b: B([Y, O, T], [[], [], ["Vehicle", "2 Units"]], 2),
          what: "You name both roads and drive through Rusted Track to their place.", why: "When the drive ends, all of them are used until your next turn." },
        { btn: "See the takeover", b: B([Y, O, T], [[], [], ["Vehicle", "2 Units"]], 2),
          what: "Your Units are at their place, and they have no Units there.", why: "That starts a takeover. It must stay that way until your turn ends." },
        { btn: "End your turn", b: B([Y, O, Y], [[], [], ["Vehicle", "2 Units"]]),
          what: "Your turn ends with no enemy Unit there." }],
      head: "The Lower Junction is yours!", end: "Without the storm, their Unit would have stopped the takeover. A takeover finishes at the end of your turn." }];
  var coarse = window.matchMedia ? window.matchMedia("(pointer: coarse)") : null;
  var x = 0, k = 0;
  var wait = 150;
  function set(el, t) {
    if (el.textContent === t) return;
    el.textContent = t;
    if (!t) return;
    el.classList.remove("d-in"); void el.offsetWidth;
    el.style.setProperty("--d", Math.min(wait, 550) + "ms"); wait += 80;
    el.classList.add("d-in");
  }
  function done() { return k >= X[x].steps.length; }
  function label() { go.textContent = (coarse && coarse.matches ? "Tap" : "Click") + ": " + (done() ? "Try another example" : X[x].steps[k].btn); }
  function board(b, names) {
    P.forEach(function (p, i) {
      var t = p.querySelectorAll(".pt"), own = b.own[i];
      set(p.querySelector(".pn"), names[i]);
      set(p.querySelector(".po"), own);
      p.className = "d-place " + (own === Y ? "mine" : own === O ? "open" : "theirs") + (b.at === i ? " here" : "");
      for (var j = 0; j < 2; j++) {
        var s = b.toks[i][j] || "";
        t[j].className = "pt" + (/^Enemy/.test(s) ? " enemy" : /damage/.test(s) ? " hurt" : "");
        set(t[j], s);  // after the class, so a new marker keeps its arrival
      }
    });
  }
  // r41l: who you are, the round, and the phase (Kyle: "make sure it's clear if you're player 1 or 2, make sure it's clear what
  // round it is in the game. Give it character"). Rounds fit rule book r10: Round 1 is a first turn (3 Supply); Supply 4 is Round 2.
  // Phases: 0 Recovery, 1 Frontier, 2 Draw, 3 Operations, 4 Conflict, 5 End; one entry per screen (start, each step, the end).
  var HEAD = [{ you: 2, round: 1, ph: [0, 1, 3, 3, 3, 5] }, { you: 1, round: 3, ph: [0, 1, 3, 3, 5] }, { you: 1, round: 3, theirs: true, ph: [0, 1, 4, 4, 4, 5] },
    { you: 2, round: 2, ph: [0, 1, 3, 4, 4, 5] }, { you: 1, round: 4, ph: [0, 1, 4, 4, 4, 5] }, { you: 2, round: 3, ph: [0, 1, 3, 3, 5] }];
  var PH = [].slice.call(document.querySelectorAll("#d-phases li"));
  function showHead(end) {
    var h = HEAD[x], now = h.ph[end ? X[x].steps.length : k], ticks = "";
    if (!$("d-you")) return;
    $("d-you").textContent = "You: Player " + h.you + ", the Wardens";
    $("d-them").textContent = "Them: Player " + (3 - h.you) + ", the Raiders";
    $("d-you-s").classList.toggle("now", !h.theirs);
    $("d-them-s").classList.toggle("now", !!h.theirs);
    $("d-round").textContent = "Round " + h.round;
    $("d-turn").textContent = h.theirs ? "Their turn" : "Your turn";
    for (var i = 0; i < h.round; i++) ticks += "M" + (4 + 7 * i) + " " + (3 + i % 2) + "l" + (1.5 - (i % 3) * 0.6) + " " + (14 - i % 2);
    $("d-tally").querySelector("path").setAttribute("d", ticks);
    PH.forEach(function (li, i) {
      li.className = i < now ? "done" : i === now ? "now" : "";
      if (i === now) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
  }
  // r41l: the Frontier card shows for the whole example: face down first, then the card step 1 reveals (it turns over once).
  var front = $("d-front"), storm = front.querySelector(".d-storm"), frontKey = "";
  function showFront(s, up) {
    var f = up ? s.front : DOWN, key = x + (up ? "u" : "d");
    front.hidden = false;
    if (key === frontKey) return;
    frontKey = key;
    front.classList.toggle("down", !up);
    storm.querySelector(".d-sname").textContent = f.name;
    storm.querySelector("path").setAttribute("d", FICON[f.icon]);
    front.querySelector(".d-stext").textContent = f.text;
    storm.style.animation = "none";
    if (up) { void storm.offsetWidth; storm.style.animation = ""; }
  }
  function draw() {
    var s = X[x], n = s.steps.length, end = done();
    wait = 150;
    board(end ? s.steps[n - 1].b : k ? s.steps[k - 1].b : s.b, s.names || NAMES);
    showMini(CARDS[x][end ? n : k]);
    set($("d-goal"), s.goal);
    if (end) {
      set(L.step, s.head); set(L.what, s.steps[n - 1].what); set(L.why, s.end);
    } else {
      var w = k ? s.steps[k - 1] : s;
      set(L.step, "Example " + (x + 1) + " of " + X.length + " · Step " + (k + 1) + " of " + n);
      set(L.what, w.what); set(L.why, w.why);
    }
    label();
    showFront(s, k > 0 || end);
    showHead(end);
    $("d-more").hidden = !end;
    $("d-other").hidden = end;
    say.classList.toggle("over", end);
  }
  function pick(i) {
    x = ((i % X.length) + X.length) % X.length; k = 0;
    try { localStorage.setItem(KEY, String(x)); } catch (e) {}
    draw();
  }
  go.addEventListener("click", function () { if (done()) pick(x + 1); else { k += 1; draw(); } });
  $("d-reset").addEventListener("click", function () { k = 0; draw(); });
  $("d-other").addEventListener("click", function () { pick(x + 1); });
  if (coarse) { if (coarse.addEventListener) coarse.addEventListener("change", label); else if (coarse.addListener) coarse.addListener(label); }
  var first;
  try { var v = parseInt(localStorage.getItem(KEY), 10); first = isNaN(v) ? 0 : v + 1; } catch (e) { first = Math.floor(Math.random() * X.length); }
  pick(first);
})();
