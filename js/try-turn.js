/* Try one turn (site r41i; r41l: each turn starts with a Frontier card; r42: only real moves): six short guided examples of a turn, a
   new one on each visit. Simplified only in size (three places, not nine). Every move is in rule book r7l, and every Frontier card is a
   real card's effect in plain words under a stand-in name (Kyle, 2026-11-18: no made-up actions or terms; the replaced words are
   listed in site-r42a-c/CHANGES-r42a-c.md). Keyboard: Tab and Enter. No timers (r47: apart from the one-time dust-in of the Frontier card).
   The last example seen is kept in this browser only (dustbanners-try-example); if storage fails, a random one is shown. */
(function () {
  function $(id) { return document.getElementById(id); }
  var st = $("d-status"), demo = $("demo"), go = $("d-go");
  if (!st || !demo || !go) return;
  var P = [$("d-p0"), $("d-p1"), $("d-p2")], say = demo.querySelector(".d-say");
  var L = { step: st.querySelector(".d-step"), what: st.querySelector(".d-what"), why: st.querySelector(".d-why") };
  var KEY = "dustbanners-try-example", Y = "Yours", O = "Nobody", T = "Theirs";
  var NAMES = ["Your gate yard", "Rusted Track", "The Lower Junction"];
  // r41k: a small card beside every step: its type, a simple icon, and a keyword where one matters. No names, no art.
  var ICON = {"bolt": "M13.5 2.5L5.5 13h6l-1 8.5l8-10.5h-6z", "cart": "M3 15h18M5 15V9h10l4 6M5.5 18.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0M14.5 18.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0", "flag": "M6 21V3.5M6 4h11l-2.5 4l2.5 4H6", "person": "M12 3.5a3 3 0 1 1 0 6a3 3 0 1 1 0-6M5.5 20.5c0-4 2.9-6.5 6.5-6.5s6.5 2.5 6.5 6.5", "shield": "M12 3l7 2.8v5.2c0 4.6-3 7.9-7 10c-4-2.1-7-5.4-7-10V5.8z", "wind": "M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8"};
  var KIND = { unit: ["Unit", "person", ""], companion: ["Companion", "person", ""], guard: ["Unit", "shield", "Guard"], overrun: ["Unit", "person", "Overrun"], tactic: ["Tactic", "bolt", ""], location: ["Location", "flag", ""], vehicle: ["Vehicle", "cart", ""], frontier: ["Frontier", "wind", ""], eguard: ["Unit", "shield", "Enemy Guard"] };
  // Colors: your cards Warden indigo, enemy cards Raider wine red (with the word Enemy), places plain, Frontier sand.
  // One row per example: the card for each screen before the end, then the end screen. The screen after step 1 shows the Frontier card.
  var CARDS = [["unit", "frontier", "companion", "unit", "location", "location"], ["unit", "frontier", "location", "location", "location"],
    ["guard", "frontier", "frontier", "unit", "guard", "guard", "guard"], ["unit", "frontier", "unit", "unit", "unit", "unit"],
    ["overrun", "frontier", "location", "eguard", "location", "location"], ["vehicle", "frontier", "vehicle", "vehicle", "location", "location"]];
  // r42 (Kyle, 2026-11-18: "Words matter. So we can't just use another word for fun if it's a keyword. Those should all be in BOLD
  // font"): the keywords in design/game-words-r1/GAME-WORDS-r2.md (section Keywords, with their word forms) show in bold. Text is
  // built from text and <strong> nodes, never as HTML.
  var KW = /\b(Ambush(?:es|ed|ing)?|Ashes|Bolster(?:s|ed|ing)?|Captur(?:e|es|ed|ing)|Countdown|Explor(?:e|es|ed|ing)|Fortif(?:y|ies|ied|ying)|Guard(?:s|ed|ing)?|Isolated|Last Hit|Overrun|Redeploy(?:s|ed|ing)?|Restor(?:e|es|ed|ing)|Salvag(?:e|es|ed|ing)|Scout(?:s|ed|ing)?|Vanguard)\b/g;
  function fill(el, t) {
    el.textContent = "";
    var i = 0, m;
    KW.lastIndex = 0;
    while ((m = KW.exec(t))) {
      if (m.index > i) el.appendChild(document.createTextNode(t.slice(i, m.index)));
      var b = document.createElement("strong"); b.textContent = m[0]; el.appendChild(b);
      i = m.index + m[0].length;
    }
    if (i < t.length) el.appendChild(document.createTextNode(t.slice(i)));
  }
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
    fill(mini.querySelector(".d-mw"), c[2]);
    void mini.offsetWidth;
    mini.style.setProperty("--d", "150ms");
    mini.classList.add("d-in");
  }
  function B(own, toks, at) { return { own: own, toks: toks, at: at }; }
  // r41l: every example starts the way a real turn does (rule book r7l: Recovery, then Frontier, then Draw, Operations, Conflict,
  // End). The top Frontier card shows face down, step 1 reveals it, and it changes what happens. Kyle (2026-11-16): "the turn on the
  // board never starts with a frontier card and then affects the outcome". r42: each Frontier card is a real card's effect in plain
  // words. Wall of Wind and Hidden Supplies are the site's public stand-in names; the others are plain-word stand-ins.
  var DOWN = { name: "Top card", icon: "back", text: "Every turn starts here. The top Frontier card is revealed first." };
  var FICON = {
    back: "M24 9v30M9 24h30M14 14l20 20M34 14L14 34",
    wind: "M6 16h22a5 5 0 1 0-5-5M6 24h30a5 5 0 1 1-5 5M6 32h16",
    fog: "M6 16c6-4 12 4 18 0s12-4 18 0M6 24c6-4 12 4 18 0s12-4 18 0M6 32c6-4 12 4 18 0s12-4 18 0",
    hail: "M12 27h24a7 7 0 0 0-2-13.5A10 10 0 0 0 15 16a6 6 0 0 0-3 11zM17 34v.5M25 36v.5M33 34v.5M21 41v.5M29 41v.5",
    crate: "M8 16l16-8l16 8v16l-16 8l-16-8zM8 16l16 8l16-8M24 24v16",
    rocks: "M5 39h38M8 39l6-11l8 4l5-10l7 8l6 9M20 13l4-5l4 5z",
    dust: "M6 14h20M10 20h28M4 26h22M12 32h24M8 38h14M32 14v.5M38 27v.5M40 37v.5",
    barrier: "M6 17h36v9H6zM12 26v14M36 26v14M14 17l7 9M27 17l7 9",
    paw: "M10 22a4 5 0 1 0 8 0a4 5 0 1 0-8 0M20 14a4 5 0 1 0 8 0a4 5 0 1 0-8 0M30 22a4 5 0 1 0 8 0a4 5 0 1 0-8 0M24 27c-7 0-11 7-11 11c0 3 3 4 6 3c2-1 3-1 5-1s3 0 5 1c3 1 6 0 6-3c0-4-4-11-11-11z",
    sun: "M5 34h38M14 34a10 10 0 0 1 20 0M24 13v5M12 19l3 3M36 19l-3 3M7 27h4M37 27h4",
    shelf: "M8 12h32M8 24h32M8 36h32M10 12v26M38 12v26"
  };
  var X = [
    { goal: "Your goal: Capture Rusted Track. Your Unit has been there since last turn.",
      front: { name: "Wall of Wind", icon: "wind", text: "A storm. Each player must exhaust one of their ready Units or Companions. A player with none loses 1 Supply instead." },
      // r47 (M6): the Companion shows in its own Campsite row under the map (the Campsite is beside your gate yard, not a place on
      // the map: rule book r7m draft r11e, Campsite), with one entry per screen: start, steps 1 to 5. "~" = exhausted.
      camp: ["Companion", "Companion", "~Companion", "~Companion", "~Companion", "~Companion"],
      b: B([Y, O, T], [[], ["Your Unit"], ["Enemy Unit"]]),
      what: "Your turn starts. Your Supply refills to 4. Your Unit at Rusted Track is ready.", why: "First, the top Frontier card is revealed. It can change your plan.",
      steps: [
        { btn: "Reveal the Frontier card", b: B([Y, O, T], [[], ["Your Unit"], ["Enemy Unit"]], 1),
          what: "A storm, Wall of Wind. Each player must exhaust one of their ready Units or Companions.", why: "An exhausted card cannot act until it readies on your next turn. To Capture, a Unit must be ready." },
        { btn: "Exhaust your Companion", b: B([Y, O, T], [[], ["Your Unit"], ["Enemy Unit"]], -1),
          what: "You pick your Companion in your Campsite, not your Unit. Your Unit stays ready.", why: "The enemy must exhaust one of theirs too." },
        { btn: "Play a Unit", b: B([Y, O, T], [["Your Unit"], ["Your Unit"], ["Enemy Unit"]], 0),
          what: "You pay 2 Supply. A new Unit arrives at your gate yard.", why: "A new Unit can arrive in your Campsite, or at a place you control that a road of your places joins to your gate yard." },
        { btn: "Capture Rusted Track", b: B([Y, Y, T], [["Your Unit"], ["~Your Unit"], ["Enemy Unit"]], 1),
          what: "Your Unit exhausts and takes Rusted Track. It is yours now, and you get its Capture Reward.", why: "A Unit can Capture only if it is ready, did not move there this turn, and no enemy Unit is there." },
        { btn: "End your turn", b: B([Y, Y, T], [["Your Unit"], ["~Your Unit"], ["Enemy Unit"]]),
          what: "Your turn ends. You keep your 2 unused Supply for their turn." }],
      head: "Rusted Track is yours!", end: "If the storm had taken your Unit, it could not have Captured. Picking your Companion saved the Capture." },
    { goal: "Your goal: take Mountain Road and keep it. Nobody controls it yet.", names: ["The West Yard", "Mountain Road", "The Upper Junction"],
      front: { name: "Roads closed", icon: "barrier", text: "Until the end of the next round, in Operations, no Unit or Companion can move into a place where an enemy Unit or Companion stands." },
      b: B([Y, O, T], [[], ["Your Unit"], ["Enemy Unit"]]),
      what: "Your turn starts. Your Unit has stood on Mountain Road since last turn. An enemy Unit waits next door.", why: "On their turn, the enemy plans to walk in. First, the top Frontier card is revealed.",
      steps: [
        { btn: "Reveal the Frontier card", b: B([Y, O, T], [[], ["Your Unit"], ["Enemy Unit"]], 1),
          what: "Roads closed. Until the end of the next round, no Unit can move into a place where an enemy stands.", why: "Your Unit stands on Mountain Road, so their Unit cannot walk in." },
        { btn: "Capture Mountain Road", b: B([Y, Y, T], [[], ["Your Unit"], ["Enemy Unit"]], 1),
          what: "Your Unit exhausts and takes Mountain Road. It is yours now.", why: "A ready Unit that did not move this turn can Capture a place nobody controls, if no enemy Unit is there." },
        { btn: "Take the reward", b: B([Y, Y, T], [[], ["Your Unit"], ["Enemy Unit"]], 1),
          what: "Mountain Road’s Capture Reward: you draw 1 card, then discard 1 card.", why: "A place can have a Capture Reward. A discarded card goes to your Ditch, your discard pile." },
        { btn: "End your turn", b: B([Y, Y, T], [[], ["Your Unit"], ["Enemy Unit"]]),
          what: "Your turn ends. Your Unit stays on Mountain Road." }],
      head: "Mountain Road is yours, and safe for now!", end: "On their turn, the closed roads keep their Unit from walking in. To win, hold all 9 places at the end of a turn, or break the enemy Leader." },
    { goal: "Your goal: keep Rusted Track safe on the enemy’s turn.",
      front: { name: "Mountain lion", icon: "paw", text: "A wild animal. At the start of each player’s Conflict, that player picks one of their Units or Companions on the map. It and the lion hit each other." },
      b: B([Y, Y, T], [[], ["Your Guard", "Enemy Unit"], []]),
      what: "The enemy’s turn starts. Their Unit came to Rusted Track last turn. It has 3 Attack and 5 Health.", why: "Their turn starts with a Frontier card too. Your Guard stands at Rusted Track, which is yours.",
      steps: [
        { btn: "Reveal the Frontier card", b: B([Y, Y, T], [[], ["Your Guard", "Enemy Unit"], []], 1),
          what: "A mountain lion. It has 4 Attack and 5 Health, and it stays until someone defeats it.", why: "Health is the damage a card can take." },
        { btn: "Start their Conflict", b: B([Y, Y, T], [[], ["Your Guard", "Enemy Unit"], []], 1),
          what: "The lion fights their only Unit on the map. It takes 4 damage, so it has 1 Health left.", why: "The lion takes 3 damage too, but it has 5 Health." },
        { btn: "See the attack", b: B([Y, Y, T], [[], ["Your Guard", "Enemy Unit"], []], 1),
          what: "Their Unit still attacks Rusted Track.", why: "Your Guard can protect the place, because you control it." },
        { btn: "Guard Rusted Track", b: B([Y, Y, T], [[], ["Your Guard", "Enemy Unit"], []], 1),
          what: "Your Guard defends the place. Guarding exhausts it until your next turn.", why: "A Guard protects your things where it stands, and the place if you control it." },
        { btn: "Deal the damage", b: B([Y, Y, T], [[], ["Your Guard"], []], 1),
          what: "Your Guard takes 3 damage. It has 4 Health, so it stays.", why: "At the same time it hits back for 2, its Retaliation. That defeats their hurt Unit." },
        { btn: "End the turn", b: B([Y, Y, T], [[], ["Your Guard"], []]),
          what: "The turn ends. Damage on Units is removed at the end of every turn." }],
      head: "Rusted Track is safe!", end: "Without the mountain lion, their Unit would have lived. Your Guard readies at the start of your turn." },
    { goal: "Your goal: clear the enemy Unit off Rusted Track.",
      front: { name: "Low sun", icon: "sun", text: "Until the end of the next round, a Unit or Companion can attack at a place it came to this turn. If it does, it cannot Capture this turn." },
      b: B([Y, Y, T], [[], ["Your Unit", "Enemy Unit"], []]),
      what: "Your turn starts. Your Supply refills to 4. Your Unit deals 2 damage. The enemy Unit here has 4 Health.", why: "One Unit is not enough. First, the top Frontier card is revealed.",
      steps: [
        { btn: "Reveal the Frontier card", b: B([Y, Y, T], [[], ["Your Unit", "Enemy Unit"], []], 1),
          what: "Low sun. Until the end of the next round, a Unit can attack at a place it came to this turn.", why: "Normally, a Unit cannot attack on the turn it arrives." },
        { btn: "Play a Unit at Rusted Track", b: B([Y, Y, T], [[], ["2 Units", "Enemy Unit"], []], 1),
          what: "You pay 2 Supply. A new Unit arrives at Rusted Track, a place you control, joined to your gate yard.", why: "A new Unit arrives ready. With the low sun, it can attack this turn." },
        { btn: "Attack the enemy Unit", b: B([Y, Y, T], [[], ["2 Units", "Enemy Unit"], []], 1),
          what: "Both your Units attack together. Attacking exhausts them.", why: "They have no Guard here, so their Unit defends itself." },
        { btn: "Deal the damage", b: B([Y, Y, T], [[], ["2 Units"], []], 1),
          what: "Your Units deal 4 damage. The enemy Unit had 4 Health, so it is defeated.", why: "At the same time it hits back for 1, its Retaliation, against one of your Units." },
        { btn: "End your turn", b: B([Y, Y, T], [[], ["2 Units"], []]),
          what: "Your turn ends. Damage on Units is removed at the end of every turn." }],
      head: "Rusted Track is clear!", end: "Without the low sun, your new Unit could not have attacked, and 2 damage would not be enough." },
    { goal: "Your goal: hurt The Lower Junction, which the enemy holds.",
      front: { name: "A lean week", icon: "shelf", text: "Each player loses 1 Supply they have now. Their Supply Limit does not change." },
      b: B([Y, O, T], [[], [], ["Your Unit", "Enemy Guard"]]),
      what: "Your turn starts. Your Unit came here last turn. It has 5 Attack and Overrun. Their Guard here has 2 Health.", why: "The enemy kept 1 Supply from their turn, to pay for a card during your attack. First, the Frontier card.",
      steps: [
        { btn: "Reveal the Frontier card", b: B([Y, O, T], [[], [], ["Your Unit", "Enemy Guard"]], 2),
          what: "A lean week. Each player loses 1 Supply they have now, you too.", why: "Their kept Supply is gone. Now they cannot pay for a card during your attack." },
        { btn: "Attack The Lower Junction", b: B([Y, O, T], [[], [], ["Your Unit", "Enemy Guard"]], 2),
          what: "Your Unit attacks the place itself. Attacking exhausts it.", why: "You can attack a place you do not control." },
        { btn: "See their Guard", b: B([Y, O, T], [[], [], ["Your Unit", "Enemy Guard"]], 2),
          what: "Their Guard defends the place. It has 2 Health, the damage it can take.", why: "Now your attack hits the Guard first." },
        { btn: "Deal the damage", b: B([Y, O, T], [[], [], ["Your Unit", "3 damage"]], 2),
          what: "Your 5 damage defeats the Guard. The other 3 go to the place.", why: "That is Overrun. The place has 5 Durability, the damage it can take, so 2 are left." },
        { btn: "End your turn", b: B([Y, O, T], [[], [], ["Your Unit", "3 damage"]]),
          what: "Your turn ends. Damage on Units is removed, but damage on a place stays." }],
      head: "The Lower Junction is hurt!", end: "Without the lean week, they could have paid for a card to help their Guard. Two more damage, and nobody controls it." },
    { goal: "Your goal: take The Lower Junction in one turn.",
      front: { name: "Hidden Supplies", icon: "crate", text: "Each player Generates 1 Supply this turn. The reveal controller Generates 1 additional Supply." },
      b: B([Y, O, T], [["2 Units"], [], []]),
      what: "Your turn starts. Your Supply refills to 5. The Vehicle card in your hand costs 6.", why: "A Vehicle can carry Units two roads. No enemy Unit is at The Lower Junction.",
      steps: [
        { btn: "Reveal the Frontier card", b: B([Y, O, T], [["2 Units"], [], []]),
          what: "A find, Hidden Supplies. You control the Frontier Deck this round, so you Generate 2 Supply. You have 7.", why: "The enemy Generates 1. Generated Supply is lost at the end of the turn." },
        { btn: "Play your Vehicle", b: B([Y, O, T], [["Vehicle", "2 Units"], [], []], 0),
          what: "You pay 6 Supply. Your Vehicle arrives at your gate yard.", why: "A Vehicle goes at a place you control that a road of your places joins to your gate yard." },
        { btn: "Drive two roads", b: B([Y, O, T], [[], [], ["Vehicle", "2 Units"]], 2),
          what: "One Unit drives and one rides along, through Rusted Track to their place.", why: "Driving exhausts the driver and the rider." },
        { btn: "See the takeover", b: B([Y, O, T], [[], [], ["Vehicle", "2 Units"]], 2),
          what: "Your Units are at their place, and they have no Units there.", why: "That starts a takeover. It must stay that way until your turn ends." },
        { btn: "End your turn", b: B([Y, O, Y], [[], [], ["Vehicle", "2 Units"]]),
          what: "Your turn ends with no enemy Unit there. The Lower Junction is yours." }],
      head: "The Lower Junction is yours!", end: "Without the find, you could not have paid for the Vehicle. A takeover does not give the Capture Reward." }];
  var coarse = window.matchMedia ? window.matchMedia("(pointer: coarse)") : null;
  var x = 0, k = 0;
  var wait = 150;
  function set(el, t) {
    if (el.textContent === t) return;
    fill(el, t);
    if (!t) return;
    el.classList.remove("d-in"); void el.offsetWidth;
    el.style.setProperty("--d", Math.min(wait, 550) + "ms"); wait += 80;
    el.classList.add("d-in");
  }
  function done() { return k >= X[x].steps.length; }
  function label() { fill(go, (coarse && coarse.matches ? "Tap" : "Click") + ": " + (done() ? "Try another example" : X[x].steps[k].btn)); }
  // r47 (UX review r46, M6): a marker that starts with "~" is exhausted: it shows a small card turned sideways and says so to
  // screen readers ("Companion, exhausted").
  function token(el, s, cls) {
    var ex = s.charAt(0) === "~", lab = ex ? s.slice(1) : s;
    el.className = cls + (/^Enemy/.test(lab) ? " enemy" : /damage/.test(lab) ? " hurt" : "") + (ex ? " ex" : "");
    if (el._v === s) return;
    el._v = s;
    set(el, lab);  // after the class, so a new marker keeps its arrival
    if (ex) { var v = document.createElement("span"); v.className = "vh"; v.textContent = ", exhausted"; el.appendChild(v); }
  }
  var camp = $("d-camp"), campPt = $("d-camp-pt");
  function board(b, names, c) {
    P.forEach(function (p, i) {
      var t = p.querySelectorAll(".pt"), own = b.own[i];
      set(p.querySelector(".pn"), names[i]);
      set(p.querySelector(".po"), own);
      p.className = "d-place " + (own === Y ? "mine" : own === O ? "open" : "theirs") + (b.at === i ? " here" : "");
      for (var j = 0; j < 2; j++) token(t[j], b.toks[i][j] || "", "pt");
    });
    if (camp) {
      camp.hidden = !c;
      camp.classList.toggle("here", b.at === -1);
      if (c) token(campPt, c, "pt");
    }
  }
  // r41l: who you are, the round, and the phase (Kyle: "make sure it's clear if you're player 1 or 2, make sure it's clear what
  // round it is in the game. Give it character"). Rounds fit rule book r7l: Supply 4 is Round 2, 5 is Round 3. The deck controller
  // is Player 2 in odd rounds and Player 1 in even rounds (example 6: you are Player 2 in Round 3, so you control it).
  // Phases: 0 Recovery, 1 Frontier, 2 Draw, 3 Operations, 4 Conflict, 5 End; one entry per screen (start, each step, the end).
  var HEAD = [{ you: 1, round: 2, ph: [0, 1, 1, 3, 3, 5] }, { you: 1, round: 3, ph: [0, 1, 3, 3, 5] }, { you: 1, round: 3, theirs: true, ph: [0, 1, 4, 4, 4, 4, 5] },
    { you: 2, round: 2, ph: [0, 1, 3, 4, 4, 5] }, { you: 1, round: 4, ph: [0, 1, 4, 4, 4, 5] }, { you: 2, round: 3, ph: [0, 1, 3, 3, 3, 5] }];
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
  // r47 (S4 + S2): the face-down Frontier card blows in on a dusty wind once per page view, when the whole card is on screen and
  // scrolling has stopped for about 1 second (window.DBN.whenSettled in site.js). Step 1 then turns it over, as before. A press first,
  // or motion off, shows it at once.
  var dust = null;
  function frontDust() {
    if (!window.DBN || dust) return;
    front.classList.add("dust-wait");
    dust = window.DBN.whenSettled(front, function (moving) {  // front never moves; the card inside it does
      if (!front.classList.contains("dust-wait")) return;
      front.classList.remove("dust-wait");
      if (!moving || !front.classList.contains("down")) return;
      window.DBN.hold(1500); demo.classList.add("dusting"); front.classList.add("dust-go");
      setTimeout(function () { front.classList.remove("dust-go"); demo.classList.remove("dusting"); }, 1150);
    });
  }
  function stopDust() { if (dust) dust.cancel(); front.classList.remove("dust-wait", "dust-go"); demo.classList.remove("dusting"); }
  function showFront(s, up) {
    var f = up ? s.front : DOWN, key = x + (up ? "u" : "d");
    front.hidden = false;
    if (up) stopDust();
    if (key === frontKey) return;
    frontKey = key;
    front.classList.toggle("down", !up);
    storm.querySelector(".d-sname").textContent = f.name;
    storm.querySelector("path").setAttribute("d", FICON[f.icon]);
    fill(front.querySelector(".d-stext"), f.text);
    storm.style.animation = "none";
    if (up) { void storm.offsetWidth; storm.style.animation = ""; }
  }
  function draw() {
    var s = X[x], n = s.steps.length, end = done();
    wait = 150;
    board(end ? s.steps[n - 1].b : k ? s.steps[k - 1].b : s.b, s.names || NAMES, s.camp ? s.camp[end ? n : k] : "");
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
  if (window.DBN) frontDust(); else document.addEventListener("DOMContentLoaded", frontDust);  // site.js (DBN) loads after this file
})();
