/* Try one turn, Advanced r9 (site r42c-k, Sitewright for the Leader). Successor of src/try-advanced-r8.js (kept): REVIEW-r42c-j-sonnet.md
   note: "Your Campsite is not a place on the map" was implied, not stated in the rule book. That wrong option (example 3, choice 1) is now
   "Pick none of them", answered from the lion's own text shown in the example ("that player picks one of their Units or Companions on
   the map"). r8's text follows.
   Try one turn, Advanced r8 (site r42c-i). Successor of src/try-advanced-r7.js (kept). The Leader (2026-11-19),
   on Kyle's "don't make up things": no inferred rule is published. Two wrong options whose reasons were inferences, not rule-book words,
   are replaced: example 1's "Attack their Guard" (now "Go back to the Move step", answered with the rule book's own words) and
   example 3's "Attack their Companion" (now the Unit the lion defeated, answered from the example itself). r7's text follows.
   Try one turn, Advanced r7 (site r42c-h). Successor of src/try-advanced-r6.js (kept): REVIEW-r42c-g-sonnet.md
   note 1, the "Keep the Supply" reason names both Supply. r6's text follows.
   Try one turn, Advanced r6 (site r42c-g). Successor of src/try-advanced-r5.js (kept). Takes
   site-r42c/REVIEW-r42c-f-sonnet.md (FAIL, text fixes): example 2's Tactic costs 2, as the real Warden Tactic does (1 Supply kept at
   your End plus 1 Generated); example 3: a Companion in its Campsite cannot be attacked (only the Leader there, from its home Anchor);
   example 1's end no longer assumes their Guard defended, and its goal names what the right moves do; the one-road reason says why;
   their stats are in example 2's setup; "they have no Supply left"; focus after "Play it again". r5's text follows.
   Try one turn, Advanced r5 (site r42c-f). Successor of src/try-advanced-r4.js (kept): example 2's pill
   "Your Guard, Your Unit" ran past its tile on a 375 px phone; it reads "Guard + Unit" (blue = yours). r4's text follows.
   Try one turn, Advanced r4 (site r42c-e). Successor of src/try-advanced-r3.js (kept): in example 2, Rusted
   Track uses the printed Durability 4 of the card it stands in for (with 2 damage), not 5. r3's text follows.
   Try one turn, Advanced r3 (site r42c-d). Successor of src/try-advanced-r2.js (kept): example 3's first choice
   gets a third option (your Companion in your Campsite, which the lion cannot fight: the Campsite is not on the map). r2's text follows.
   Try one turn, Advanced r2 (site r42c-c). Successor of src/try-advanced.js (kept).
   Kyle (2026-11-18, relayed by the Leader): "6 walkthroughs 3 advanced 1 final stand": three Advanced examples on a 5-place board, each
   with 2-3 harder real moves, and a way to try another; "i want the advanced to have you make the choice without a hint (unless you want
   one)": no prompt says which move to make; a wrong pick explains the rule and lets you pick again; the Hint button shows one hint for the
   current choice, only when pressed. Nothing is stored (no browser storage, no cookies). "Words matter ... keywords ... in BOLD": text is
   built with fill(), which shows the keywords of design/game-words-r1/GAME-WORDS-r2.md in bold (never as HTML).
   Every move is in rule book r7k/r7l; every Frontier card is a real card's effect in plain words under a stand-in name. No Raider card
   words are shown. Keyboard: Tab and Enter. No timers. r2 also takes REVIEW-r42c-sonnet.md's notes (all five exhaust choices offered,
   no scripted enemy choice stated as fact, the Capture Reward named, focus kept after a wrong pick, the hint read out, a takeover marker,
   the skipped Explore step said).
   r52 walkthroughs draft (Sitewalk QA, 2026-11-27): words only, for a first-time reader (Kyle's QA ask; findings in
   site-r52-walkthroughs-draft/FINDINGS-r52wt.md). No rule, number, choice or answer changed. */
(function () {
  function $(id) { return document.getElementById(id); }
  var simple = $("demo"), adv = $("adv"), bS = $("d-simple"), bA = $("d-adv");
  if (!simple || !adv || !bS || !bA) return;
  var say = $("a-say"), ch = $("a-choices"), hintB = $("a-hint"), hintT = $("a-hint-text"), again = $("a-again"), other = $("a-other");
  var P = [0, 1, 2, 3, 4].map(function (i) { return $("a-p" + i); });
  var PH = [].slice.call(adv.querySelectorAll(".d-phases li"));
  var Y = "Yours", N = "Nobody", T = "Theirs", TK = "Takeover";
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
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) fill(e, text); return e; }

  // Each example: who you are, the round, whose turn, the place names, the board before each choice and after the last (own, toks),
  // the phase for each choice and the end (0 Recovery, 1 Frontier, 2 Draw, 3 Operations, 4 Conflict, 5 End), the choices, the end.
  var X = [
    { name: "Push forward", you: 1, round: 4, theirs: false,
      goal: "Your goal: take two Locations this turn, and leave The Lower Junction with no Durability.",
      names: ["Your gate yard", "Rusted Track", "Mountain Road", "The Lower Junction", "Their gate yard"],
      boards: [
        { own: [Y, N, T, T, T], toks: [["Your Unit", "Vehicle"], ["Your Unit"], [], ["Your Unit", "Enemy Guard"], []] },
        { own: [Y, N, T, T, T], toks: [["Your Unit", "Vehicle"], ["Your Unit"], [], ["Your Unit", "Enemy Guard"], []] },
        { own: [Y, N, TK, T, T], toks: [[], ["Your Unit"], ["Your Unit", "Vehicle"], ["Your Unit", "Enemy Guard"], []] },
        { own: [Y, Y, TK, T, T], toks: [[], ["Your Unit"], ["Your Unit", "Vehicle"], ["Your Unit", "Enemy Guard"], []] },
        { own: [Y, Y, Y, N, T], toks: [[], ["Your Unit"], ["Your Unit", "Vehicle"], ["Your Unit"], []] }],
      phase: [1, 3, 3, 4, 5],
      steps: [
        { title: "Frontier: Wall of Wind",
          what: "A storm. Each player must exhaust one of their ready Units or Companions. Your ready ones are your Companion in your Campsite, the Unit at your gate yard, the Unit at Rusted Track and the Unit at The Lower Junction.",
          ask: "Which one do you exhaust?",
          hint: "Look at what each Unit on the map could still do this turn if it stays ready.",
          opts: [
            { t: "The Unit at Rusted Track", no: "That Unit never moved this turn and no enemy is there. Ready, it could Capture Rusted Track. Exhausted, it cannot." },
            { t: "The Unit at your gate yard", no: "That Unit is the only one who can drive your Vehicle, and a driver must be ready." },
            { t: "Your Companion in your Campsite", ok: "Your Companion rests in your Campsite. Every Unit on the map stays ready. The enemy exhausts one of theirs too." },
            { t: "The Unit at The Lower Junction", no: "That Unit came there last turn, so it can attack there now. An exhausted Unit cannot attack." }] },
        { title: "Operations: the Move step",
          what: "Mountain Road is theirs, but none of their Units stand there. The Lower Junction has 5 Durability and already 2 damage. Your Vehicle is at your gate yard.",
          ask: "What do you move?",
          hint: "A Location the enemy controls becomes yours at the End of your turn if only your Units stand there. And a Unit that moves cannot Capture.",
          opts: [
            { t: "Move the Unit at Rusted Track to Mountain Road", no: "It would stand alone on Mountain Road, but a Unit that moves cannot Capture this turn. Rusted Track would stay nobody's." },
            { t: "Drive the Vehicle two roads, to Mountain Road", ok: "Your Unit drives through Rusted Track to Mountain Road. Driving exhausts it. Only your Units stand on Mountain Road now, so a takeover starts. If only your Units stay there, with no enemy Unit, until the End of your turn, Mountain Road becomes yours." },
            { t: "Drive the Vehicle one road, to Rusted Track", no: "Then the Vehicle stops at Rusted Track, where your Unit already stands, and nothing new starts. A Vehicle can go up to two roads, and none of their Units stand on Mountain Road." }] },
        { title: "Operations: the Capture step",
          what: "You skip the Explore step. Exploring is another action that exhausts a Unit, and you still need your two ready Units: one at Rusted Track and one at The Lower Junction. Your Unit on Rusted Track did not move this turn.",
          ask: "What do you Capture?",
          hint: "Capture works only on a Location nobody controls, with a ready Unit that did not move there this turn.",
          opts: [
            { t: "Capture Mountain Road with the Unit you drove there", no: "It moved there this turn, so it cannot Capture, and Capture is only for a Location nobody controls. Mountain Road comes to you by the takeover instead." },
            { t: "Skip the Capture step", no: "Then Rusted Track stays nobody's, and your ready Unit does nothing." },
            { t: "Capture Rusted Track", ok: "Your Unit exhausts and takes Rusted Track, with its Capture Reward. It is yours now." }] },
        { title: "Conflict",
          what: "Your Unit at The Lower Junction has 5 Attack and Overrun: damage left over after it defeats a Guard goes on to the Location or Leader the Guard protected. Their Guard there has 2 Health. You can make one attack.",
          ask: "What does your Unit attack?",
          hint: "Overrun sends extra damage on to the Location the defender was protecting.",
          opts: [
            { t: "Go back to the Move step and move your Unit first", no: "You cannot. As the game’s rule book says, “Do each phase in order. You cannot go back to an earlier phase.”" },
            { t: "Attack The Lower Junction itself", ok: "If their Guard defends the Location, your 5 damage defeats it and Overrun sends the other 3 on. If it does not, all 5 hit the Location. Either way, with its 2 damage, the Location has no Durability left. It now belongs to nobody, and its damage is removed." },
            { t: "Skip the attack", no: "Then The Lower Junction keeps 3 Durability, and their Guard stays." }] }],
      end: "Your takeover of Mountain Road finishes: it is yours. You took 2 Locations this turn, and The Lower Junction belongs to nobody now. If their Guard defended, it is gone and your Unit is the only one there: if it stays alone, you take The Lower Junction over at the End of your next turn." },

    { name: "Hold the line", you: 1, round: 5, theirs: true,
      goal: "Your goal: keep Rusted Track yours through the enemy's attack.",
      names: ["Your gate yard", "Rusted Track", "Mountain Road", "The Lower Junction", "Their gate yard"],
      boards: [
        { own: [Y, Y, T, T, T], toks: [[], ["Guard + Unit", "2 Enemy Units"], [], [], []] },
        { own: [Y, Y, T, T, T], toks: [[], ["Guard + Unit", "2 Enemy Units"], [], [], []] },
        { own: [Y, Y, T, T, T], toks: [[], ["Your Guard", "Enemy Unit"], [], [], []] }],
      phase: [4, 4, 5],
      steps: [
        { title: "Their Conflict: Guards",
          what: "Their turn. Their Frontier card was Hidden Supplies, so you Generated 1 Supply on their turn. Now both of their Units attack at Rusted Track. Each of their Units has 3 Attack and 3 Health. One attacks your Unit, which has 2 Health and 1 Retaliation (the damage it deals back when attacked). The other attacks Rusted Track itself. Rusted Track has 4 Durability and already 2 damage. Your Guard there has 4 Health and 2 Retaliation.",
          ask: "What does your Guard defend?",
          hint: "Count what each target can take. A Location with no Durability left belongs to nobody.",
          opts: [
            { t: "Guard your Unit", no: "Your Unit would live, but the Location would take 3 more damage: 5, more than its 4 Durability. Rusted Track would belong to nobody." },
            { t: "Guard Rusted Track", ok: "Your Guard defends the Location and exhausts. Your Unit, attacked with no Guard, defends itself." },
            { t: "Declare no Guard", no: "Then the Location takes 3 and runs out of Durability, and your Unit is defeated too." }] },
        { title: "Their Conflict: the second response window",
          what: "Guards are declared. Now comes the second response window: a pause where each player can play a card. You hold a Tactic, a one-time card, that costs 2: one defending Unit or Companion gets +1 Retaliation until combat ends. You kept 1 Supply at the End of your turn, and you Generated 1 more, so you have 2.",
          ask: "What do you do?",
          hint: "Retaliation is dealt at the same time as their damage. Which of their Units can you defeat?",
          opts: [
            { t: "Play the Tactic on your Unit", no: "Your Unit would hit back for 2. The Unit attacking it has 3 Health, so it lives, and your Guard's 2 does not defeat the other one either." },
            { t: "Keep the Supply", no: "Then your Guard hits back for only 2, and the Unit attacking the Location lives. Your 2 Supply does nothing now, and the 1 you Generated is lost at the End of this turn anyway." },
            { t: "Play the Tactic on your Guard", ok: "Your Guard now has 3 Retaliation. It takes 3 damage and lives, with 4 Health. It hits back for 3 and defeats the Unit attacking the Location. Your Unit takes 3 and is defeated, after hitting back for 1." }] }],
      end: "Rusted Track is still yours, with no new damage. You lost a Unit, and they lost one. At the End, damage on Units is removed; the Location keeps its 2 damage. Your Guard readies at the start of your turn." },

    { name: "Break their Leader", you: 2, round: 8, theirs: false,
      goal: "Your goal: win this turn. Their Leader, in their Campsite, has 2 Health left.",
      names: ["Your gate yard", "Rusted Track", "Mountain Road", "The Lower Junction", "Their gate yard"],
      boards: [
        { own: [Y, Y, T, N, Y], toks: [[], [], [], ["Your Unit"], ["Your Unit"]] },
        { own: [Y, Y, T, N, Y], toks: [[], [], [], [], ["Your Unit"]] },
        { own: [Y, Y, T, N, Y], toks: [[], [], [], [], ["Your Unit"]] }],
      phase: [4, 4, 4],
      steps: [
        { title: "Conflict starts: Mountain lion",
          what: "This turn's Frontier card was a lean week: each player lost 1 Supply. They have no Supply left, so they cannot pay for a card in your attack. A mountain lion is still in play from an earlier turn: at the start of each player's Conflict, that player picks one of their Units or Companions on the map, and it and the lion hit each other. The lion has 4 Attack. Your Unit at their gate yard (you took it over) has 5 Attack, Overrun and 4 Health. Your Unit at The Lower Junction has 2 Attack and 3 Health.",
          ask: "Which of your Units fights the lion?",
          hint: "Only a Unit at their gate yard can attack their Leader in their Campsite, and only while you control that gate yard.",
          opts: [
            { t: "Your Unit at their gate yard", no: "It would take 4 damage, all of its 4 Health, and be defeated before it can attack." },
            { t: "Your Unit at The Lower Junction", ok: "It takes 4 and is defeated, after hitting the lion for 2. Your Unit at their gate yard is untouched." },
            { t: "Pick none of them", no: "You cannot. At the start of your Conflict you must pick one of your Units or Companions on the map to fight the lion." }] },
        { title: "Conflict: your attack",
          what: "Your Unit at their gate yard is ready. Their Leader is in their Campsite, with their Companion beside it. A ready Companion in its Campsite can Guard its Leader there. Their Companion has 3 Health.",
          ask: "What does your Unit attack?",
          hint: "Overrun sends extra damage on to the Location or Leader the defender was protecting.",
          opts: [
            { t: "Attack with your Unit from The Lower Junction", no: "That Unit fought the mountain lion and was defeated, so it cannot attack." },
            { t: "Attack their Leader", ok: "If their Companion Guards their Leader, your 5 damage defeats it (3 Health) and Overrun sends the other 2 on to their Leader. If it does not, all 5 hit their Leader. Either way, their Leader had 2 Health left, so it is defeated. The game ends at once: you win." },
            { t: "Attack their gate yard", no: "Their gate yard is yours now. You can attack a Location only if it is not yours." }] }],
      end: "You broke their Leader. That is one of the two ways to win; the other is to hold all 9 Locations at the end of a turn." }
  ];

  var x = 0, k = 0;
  function board(b, names) {
    P.forEach(function (p, i) {
      var own = b.own[i];
      p.className = "d-place " + (own === Y ? "mine" : own === N ? "open" : "theirs");
      fill(p.querySelector(".pn"), names[i]);
      fill(p.querySelector(".po"), own);
      var t = p.querySelectorAll(".pt");
      for (var j = 0; j < 2; j++) {
        var s = b.toks[i][j] || "";
        t[j].className = "pt" + (/Enemy/.test(s) && !/Your/.test(s) ? " enemy" : "");
        fill(t[j], s);
      }
    });
  }
  function phase(n) {
    PH.forEach(function (li, i) {
      li.className = i < n ? "done" : i === n ? "now" : "";
      if (i === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
  }
  function head() {
    var e = X[x];
    $("a-you").textContent = "You: Player " + e.you + ", the Wardens";
    $("a-them").textContent = "Them: Player " + (3 - e.you) + ", the Raiders";
    $("a-you-s").classList.toggle("now", !e.theirs);
    $("a-them-s").classList.toggle("now", !!e.theirs);
    $("a-round").textContent = "Round " + e.round;
    $("a-turn").textContent = e.theirs ? "Their turn" : "Your turn";
    fill($("a-goal"), e.goal);
  }
  function draw(note) {
    var e = X[x], end = k >= e.steps.length, s = end ? null : e.steps[k];
    board(e.boards[Math.min(k, e.boards.length - 1)], e.names);
    phase(e.phase[k]);
    head();
    say.textContent = "";
    say.appendChild(el("p", "d-step", "Advanced " + (x + 1) + " of " + X.length + ": " + e.name + " · " + (end ? "Done" : "Choice " + (k + 1) + " of " + e.steps.length + ", " + s.title)));
    if (note) say.appendChild(el("p", "a-note", note));
    say.appendChild(el("p", "d-what", end ? e.end : s.what));
    if (!end) say.appendChild(el("p", "d-why", s.ask));
    ch.textContent = "";
    hintT.textContent = "";
    hintB.hidden = end; again.hidden = !end; other.hidden = false;
    if (end) return;
    s.opts.forEach(function (o) {
      var b = el("button", "d-act a-opt", o.t);
      b.type = "button";
      b.addEventListener("click", function () {
        if (o.ok) { k += 1; draw("Good move. " + o.ok); focusFirst(); return; }
        b.disabled = true;
        var old = say.querySelector(".a-note"), p = el("p", "a-note", "That does not work. " + o.no);
        if (old) say.replaceChild(p, old); else say.insertBefore(p, say.children[1] || null);
        var next = ch.querySelector("button:not([disabled])");  // focus stays in the choices after a wrong pick
        if (next) { try { next.focus({ preventScroll: true }); } catch (err) { next.focus(); } }
      });
      ch.appendChild(b);
    });
  }
  // After a good move, focus goes to the first new choice (or to "Play it again" at the end), so keyboard users keep their place.
  function focusFirst() {
    var f = again.hidden ? ch.querySelector("button") : again;
    if (!f) return;
    try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); }
  }
  hintB.addEventListener("click", function () {
    var e = X[x];
    if (k >= e.steps.length) return;
    fill(hintT, "Hint: " + e.steps[k].hint);  // a live region: the hint is read out when it appears
  });
  again.addEventListener("click", function () { k = 0; draw(); focusFirst(); });  // the button hides itself, so focus moves to the first choice
  other.addEventListener("click", function () { x = (x + 1) % X.length; k = 0; draw(); });
  $("a-back").addEventListener("click", function () { mode(false); bS.focus(); });
  function mode(isAdv) {
    adv.hidden = !isAdv; simple.hidden = isAdv;
    bA.setAttribute("aria-pressed", isAdv ? "true" : "false");
    bS.setAttribute("aria-pressed", isAdv ? "false" : "true");
    if (isAdv) { k = 0; draw(); }
  }
  bS.addEventListener("click", function () { mode(false); });
  bA.addEventListener("click", function () { mode(true); });
})();
