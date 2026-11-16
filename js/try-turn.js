/* Try one turn: a taste with simplified stand-in steps, not the real rules. Keyboard: Tab and Enter. No timers. */
(function () {
  function $(id) { return document.getElementById(id); }
  var st = $("d-status"); if (!st) return;
  var places = [].slice.call(document.querySelectorAll(".d-place")), bu = $("d-unit"), bt = $("d-tactic"), S;
  function say(t) { st.textContent = t; }
  function draw() {
    $("d-supply").textContent = S.supply;
    var own = ["Yours", S.unit === 1 ? "Yours now" : "Open", "An enemy Unit holds it"];
    places.forEach(function (p, i) {
      var here = S.unit === i;
      p.classList.toggle("here", here);
      p.classList.toggle("mine", i === 0 || (i === 1 && S.unit === 1));
      p.querySelector(".po").textContent = own[i] + (here ? ". Your Unit is here." : "");
    });
    bu.setAttribute("aria-disabled", S.unit >= 0 || S.done ? "true" : "false");
    bt.setAttribute("aria-disabled", S.tactic || S.done ? "true" : "false");
  }
  function reset() { S = { supply: 3, unit: -1, tactic: false, done: false }; draw(); say("You have 3 Supply. Play the Stand-in Unit to start."); }
  function over() { if (S.done) say("This turn is over. Press Start over to try again."); return S.done; }
  bu.addEventListener("click", function () {
    if (over()) return;
    if (S.unit >= 0) return say("Your Unit is already out. Pick a place to send it.");
    S.supply -= 2; S.unit = 0; draw();
    say("You paid 2 Supply. Your Stand-in Unit stands at your depot. Now pick a place to send it.");
  });
  places.forEach(function (p, i) {
    p.addEventListener("click", function () {
      if (over()) return;
      if (S.unit < 0) return say("Play your Stand-in Unit first.");
      if (i === S.unit) return say("Your Unit is already there.");
      if (S.tactic) return say("Your Unit dug in at Rusted Track. It stays there this turn. End your turn when you are ready.");
      if (Math.abs(i - S.unit) > 1) return say("Too far. In this taste a Unit goes one place at a time.");
      if (i === 2) return say("An enemy Unit holds the Lower Junction. One Unit will not take it this turn. Hold Rusted Track instead.");
      S.unit = i; draw();
      say(i === 1 ? "Your Unit takes Rusted Track. You have " + S.supply + " Supply left. Play the Stand-in Tactic to dig in, or end your turn." : "Your Unit goes back to your depot.");
    });
  });
  bt.addEventListener("click", function () {
    if (over()) return;
    if (S.tactic) return say("You already played it. It is in the Ditch.");
    if (S.unit < 0) return say("Play your Stand-in Unit first.");
    if (S.unit !== 1) return say("Send your Unit to Rusted Track first. Then it can dig in there.");
    if (S.supply < 1) return say("Not enough Supply.");
    S.supply -= 1; S.tactic = true; draw();
    say("You paid 1 Supply. Your Unit digs in. The Tactic goes to your discard pile, the Ditch. Now end your turn.");
  });
  $("d-end").addEventListener("click", function () {
    if (over()) return;
    S.done = true;
    var w = "Your turn ends. When the next turn starts, the Frontier Deck turns up a stand-in storm, Wall of Wind. ";
    if (S.unit === 1 && S.tactic) say(w + "Your Unit dug in and holds Rusted Track. You hold 2 of 3 places. The real valley has 9.");
    else if (S.unit === 1) { S.unit = 0; say(w + "Your Unit is pushed back to your depot. You hold 1 of 3 places. Start over and dig in first."); }
    else say(w + "It blows across an empty track. You hold 1 of 3 places. Start over and send a Unit out.");
    draw();
  });
  $("d-reset").addEventListener("click", reset);
  reset();
})();
