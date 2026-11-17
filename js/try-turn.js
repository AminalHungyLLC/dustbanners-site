/* Try one turn (site r41i): six short guided examples of a turn, a new one on each visit. A simplified example, not the full
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
  // One row per example: the card for each screen before the end, then the end screen (null: the big storm card shows).
  var CARDS = [["unit", "unit", "unit", "tactic", null], ["unit", "location", "location", "location"], ["guard", "guard", "guard", "guard"],
    ["unit", "unit", "unit", "unit"], ["overrun", "location", "eguard", "location", "location"], ["vehicle", "vehicle", "location", "location"]];
  var mini = $("d-mini"), miniKind = "";
  function showMini(kind) {
    mini.hidden = !kind;
    if (!kind || kind === miniKind) { miniKind = kind || miniKind; return; }
    var c = KIND[kind];
    miniKind = kind;
    mini.className = "d-mini k-" + kind;
    mini.querySelector(".d-mk").textContent = c[0];
    mini.querySelector("path").setAttribute("d", ICON[c[1]]);
    mini.querySelector(".d-mw").textContent = c[2];
    void mini.offsetWidth;
    mini.style.setProperty("--d", "150ms");
    mini.classList.add("d-in");
  }
  function B(own, toks, at) { return { own: own, toks: toks, at: at }; }
  var X = [
    { goal: "Your goal: get your Unit to Rusted Track and keep it there through a storm.", storm: true,
      b: B([Y, O, T], [[], [], ["Enemy Unit"]]),
      what: "You have 3 Supply to spend. Supply pays for cards.", why: "A Unit card puts one of your people on the map.",
      steps: [
        { btn: "Play your Unit", b: B([Y, O, T], [["Your Unit"], [], ["Enemy Unit"]], 0),
          what: "You paid 2 Supply. Your Unit is at your depot.", why: "Units are how you take and hold places." },
        { btn: "Move to Rusted Track", b: B([Y, O, T], [[], ["Your Unit"], ["Enemy Unit"]], 1),
          what: "Your Unit moves one road to Rusted Track.", why: "A Unit moves once a turn, to the next place." },
        { btn: "Play your Tactic", b: B([Y, O, T], [[], ["Your Unit", "Dug in"], ["Enemy Unit"]], 1),
          what: "You paid your last Supply. A Tactic is a one-time card. Your Unit digs in.", why: "Simplified: digging in is made up for this example." },
        { btn: "End your turn", b: B([Y, O, T], [[], ["Your Unit", "Dug in"], ["Enemy Unit"]], 1),
          what: "On the enemy’s turn, the Frontier Deck turns up a storm, Wall of Wind. Your Unit dug in, so it stays." }],
      head: "Your Unit held on!", end: "Simplified: this storm is made up. On your next turn, your Unit can Capture Rusted Track, which means take it." },
    { goal: "Your goal: take Mountain Road. Nobody holds it yet.", names: ["The West Yard", "Mountain Road", "The Upper Junction"],
      b: B([Y, O, T], [[], ["Your Unit"], []]),
      what: "Your Unit, one of your people, has stood at Mountain Road since last turn.", why: "To Capture means to take an open place with no enemy Unit.",
      steps: [
        { btn: "Capture Mountain Road", b: B([Y, Y, T], [[], ["Your Unit"], []], 1),
          what: "Your Unit is now exhausted: used until your next turn. Mountain Road is yours.", why: "Only a Unit that did not move this turn can Capture." },
        { btn: "Take the reward", b: B([Y, Y, T], [[], ["Your Unit"], []], 1),
          what: "Mountain Road’s Capture Reward: you draw 1 card, then discard 1 card from your hand.", why: "A place can have a Capture Reward. A discarded card goes to your Ditch, your discard pile." },
        { btn: "End your turn", b: B([Y, Y, T], [[], ["Your Unit"], []]),
          what: "Your turn ends. You now hold 2 of these 3 places." }],
      head: "Mountain Road is yours!", end: "To win the real game, hold all 9 places at the end of a turn, or break the enemy Leader." },
    { goal: "Your goal: keep Rusted Track safe on the enemy’s turn.",
      b: B([Y, Y, T], [[], ["Your Guard", "Enemy Unit"], []]),
      what: "An enemy Unit came to Rusted Track last turn. Now it attacks the place.", why: "Rusted Track is yours. Your Guard is a card that can protect it.",
      steps: [
        { btn: "Guard Rusted Track", b: B([Y, Y, T], [[], ["Your Guard", "Enemy Unit"], []], 1),
          what: "Your Guard defends the place. Guarding uses it until your next turn.", why: "A Guard protects your things where it stands, and the place if you hold it." },
        { btn: "Deal the damage", b: B([Y, Y, T], [[], ["Your Guard"], []], 1),
          what: "Your Guard takes 3 damage. It has 4 Health, the damage it can take, so it stays.", why: "At the same time it hits back for 2, its Retaliation. That defeats the enemy Unit." },
        { btn: "End the turn", b: B([Y, Y, T], [[], ["Your Guard"], []]),
          what: "The turn ends. Damage on Units is removed at the end of every turn." }],
      head: "Rusted Track is safe!", end: "Your Guard gets ready again at the start of your turn." },
    { goal: "Your goal: clear the enemy Unit off Rusted Track.",
      b: B([Y, O, T], [[], ["Your Unit", "Enemy Unit"], []]),
      what: "Your Unit came to Rusted Track last turn. An enemy Unit stands there, ready to fight.", why: "A Unit can attack an enemy at its own place. You get one attack each turn.",
      steps: [
        { btn: "Attack the enemy Unit", b: B([Y, O, T], [[], ["Your Unit", "Enemy Unit"], []], 1),
          what: "Your Unit attacks. Attacking uses it until your next turn.", why: "They have no Guard here, so their Unit defends itself." },
        { btn: "Deal the damage", b: B([Y, O, T], [[], ["Your Unit"], []], 1),
          what: "Your Unit deals 2 damage. The enemy Unit had 2 Health, the damage it can take, so it is defeated.", why: "At the same time it hits back for 1. That is its Retaliation." },
        { btn: "End your turn", b: B([Y, O, T], [[], ["Your Unit"], []]),
          what: "Your Unit took 1 damage. Damage on Units is removed at the end of every turn." }],
      head: "Rusted Track is clear!", end: "On your next turn, your Unit can Capture Rusted Track, which means take it." },
    { goal: "Your goal: hurt The Lower Junction, which the enemy holds.",
      b: B([Y, O, T], [[], [], ["Your Unit", "Enemy Guard"]]),
      what: "Your Unit came here last turn. It has 5 Attack and Overrun.", why: "Overrun means extra damage goes on to the place the defender protects.",
      steps: [
        { btn: "Attack The Lower Junction", b: B([Y, O, T], [[], [], ["Your Unit", "Enemy Guard"]], 2),
          what: "Your Unit attacks the place itself.", why: "You can attack a place you do not hold." },
        { btn: "See their Guard", b: B([Y, O, T], [[], [], ["Your Unit", "Enemy Guard"]], 2),
          what: "Their Guard defends the place. It has 2 Health, the damage it can take.", why: "Now your attack hits the Guard first." },
        { btn: "Deal the damage", b: B([Y, O, T], [[], [], ["Your Unit", "3 damage"]], 2),
          what: "Your 5 damage defeats the Guard. The other 3 go to the place.", why: "That is Overrun. Each place has Durability, the damage it can take." },
        { btn: "End your turn", b: B([Y, O, T], [[], [], ["Your Unit", "3 damage"]]),
          what: "Your turn ends. Damage on Units is removed, but damage on a place stays." }],
      head: "The Lower Junction is hurt!", end: "Keep hitting it. When it runs out of Durability, nobody holds it." },
    { goal: "Your goal: reach The Lower Junction in one turn.",
      b: B([Y, O, T], [["Vehicle", "2 Units"], [], []]),
      what: "Your Vehicle waits at your depot. One Unit drives it and one rides along.", why: "A Unit on foot moves one road a turn. A Vehicle can go two.",
      steps: [
        { btn: "Drive two roads", b: B([Y, O, T], [[], [], ["Vehicle", "2 Units"]], 2),
          what: "You name both roads and drive through Rusted Track to their place.", why: "When the drive ends, all of them are used until your next turn." },
        { btn: "See the takeover", b: B([Y, O, T], [[], [], ["Vehicle", "2 Units"]], 2),
          what: "Your Units are at their place, and they have no Units there.", why: "That starts a takeover. It must stay that way until your turn ends." },
        { btn: "End your turn", b: B([Y, O, Y], [[], [], ["Vehicle", "2 Units"]]),
          what: "Your turn ends with no enemy Unit there." }],
      head: "The Lower Junction is yours!", end: "A takeover finishes at the end of your turn. On your very first turn, it waits one more turn." }];
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
    $("d-front").hidden = !(end && s.storm);
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
