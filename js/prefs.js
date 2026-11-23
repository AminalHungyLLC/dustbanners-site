/* Dustbanners site r47: puts back the visitor's saved Light/Dark and Motion Off choices before the page is drawn.
   Loaded early in <head> from the site itself, so the CSP ('self') allows it. It replaces the inline head script, which the
   CSP blocked from r43 to r46 (UX review r46, finding H1). Same storage keys as site.js. */
(function () {
  try {
    var r = document.documentElement;
    var t = localStorage.getItem("dustbanners-theme");
    if (t === "light" || t === "dark") r.classList.add("theme-" + t);
    if (localStorage.getItem("dustbanners-motion") === "off") r.classList.add("motion-off");
  } catch (e) {}
})();
